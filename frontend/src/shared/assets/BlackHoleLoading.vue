<template>
  <Transition name="bh-mount" appear>
    <div v-if="state !== 'idle'" class="bh-wrapper">
      <svg
        ref="svgRef"
        class="bh-svg"
        :style="{ width: svgPx, height: svgPx }"
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
          class="bh-r4"
          cx="0"
          cy="0"
          r="60"
          fill="none"
          stroke="#cbd5e1"
          stroke-width="1.5"
          stroke-dasharray="75 126 50 126"
          stroke-linecap="round"
        />

        <circle
          class="bh-r3"
          cx="0"
          cy="0"
          r="50"
          fill="none"
          stroke="#9ca3af"
          stroke-width="2"
          stroke-dasharray="65 102 45 102"
          stroke-linecap="round"
        />
        <circle
          class="bh-r2"
          cx="0"
          cy="0"
          r="38"
          fill="none"
          stroke="#4b5563"
          stroke-width="3"
          stroke-dasharray="48 78 35 78"
          stroke-linecap="round"
        />
        <circle
          class="bh-r1"
          cx="0"
          cy="0"
          r="27"
          fill="none"
          stroke="#1f2937"
          stroke-width="4.5"
          stroke-dasharray="35 55 25 55"
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
      <span class="bh-label">{{ text }}</span>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
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
});

const SIZE_MAP = { sm: 80, md: 128, lg: 192 };
const svgPx = computed(() => `${SIZE_MAP[props.size]}px`);

// Kepler's third law: T ∝ r^1.5, anchored at r=27 → 2000 ms
const BASE_R = 27;
const BASE_T = 2000;
const keplerT = (r) => BASE_T * (r / BASE_R) ** 1.5;
const circ = (r) => 2 * Math.PI * r;

const orbitEasing = () => (t) => t + 0.05 * Math.sin(4 * Math.PI * t);

const RINGS = [
  { cls: ".bh-r1", r: 27, arcs: [35, 25], gaps: [55, 55] },
  { cls: ".bh-r2", r: 38, arcs: [48, 35], gaps: [78, 78] },
  { cls: ".bh-r3", r: 50, arcs: [65, 45], gaps: [102, 102] },
  { cls: ".bh-r4", r: 60, arcs: [75, 50], gaps: [126, 126] },
];

const svgRef = ref(null);
let bhAnims = [];

function startBHAnim() {
  stopBHAnim();
  const el = svgRef.value;
  if (!el) return;

  for (const { cls, r } of RINGS) {
    bhAnims.push(
      anime({
        targets: el.querySelector(cls),
        strokeDashoffset: [0, -circ(r)],
        duration: keplerT(r),
        easing: "linear",
        loop: true,
      })
    );
  }

  bhAnims.push(
    anime({
      targets: el.querySelector(".bh-photon"),
      opacity: [0.5, 0.9, 0.5],
      duration: BASE_T,
      easing: "easeInOutSine",
      loop: true,
    })
  );
}

function playSuccessAnim() {
  stopBHAnim();
  const el = svgRef.value;
  if (!el) return;

  for (const { cls, r } of RINGS) {
    const target = el.querySelector(cls);
    const cur = parseFloat(target.getAttribute("stroke-dashoffset") || 0);
    bhAnims.push(
      anime({
        targets: target,
        strokeDashoffset: cur - circ(r) * 0.4,
        duration: 1100,
        easing: "easeOutQuart",
      })
    );
  }
}

function playErrorAnim() {
  stopBHAnim();
  const el = svgRef.value;
  if (!el) return;

  RINGS.forEach(({ cls, r, arcs, gaps }, i) => {
    const target = el.querySelector(cls);
    const cur = parseFloat(target.getAttribute("stroke-dashoffset") || 0);
    const delay = i * 150;

    bhAnims.push(
      anime({
        targets: target,
        strokeDashoffset: cur - circ(r) * 0.3,
        opacity: 0.12,
        duration: 2000,
        delay,
        easing: "easeOutCubic",
      })
    );

    const proxy = { a1: arcs[0], a2: arcs[1], g1: gaps[0], g2: gaps[1] };
    bhAnims.push(
      anime({
        targets: proxy,
        a1: arcs[0] * 0.12,
        a2: arcs[1] * 0.12,
        g1: gaps[0] + arcs[0] * 0.88,
        g2: gaps[1] + arcs[1] * 0.88,
        duration: 2000,
        delay,
        easing: "easeOutCubic",
        update: () => {
          target.setAttribute(
            "stroke-dasharray",
            `${proxy.a1.toFixed(1)} ${proxy.g1.toFixed(1)} ${proxy.a2.toFixed(
              1
            )} ${proxy.g2.toFixed(1)}`
          );
        },
      })
    );
  });

  bhAnims.push(
    anime({
      targets: el.querySelector(".bh-photon"),
      opacity: 0,
      duration: 1800,
      easing: "easeOutQuad",
    })
  );
}

function stopBHAnim() {
  bhAnims.forEach((a) => a.pause());
  bhAnims = [];
}

watch(
  () => props.state,
  (s) => {
    if (s === "loading") startBHAnim();
    else if (s === "success") playSuccessAnim();
    else if (s === "error") playErrorAnim();
  }
);

onMounted(() => {
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
  font-size: 0.7rem;
  color: #94a3b8;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 500;
}
</style>
