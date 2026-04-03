<template>
  <Transition name="bh-mount" appear>
    <div v-if="state !== 'idle'" class="bh-wrapper">
      <svg
        ref="svgRef"
        class="bh-svg"
        :style="{ width: svgPx, height: svgPx, marginBottom: svgMarginBottom }"
        viewBox="-68 -68 136 136"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="bh-core-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" />
            <stop offset="65%" stop-color="#060606" />
            <stop offset="100%" stop-color="#1c1c1c" />
          </radialGradient>
          <radialGradient id="bh-shadow-grad" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stop-color="#000000" stop-opacity="1" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
          <filter
            id="bh-photon-glow"
            x="-120%"
            y="-120%"
            width="340%"
            height="340%"
          >
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="2.2"
              result="blur"
            />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          v-for="(ring, i) in activeRings"
          :key="ring.r"
          :data-bh-idx="i"
          cx="0"
          cy="0"
          :r="ring.r"
          fill="none"
          :stroke="ring.stroke"
          :stroke-width="ring.strokeWidth"
          :stroke-dasharray="
            ring.arcs[0] +
            ' ' +
            ring.gaps[0] +
            ' ' +
            ring.arcs[1] +
            ' ' +
            ring.gaps[1]
          "
          stroke-linecap="round"
        />
        <circle cx="0" cy="0" r="23" fill="url(#bh-shadow-grad)" />
        <circle
          class="bh-photon"
          cx="0"
          cy="0"
          r="19.5"
          fill="none"
          stroke="#f1f5f9"
          stroke-width="1.2"
          opacity="0.9"
          filter="url(#bh-photon-glow)"
        />
        <circle
          cx="0"
          cy="0"
          r="22"
          fill="none"
          stroke="#374151"
          stroke-width="0.5"
          opacity="0.35"
        />
        <circle cx="0" cy="0" r="17" fill="url(#bh-core-grad)" />
      </svg>
      <span ref="labelRef" class="bh-label" :class="labelSizeClass">{{
        text
      }}</span>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from "vue";
import anime from "animejs";

const props = defineProps({
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md", "lg"].includes(v),
  },
  text: {
    type: String,
    default: "Computing...",
  },
  state: {
    type: String,
    default: "loading",
    validator: (v) => ["loading", "success", "error"].includes(v),
  },
  theme: {
    type: String,
    default: "mono",
    validator: (v) =>
      ["mono", "orange", "blue", "purple", "teal", "red"].includes(v),
  },
  escalate: {
    type: Boolean,
    default: false,
  },
});

const R_S = 13; // Schwarzschild radius
const R_PH = 1.5 * R_S; // photon sphere  (= 19.5, matches SVG photon ring)
const R_ISCO = 3 * R_S; // innermost stable circular orbit (= 39)

const BASE_R = 27; // innermost accretion ring radius (inside ISCO -> plunge zone)
const MAX_R = 90; // outermost ring radius

// Orbital period at ISCO, used as anchor for all other periods
const T_ISCO = 2800; // ms

// Photon-sphere orbital period (Keplerian extrapolation): T ∝ r^1.5
const T_PHOTON_SPHERE = Math.round(T_ISCO * Math.pow(R_PH / R_ISCO, 1.5)); // ≈ 990 ms

const INNER_WIDTH = 4.5;
const OUTER_WIDTH = 0.6;
const TOTAL_ARC = 0.353; // total arc fraction (arc₁ + arc₂) of circumference

const SIZE_MAP = { sm: 80, md: 128, lg: 192 };
const RING_COUNT = { sm: 3, md: 5, lg: 6 };

function hexLerp(a, b, t) {
  const p = (h) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [ar, ag, ab] = p(a),
    [br, bg, bb] = p(b);
  return (
    "#" +
    [ar, ag, ab]
      .map((v, i) =>
        Math.round(v + ([br, bg, bb][i] - v) * t)
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

const circ = (r) => 2 * Math.PI * r;

// GR orbital period
// Outside ISCO: Keplerian  T ∝ r^1.5  (coordinate time seen from infinity).
// Inside  ISCO: plunging geodesic with angular momentum conserved at the ISCO
//               value -> ω ∝ 1/r²  ->  T ∝ r²  (faster-than-Keplerian inspiral).
function orbitalPeriod(r) {
  if (r >= R_ISCO) return T_ISCO * Math.pow(r / R_ISCO, 1.5);
  return T_ISCO * Math.pow(r / R_ISCO, 2);
}

// Relativistic Doppler beaming
// Orbital velocity β = v/c = √(r_s / 2r).  The approaching limb is boosted by
// D ∝ 1/(1−β·cos θ)^α; the receding limb dimmed by D ∝ 1/(1+β·cos θ)^α.
function beamingArcs(r) {
  const beta = Math.sqrt(R_S / (2 * Math.max(r, R_S + 1)));
  const bEff = beta * 0.8;
  const bright = Math.pow(1 / Math.max(0.05, 1 - bEff), 1.5);
  const dim = Math.pow(1 / (1 + bEff), 1.5);
  const sum = bright + dim;
  return [(TOTAL_ARC * bright) / sum, (TOTAL_ARC * dim) / sum];
}

// Accretion-disk color: [inner-hot, peak, outer-dark]
const THEMES = {
  orange: ["#fff4d0", "#f97316", "#150300"],
  blue: ["#e0f2ff", "#3b82f6", "#03080f"],
  purple: ["#ede9fe", "#6366f1", "#03030f"],
  teal: ["#ccfbf1", "#14b8a6", "#030f0d"],
  red: ["#fff1f0", "#ef4444", "#150000"],
};

function diskColor(t, theme) {
  const [inner, peak, outer] = THEMES[theme] ?? THEMES.orange;
  if (t < 0.45) return hexLerp(inner, peak, t / 0.45);
  return hexLerp(peak, outer, (t - 0.45) / 0.55);
}

// Monochrome palette
const MONO_INNER_COLOR = "#e2e8f0"; // near-white
const MONO_OUTER_COLOR = "#060c15"; // near-black
const MONO_ARC1_RATIO = 0.207; // symmetric fixed arcs
const MONO_ARC2_RATIO = 0.146;

// Ring geometry
function buildRings(n, theme) {
  const isColored = theme !== "mono";
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : i / (n - 1);
    const r = Math.round(BASE_R * Math.pow(MAX_R / BASE_R, t));
    const c = circ(r);
    const [a1Ratio, a2Ratio] = isColored
      ? beamingArcs(r)
      : [MONO_ARC1_RATIO, MONO_ARC2_RATIO];
    const a1 = Math.round(c * a1Ratio);
    const a2 = Math.round(c * a2Ratio);
    const g = Math.round((c - a1 - a2) / 2);
    return {
      r,
      period: orbitalPeriod(r),
      stroke: isColored
        ? diskColor(t, theme)
        : hexLerp(MONO_INNER_COLOR, MONO_OUTER_COLOR, t),
      strokeWidth: +(INNER_WIDTH + (OUTER_WIDTH - INNER_WIDTH) * t).toFixed(1),
      arcs: [a1, a2],
      gaps: [g, g],
    };
  });
}

const svgPx = computed(() => `${SIZE_MAP[props.size]}px`);
const labelSizeClass = computed(
  () => ({ sm: "text-[0.6rem]", md: "text-xs", lg: "text-sm" }[props.size])
);

const activeRings = computed(() =>
  buildRings(RING_COUNT[props.size], props.theme)
);

const MAX_ESCALATED_RINGS = 50;
let escalationTimer = null;
let ringAddInterval = null;
let escalatedCircles = [];
const svgMarginBottom = computed(() => {
  const displayPx = SIZE_MAP[props.size];
  const rMax = activeRings.value[activeRings.value.length - 1].r;
  const scale = displayPx / 136;
  const overflow = Math.max(0, rMax * scale - displayPx / 2);
  return `${Math.ceil(overflow) + 6}px`;
});

const svgRef = ref(null);
const labelRef = ref(null);
let bhAnims = [];

function startBHAnim() {
  stopBHAnim();
  if (labelRef.value) labelRef.value.style.letterSpacing = "";
  const el = svgRef.value;
  if (!el) return;

  if (props.escalate) escalationTimer = setTimeout(startEscalation, 10_000);

  activeRings.value.forEach(({ r, period }, i) => {
    const target = el.querySelector(`[data-bh-idx="${i}"]`);
    bhAnims.push(
      anime({
        targets: target,
        strokeDashoffset: [0, -circ(r)],
        duration: period,
        easing: "linear",
        loop: true,
      })
    );
    bhAnims.push(
      anime({
        targets: target,
        scale: [1.45, 1],
        opacity: [0, 1],
        duration: 900,
        delay: (activeRings.value.length - 1 - i) * 80,
        easing: "easeOutCubic",
      })
    );
  });

  bhAnims.push(
    anime({
      targets: el.querySelector(".bh-photon"),
      opacity: [0, 0.9, 0.5],
      duration: T_PHOTON_SPHERE,
      easing: "easeInOutSine",
      loop: true,
      delay: activeRings.value.length * 80,
    })
  );
}

function playSuccessAnim() {
  stopEscalation();
  const extraCircles = [...escalatedCircles];
  escalatedCircles = [];
  const el = svgRef.value;
  if (!el) return;

  const successStagger = extraCircles.length > 1 ? 200 / (extraCircles.length - 1) : 0;
  extraCircles.forEach((c, i) => {
    bhAnims.push(
      anime({
        targets: c,
        r: 0,
        opacity: 0,
        duration: 700,
        delay: i * successStagger,
        easing: "easeInQuart",
        complete: () => c.parentNode?.removeChild(c),
      })
    );
  });

  if (labelRef.value) {
    bhAnims.push(
      anime({
        targets: labelRef.value,
        letterSpacing: "0.1em",
        duration: 900,
        easing: "easeOutCubic",
      })
    );
  }

  const n = activeRings.value.length;
  activeRings.value.forEach((_, i) => {
    const target = el.querySelector(`[data-bh-idx="${i}"]`);
    if (!target) return;
    // outer rings start first, cascade inward
    const delay = (n - 1 - i) * 110;
    bhAnims.push(
      anime({
        targets: target,
        r: 0,
        opacity: 0,
        duration: 750,
        delay,
        easing: "easeInQuart",
      })
    );
  });

  // photon ring flares then collapses last
  bhAnims.push(
    anime({
      targets: el.querySelector(".bh-photon"),
      opacity: [0.9, 1, 0],
      r: 0,
      duration: 650,
      delay: n * 110,
      easing: "easeInQuart",
    })
  );
}

function playErrorAnim() {
  stopEscalation();
  const extraCircles = [...escalatedCircles];
  escalatedCircles = [];
  const el = svgRef.value;
  if (!el) return;

  const errorStagger = extraCircles.length > 1 ? 300 / (extraCircles.length - 1) : 0;
  extraCircles.forEach((c, i) => {
    const r = parseFloat(c.getAttribute("r") || 0);
    bhAnims.push(
      anime({
        targets: c,
        r: r + 60,
        opacity: 0,
        strokeWidth: 0,
        duration: 1400,
        delay: i * errorStagger,
        easing: "easeOutQuart",
        complete: () => c.parentNode?.removeChild(c),
      })
    );
  });

  if (labelRef.value) {
    bhAnims.push(
      anime({
        targets: labelRef.value,
        letterSpacing: "0.1em",
        duration: 400,
        easing: "easeOutQuart",
      })
    );
  }

  // inner rings erupt first, cascade outward
  activeRings.value.forEach(({ r }, i) => {
    const target = el.querySelector(`[data-bh-idx="${i}"]`);
    if (!target) return;
    bhAnims.push(
      anime({
        targets: target,
        r: r + 60,
        opacity: 0,
        strokeWidth: 0,
        duration: 1600,
        delay: i * 120,
        easing: "easeOutQuart",
      })
    );
  });

  bhAnims.push(
    anime({
      targets: el.querySelector(".bh-photon"),
      r: 52,
      opacity: [0.9, 1, 0],
      strokeWidth: 0,
      duration: 1200,
      easing: "easeOutQuart",
    })
  );
}

function startEscalation() {
  const el = svgRef.value;
  if (!el) return;

  if (props.theme === "mono") {
    const n = activeRings.value.length;
    activeRings.value.forEach((_, i) => {
      const t = n === 1 ? 0 : i / (n - 1);
      const target = el.querySelector(`[data-bh-idx="${i}"]`);
      if (target)
        anime({
          targets: target,
          stroke: diskColor(t, "orange"),
          duration: 5000,
          easing: "easeInOutQuad",
        });
    });
  }

  const escalationTheme = props.theme === "mono" ? "orange" : props.theme;
  const fullRings = buildRings(MAX_ESCALATED_RINGS, escalationTheme);
  const initCount = RING_COUNT[props.size];
  const anchor = el.querySelector('[fill="url(#bh-shadow-grad)"]');
  let idx = initCount;

  if (labelRef.value) {
    bhAnims.push(
      anime({
        targets: labelRef.value,
        letterSpacing: "0.8em",
        duration: 30_000,
        easing: "easeInQuad",
      })
    );
  }

  ringAddInterval = setInterval(() => {
    if (idx >= MAX_ESCALATED_RINGS) {
      clearInterval(ringAddInterval);
      ringAddInterval = null;
      return;
    }
    const ring = fullRings[idx];
    const ns = "http://www.w3.org/2000/svg";
    const c = document.createElementNS(ns, "circle");
    c.setAttribute("cx", "0");
    c.setAttribute("cy", "0");
    c.setAttribute("r", String(ring.r));
    c.setAttribute("fill", "none");
    c.setAttribute("stroke", ring.stroke);
    c.setAttribute("stroke-width", String(ring.strokeWidth));
    c.setAttribute(
      "stroke-dasharray",
      `${ring.arcs[0]} ${ring.gaps[0]} ${ring.arcs[1]} ${ring.gaps[1]}`
    );
    c.setAttribute("stroke-linecap", "round");
    c.setAttribute("opacity", "0");
    el.insertBefore(c, anchor);
    escalatedCircles.push(c);

    anime({ targets: c, opacity: [0, 1], duration: 700, easing: "easeInSine" });
    bhAnims.push(
      anime({
        targets: c,
        strokeDashoffset: [0, -circ(ring.r)],
        duration: ring.period,
        easing: "linear",
        loop: true,
      })
    );
    idx++;
  }, 500);
}

function stopEscalation() {
  clearTimeout(escalationTimer);
  clearInterval(ringAddInterval);
  escalationTimer = null;
  ringAddInterval = null;
}

function clearEscalatedCircles() {
  escalatedCircles.forEach((c) => c.parentNode?.removeChild(c));
  escalatedCircles = [];
}

function stopBHAnim() {
  bhAnims.forEach((a) => a.pause());
  bhAnims = [];
  stopEscalation();
  clearEscalatedCircles();
}

watch(
  () => props.state,
  async (s) => {
    await nextTick();
    if (s === "loading") startBHAnim();
    else if (s === "success") playSuccessAnim();
    else if (s === "error") playErrorAnim();
  }
);

onMounted(async () => {
  await nextTick();
  if (props.state === "loading") startBHAnim();
});
onUnmounted(() => stopBHAnim());
</script>

<style scoped>
.bh-mount-enter-active {
  transition: opacity 0.25s ease;
}
.bh-mount-leave-active {
  transition: opacity 0.2s ease;
}
.bh-mount-enter-from,
.bh-mount-leave-to {
  opacity: 0;
}

.bh-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2.5rem 1rem;
}

.bh-svg {
  overflow: visible;
}

.bh-label {
  color: #94a3b8;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 500;
}
</style>
