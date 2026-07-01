<template>
  <Transition name="bh-mount" appear>
    <div v-if="state !== 'idle'" class="bh-wrapper">
      <div :style="{ perspective: perspectivePx }">
        <svg
          ref="svgRef"
          class="bh-svg"
          :style="{
            width: svgPx,
            height: svgPx,
            marginBottom: svgMarginBottom,
          }"
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
          <g ref="diskRef" :style="diskStyle">
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
          </g>
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

          <!-- Easter egg: outer group = transport (opacity + translateX); inner = acting (squash/bob) -->
          <g ref="stickFigureRef" opacity="0">
            <g
              ref="figActorRef"
              :style="{
                transformBox: 'fill-box',
                transformOrigin: 'bottom center',
              }"
            >
              <g ref="figBodyRef">
                <!-- head -->
                <circle
                  cx="95"
                  cy="-72"
                  r="6"
                  fill="none"
                  :stroke="stickFigureColor"
                  stroke-width="1.5"
                />
                <!-- eyes -->
                <circle cx="92.5" cy="-73.5" r="0.9" :fill="stickFigureColor" />
                <circle cx="95.2" cy="-73.5" r="0.9" :fill="stickFigureColor" />
                <!-- hunched spine: hip → shoulder area → neck -->
                <path
                  d="M 100 -45 Q 93 -56 95 -66"
                  fill="none"
                  :stroke="stickFigureColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <!-- back arm -->
                <line
                  x1="95"
                  y1="-56"
                  x2="103"
                  y2="-52"
                  :stroke="stickFigureColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <!-- legs (feet clear the ring area at these x positions) -->
                <line
                  ref="figLegRRef"
                  x1="100"
                  y1="-45"
                  x2="94"
                  y2="-27"
                  :stroke="stickFigureColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <line
                  ref="figLegBRef"
                  x1="100"
                  y1="-45"
                  x2="106"
                  y2="-27"
                  :stroke="stickFigureColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </g>
              <!-- caption cycles through phrases -->
              <text
                ref="figTextRef"
                x="105"
                y="-55"
                font-size="5"
                :fill="stickFigureColor"
                font-family="system-ui,sans-serif"
                opacity="0"
              >
                c'mon...
              </text>
              <!-- forward arm: extends during jab -->
              <line
                ref="figFwdArmRef"
                x1="95"
                y1="-56"
                x2="87"
                y2="-46"
                :stroke="stickFigureColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <!-- pole: tip enters core on slam; x2 = arm.x2 - 60, y2 = arm.y2 + 31 -->
              <line
                ref="figPoleRef"
                x1="87"
                y1="-46"
                x2="27"
                y2="-15"
                :stroke="stickFigureColor"
                stroke-width="1"
                stroke-linecap="round"
              />
            </g>
          </g>

          <circle
            ref="bhCoreRef"
            cx="0"
            cy="0"
            r="17"
            fill="url(#bh-core-grad)"
          />
        </svg>
      </div>
      <span
        ref="labelRef"
        class="bh-label"
        :class="[labelSizeClass, { 'bh-label--dark': darkMode }]"
        >{{ text }}</span
      >
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from "vue";
import { animate } from "animejs";
import { useStore } from "vuex";

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
    default: true,
  },
  progress: {
    type: Number,
    default: null,
  },
  inclination: {
    type: Number,
    default: 20,
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
          .padStart(2, "0"),
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

// Accretion-disk color: [inner-hot, peak, outer-dark (light bg), outer-dark (dark bg)]
const THEMES = {
  orange: ["#fff4d0", "#f97316", "#150300", "#3a1800"],
  blue: ["#e0f2ff", "#3b82f6", "#03080f", "#041828"],
  purple: ["#ede9fe", "#6366f1", "#03030f", "#0e0525"],
  teal: ["#ccfbf1", "#14b8a6", "#030f0d", "#041a14"],
  red: ["#fff1f0", "#ef4444", "#150000", "#280505"],
};

function diskColor(t, theme, isDark = false) {
  const [inner, peak, outerLight, outerDark] = THEMES[theme] ?? THEMES.orange;
  const outer = isDark ? outerDark : outerLight;
  if (t < 0.45) return hexLerp(inner, peak, t / 0.45);
  return hexLerp(peak, outer, (t - 0.45) / 0.55);
}

const store = useStore();
const darkMode = computed(() => store.getters.getSettings.darkMode);

// Monochrome palette
const MONO_INNER_COLOR = "#e2e8f0"; // near-white
const MONO_OUTER_COLOR_LIGHT = "#060c15"; // near-black (light bg)
const MONO_OUTER_COLOR_DARK = "#2a3d52"; // dark slate (visible on dark bg)
const MONO_ARC1_RATIO = 0.207; // symmetric fixed arcs
const MONO_ARC2_RATIO = 0.146;

// Ring geometry
function buildRings(n, theme, isDark = false) {
  const isColored = theme !== "mono";
  const monoOuter = isDark ? MONO_OUTER_COLOR_DARK : MONO_OUTER_COLOR_LIGHT;
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
        ? diskColor(t, theme, isDark)
        : hexLerp(MONO_INNER_COLOR, monoOuter, t),
      strokeWidth: +(INNER_WIDTH + (OUTER_WIDTH - INNER_WIDTH) * t).toFixed(1),
      arcs: [a1, a2],
      gaps: [g, g],
    };
  });
}

const svgPx = computed(() => `${SIZE_MAP[props.size]}px`);
const labelSizeClass = computed(
  () => ({ sm: "text-[0.6rem]", md: "text-xs", lg: "text-sm" })[props.size],
);

const activeRings = computed(() =>
  buildRings(RING_COUNT[props.size], props.theme, darkMode.value),
);

const MAX_ESCALATED_RINGS = 50;
let escalationTimer = null;
let ringAddInterval = null;
let escalatedCircles = [];

const diskScaleY = computed(() =>
  Math.cos((props.inclination * Math.PI) / 180),
);
const perspectivePx = computed(() => `${SIZE_MAP[props.size] * 4}px`);
const diskStyle = computed(() => ({
  transform: `rotateX(${props.inclination}deg)`,
  transformBox: "fill-box",
  transformOrigin: "center",
}));

const svgMarginBottom = computed(() => {
  const displayPx = SIZE_MAP[props.size];
  const rMax = activeRings.value[activeRings.value.length - 1].r;
  const scale = displayPx / 136;
  const overflow = Math.max(0, rMax * diskScaleY.value * scale - displayPx / 2);
  return `${Math.ceil(overflow) + 6}px`;
});

const svgRef = ref(null);
const diskRef = ref(null);
const labelRef = ref(null);
const stickFigureRef = ref(null);
const figActorRef = ref(null);
const figBodyRef = ref(null);
const figFwdArmRef = ref(null);
const figPoleRef = ref(null);
const figLegRRef = ref(null);
const figLegBRef = ref(null);
const figTextRef = ref(null);
const bhCoreRef = ref(null);
let bhAnims = [];
let consumedSlices = new Set();

const stickFigureColor = computed(() =>
  darkMode.value ? "#94a3b8" : "#475569",
);

const EGG_CAPTIONS = ["c'mon...", "do something!", "WORK!!", "...anything?"];
let pokeSeqIdx = 0;

let easterEggCountdown = null;
let pokeLoopTimer = null;
let poking = false;
let bobAnim = null;

function stopBob() {
  if (bobAnim) {
    bobAnim.pause();
    bobAnim = null;
  }
  const body = figBodyRef.value;
  if (body) body.style.transform = "";
}

// Move arm and pole together. The pole vector is always (-60, +31) relative to the hand.
function moveArmPole(fwdArm, pole, ax2, ay2, dur, ease, cb) {
  bhAnims.push(animate(fwdArm, { x2: ax2, y2: ay2, duration: dur, ease }));
  bhAnims.push(
    animate(pole, {
      x1: ax2,
      y1: ay2,
      x2: ax2 - 60,
      y2: ay2 + 31,
      duration: dur,
      ease,
      onComplete: cb,
    }),
  );
}

function tapOnce(cb) {
  if (!poking) return;
  const fwdArm = figFwdArmRef.value;
  const pole = figPoleRef.value;
  if (!fwdArm || !pole) return;
  moveArmPole(fwdArm, pole, 73, -41, 170, "outCubic", () => {
    moveArmPole(fwdArm, pole, 87, -46, 140, "inSine", cb);
  });
}

function windUp(cb) {
  if (!poking) return;
  const fwdArm = figFwdArmRef.value;
  const pole = figPoleRef.value;
  if (!fwdArm || !pole) return;
  moveArmPole(fwdArm, pole, 94, -50, 280, "outBack", cb);
}

function slam(cb) {
  if (!poking) return;
  const fwdArm = figFwdArmRef.value;
  const pole = figPoleRef.value;
  if (!fwdArm || !pole) return;
  moveArmPole(fwdArm, pole, 66, -38, 110, "outExpo", () => {
    const core = bhCoreRef.value;
    if (core) {
      bhAnims.push(
        animate(core, {
          r: 20,
          duration: 80,
          ease: "outExpo",
          onComplete: () => {
            bhAnims.push(
              animate(core, { r: 17, duration: 300, ease: "outElastic" }),
            );
          },
        }),
      );
    }

    const photon = svgRef.value?.querySelector(".bh-photon");
    if (photon) {
      bhAnims.push(
        animate(photon, {
          r: [19.5, 21.5, 19.5],
          duration: 450,
          ease: "outCubic",
        }),
      );
    }
    pokeLoopTimer = setTimeout(() => {
      if (!poking) return;
      moveArmPole(fwdArm, pole, 87, -46, 360, "outBack", cb);
    }, 120);
  });
}

function kickBlackHole(cb) {
  if (!poking) return;
  const leg = figLegRRef.value;
  const svg = svgRef.value;
  if (!leg) return;
  bhAnims.push(
    animate(leg, {
      x2: 110,
      y2: -36,
      duration: 130,
      ease: "outCubic",
      onComplete: () => {
        if (!poking) return;
        bhAnims.push(
          animate(leg, {
            x2: 82,
            y2: -24,
            duration: 120,
            ease: "inExpo",
            onComplete: () => {
              if (!poking) return;
              // outer ring (r = MAX_R, right beside the figure) takes the hit
              const outerIdx = activeRings.value.length - 1;
              const outerRing = svgRef.value?.querySelector(
                `[data-bh-idx="${outerIdx}"]`,
              );
              if (outerRing) {
                bhAnims.push(
                  animate(outerRing, {
                    r: [MAX_R, MAX_R - 10, MAX_R + 6, MAX_R],
                    strokeWidth: [OUTER_WIDTH, OUTER_WIDTH * 4, OUTER_WIDTH],
                    duration: 480,
                    ease: "outElastic",
                  }),
                );
              }
              if (svg) {
                bhAnims.push(
                  animate(svg, {
                    translateX: [0, -4, 2, -1, 0],
                    translateY: [0, 2, -1, 0],
                    rotate: [0, -1.2, 0.6, 0],
                    duration: 420,
                    ease: "outElastic",
                  }),
                );
              }
              pokeLoopTimer = setTimeout(() => {
                if (!poking) return;
                bhAnims.push(
                  animate(leg, {
                    x2: 94,
                    y2: -27,
                    duration: 240,
                    ease: "outBack",
                    onComplete: cb,
                  }),
                );
              }, 110);
            },
          }),
        );
      },
    }),
  );
}

function doPokeSequence() {
  if (!poking) return;
  tapOnce(() => {
    pokeLoopTimer = setTimeout(() => {
      tapOnce(() => {
        pokeLoopTimer = setTimeout(() => {
          windUp(() => {
            pokeLoopTimer = setTimeout(() => {
              slam(() => {
                kickBlackHole(() => {
                  if (!poking) return;
                  pokeSeqIdx = (pokeSeqIdx + 1) % EGG_CAPTIONS.length;
                  const txt = figTextRef.value;
                  if (txt) {
                    bhAnims.push(
                      animate(txt, {
                        opacity: 0,
                        duration: 160,
                        ease: "outCubic",
                        onComplete: () => {
                          txt.textContent = EGG_CAPTIONS[pokeSeqIdx];
                          bhAnims.push(
                            animate(txt, {
                              opacity: 1,
                              duration: 220,
                              ease: "outCubic",
                            }),
                          );
                        },
                      }),
                    );
                  }
                  pokeLoopTimer = setTimeout(doPokeSequence, 1400);
                });
              });
            }, 150);
          });
        }, 200);
      });
    }, 150);
  });
}

function startEasterEgg() {
  if (props.state !== "loading") return;
  const el = stickFigureRef.value;
  const actor = figActorRef.value;
  if (!el || !actor) return;
  poking = true;
  bhAnims.push(
    animate(el, { opacity: [0, 1], duration: 150, ease: "outCubic" }),
  );
  bhAnims.push(
    animate(el, {
      translateY: [-130, 0],
      duration: 420,
      ease: "inQuad",
      onComplete: () => {
        if (!poking) return;
        // Squash on impact
        bhAnims.push(
          animate(actor, {
            scaleY: 0.6,
            duration: 70,
            ease: "outExpo",
            onComplete: () => {
              if (!poking) return;
              bhAnims.push(
                animate(actor, {
                  scaleY: 1,
                  duration: 340,
                  ease: "outBack",
                  onComplete: () => {
                    if (!poking) return;
                    const body = figBodyRef.value;
                    if (body) {
                      bobAnim = animate(body, {
                        translateY: [0, -1, 0],
                        duration: 1700,
                        ease: "inOutSine",
                        loop: true,
                      });
                      bhAnims.push(bobAnim);
                    }
                    const txt = figTextRef.value;
                    if (txt)
                      bhAnims.push(
                        animate(txt, {
                          opacity: [0, 1],
                          duration: 600,
                          ease: "outCubic",
                          delay: 200,
                        }),
                      );
                    doPokeSequence();
                  },
                }),
              );
            },
          }),
        );
      },
    }),
  );
}

function stopEasterEgg() {
  poking = false;
  clearTimeout(easterEggCountdown);
  clearTimeout(pokeLoopTimer);
  easterEggCountdown = null;
  pokeLoopTimer = null;
  pokeSeqIdx = 0;
  stopBob();
  const fig = stickFigureRef.value;
  if (fig) {
    fig.style.opacity = "0";
    fig.style.transform = "";
  }
  const actor = figActorRef.value;
  if (actor) actor.style.transform = "";
  const fwdArm = figFwdArmRef.value;
  if (fwdArm) {
    fwdArm.setAttribute("x2", "87");
    fwdArm.setAttribute("y2", "-46");
  }
  const legR = figLegRRef.value;
  if (legR) {
    legR.setAttribute("x2", "94");
    legR.setAttribute("y2", "-27");
  }
  const legBk = figLegBRef.value;
  if (legBk) {
    legBk.setAttribute("x2", "106");
    legBk.setAttribute("y2", "-27");
  }
  const pole = figPoleRef.value;
  if (pole) {
    pole.setAttribute("x1", "87");
    pole.setAttribute("y1", "-46");
    pole.setAttribute("x2", "27");
    pole.setAttribute("y2", "-15");
  }
  const txt = figTextRef.value;
  if (txt) {
    txt.style.opacity = "0";
    txt.textContent = EGG_CAPTIONS[0];
  }
  const core = bhCoreRef.value;
  if (core) core.setAttribute("r", "17");
  const photon = svgRef.value?.querySelector(".bh-photon");
  if (photon) photon.setAttribute("r", "19.5");
}

function collapseFromKick() {
  const el = svgRef.value;
  if (!el) return 0;

  const extraCircles = [...escalatedCircles];
  escalatedCircles = [];
  extraCircles.forEach((c) => {
    bhAnims.push(
      animate(c, {
        r: 0,
        opacity: 0,
        duration: 220,
        ease: "inQuart",
        onComplete: () => c.parentNode?.removeChild(c),
      }),
    );
  });

  if (labelRef.value) {
    bhAnims.push(
      animate(labelRef.value, {
        letterSpacing: "0.1em",
        duration: 400,
        ease: "outCubic",
      }),
    );
  }

  const n = activeRings.value.length;
  const stagger = 35;
  activeRings.value.forEach((_, i) => {
    const target = el.querySelector(`[data-bh-idx="${i}"]`);
    if (!target) return;
    // outer rings collapse first, cascade inward
    const delay = (n - 1 - i) * stagger;
    bhAnims.push(
      animate(target, {
        r: 0,
        opacity: 0,
        duration: 260,
        delay,
        ease: "inQuart",
      }),
    );
  });

  const photonDelay = n * stagger;
  bhAnims.push(
    animate(el.querySelector(".bh-photon"), {
      opacity: [0.9, 1, 0],
      r: 0,
      duration: 240,
      delay: photonDelay,
      ease: "inQuart",
    }),
  );

  bhAnims.push(
    animate(svgRef.value, {
      scale: 0,
      duration: 200,
      delay: (n - 1) * stagger,
      ease: "inQuart",
    }),
  );

  return photonDelay + 240;
}

function finishEasterEgg() {
  clearTimeout(easterEggCountdown);
  clearTimeout(pokeLoopTimer);
  easterEggCountdown = null;
  pokeLoopTimer = null;
  poking = false;

  const leg = figLegRRef.value;
  const fig = stickFigureRef.value;
  const txt = figTextRef.value;
  if (!leg || !fig) {
    collapseFromKick();
    return;
  }
  stopBob();
  if (txt) {
    txt.textContent = "HA!";
    txt.style.opacity = "1";
  }

  bhAnims.push(
    animate(leg, {
      x2: 112,
      y2: -38,
      duration: 100,
      ease: "outCubic",
      onComplete: () => {
        bhAnims.push(
          animate(leg, {
            x2: 78,
            y2: -22,
            duration: 90,
            ease: "inExpo",
            onComplete: () => {
              if (svgRef.value) {
                bhAnims.push(
                  animate(svgRef.value, {
                    translateX: [0, -10, 6, -3, 1, 0],
                    translateY: [0, 4, -2, 1, 0],
                    rotate: [0, -3, 2, -1, 0],
                    duration: 350,
                    ease: "outElastic",
                  }),
                );
              }
              const collapseMs = collapseFromKick();
              pokeLoopTimer = setTimeout(() => {
                bhAnims.push(
                  animate(fig, {
                    opacity: [1, 0],
                    duration: 220,
                    ease: "outCubic",
                    onComplete: () => {
                      fig.style.transform = "";
                      fig.style.opacity = "0";
                      if (txt) {
                        txt.style.opacity = "0";
                        txt.textContent = EGG_CAPTIONS[0];
                      }
                    },
                  }),
                );
              }, collapseMs);
            },
          }),
        );
      },
    }),
  );
}

function panicEasterEgg() {
  const wasActive = poking;
  poking = false;
  clearTimeout(easterEggCountdown);
  clearTimeout(pokeLoopTimer);
  easterEggCountdown = null;
  pokeLoopTimer = null;

  if (!wasActive) {
    stopEasterEgg();
    return;
  }
  stopBob();

  const txt = figTextRef.value;
  if (txt) {
    txt.textContent = "uh oh.";
    txt.style.opacity = "1";
  }

  const fig = stickFigureRef.value;
  const actor = figActorRef.value;
  if (!fig || !actor) return;
  bhAnims.push(
    animate(fig, {
      translateY: [0, -7, 0],
      duration: 240,
      ease: "outQuad",
      onComplete: () => {
        pokeLoopTimer = setTimeout(() => {
          bhAnims.push(
            animate(actor, {
              scaleY: 0.65,
              duration: 100,
              ease: "outCubic",
              onComplete: () => {
                bhAnims.push(
                  animate(actor, {
                    scaleY: 1,
                    duration: 160,
                    ease: "outCubic",
                  }),
                );
                bhAnims.push(
                  animate(fig, {
                    translateY: [0, -150],
                    translateX: [0, 14],
                    opacity: [1, 0],
                    duration: 300,
                    ease: "outCubic",
                    onComplete: () => {
                      fig.style.transform = "";
                      fig.style.opacity = "0";
                      actor.style.transform = "";
                      if (txt) {
                        txt.style.opacity = "0";
                        txt.textContent = EGG_CAPTIONS[0];
                      }
                    },
                  }),
                );
              },
            }),
          );
        }, 420);
      },
    }),
  );
}

function collapseRing(i) {
  const el = svgRef.value;
  if (!el) return;
  const target = el.querySelector(`[data-bh-idx="${i}"]`);
  if (!target) return;
  animate(target, {
    r: 0,
    opacity: 0,
    duration: 700,
    ease: "inQuart",
  });
}

function syncProgress(val) {
  if (val === null || val === undefined) return;
  const n = RING_COUNT[props.size];
  let stagger = 0;
  for (let i = 0; i < n; i++) {
    const threshold = (i + 1) * (100 / n);
    if (val >= threshold && !consumedSlices.has(i)) {
      consumedSlices.add(i);
      const idx = i;
      setTimeout(() => collapseRing(idx), stagger);
      stagger += 60;
    }
  }
}

function startBHAnim() {
  stopBHAnim();
  if (labelRef.value) labelRef.value.style.letterSpacing = "";
  if (svgRef.value) svgRef.value.style.transform = "";
  const el = svgRef.value;
  if (!el) return;

  if (props.escalate && props.progress === null)
    escalationTimer = setTimeout(startEscalation, 10_000);

  const now = new Date();
  const isAprilFools = now.getMonth() === 3 && now.getDate() === 1;
  easterEggCountdown = setTimeout(
    startEasterEgg,
    isAprilFools ? 3_000 : 60_000,
  );

  activeRings.value.forEach(({ r, period }, i) => {
    const target = el.querySelector(`[data-bh-idx="${i}"]`);
    bhAnims.push(
      animate(target, {
        strokeDashoffset: -circ(r),
        duration: period,
        ease: "linear",
        loop: true,
      }),
    );
    bhAnims.push(
      animate(target, {
        scale: [1.45, 1],
        opacity: [0, 1],
        duration: 900,
        delay: (activeRings.value.length - 1 - i) * 80,
        ease: "outCubic",
      }),
    );
  });

  bhAnims.push(
    animate(el.querySelector(".bh-photon"), {
      opacity: [0, 0.9, 0.5],
      duration: T_PHOTON_SPHERE,
      ease: "inOutSine",
      loop: true,
      delay: activeRings.value.length * 80,
    }),
  );
}

function playSuccessAnim() {
  stopEscalation();
  if (poking) {
    finishEasterEgg();
    return;
  }
  stopEasterEgg();

  const extraCircles = [...escalatedCircles];
  escalatedCircles = [];
  const el = svgRef.value;
  if (!el) return;

  const successStagger =
    extraCircles.length > 1 ? 200 / (extraCircles.length - 1) : 0;
  extraCircles.forEach((c, i) => {
    bhAnims.push(
      animate(c, {
        r: 0,
        opacity: 0,
        duration: 700,
        delay: i * successStagger,
        ease: "inQuart",
        onComplete: () => c.parentNode?.removeChild(c),
      }),
    );
  });

  if (labelRef.value) {
    bhAnims.push(
      animate(labelRef.value, {
        letterSpacing: "0.1em",
        duration: 900,
        ease: "outCubic",
      }),
    );
  }

  const n = activeRings.value.length;
  activeRings.value.forEach((_, i) => {
    const target = el.querySelector(`[data-bh-idx="${i}"]`);
    if (!target) return;
    // outer rings start first, cascade inward
    const delay = (n - 1 - i) * 110;
    bhAnims.push(
      animate(target, {
        r: 0,
        opacity: 0,
        duration: 750,
        delay,
        ease: "inQuart",
      }),
    );
  });

  // photon ring flares then collapses last
  bhAnims.push(
    animate(el.querySelector(".bh-photon"), {
      opacity: [0.9, 1, 0],
      r: 0,
      duration: 650,
      delay: n * 110,
      ease: "inQuart",
    }),
  );

  // core shrinks into nothing once the innermost ring starts collapsing
  bhAnims.push(
    animate(svgRef.value, {
      scale: 0,
      duration: 380,
      delay: (n - 1) * 110,
      ease: "inQuart",
    }),
  );
}

function playErrorAnim() {
  // Keep orbit animations running - rings drift while still spinning
  stopEscalation();
  panicEasterEgg();
  const extraCircles = [...escalatedCircles];
  escalatedCircles = [];
  const el = svgRef.value;
  if (!el) return;

  const RED = "#ef4444";
  const RED_HOT = "#ff3333";

  //0. rings bleed to red while still in orbit
  activeRings.value.forEach((_, i) => {
    const t = el.querySelector(`[data-bh-idx="${i}"]`);
    if (t) {
      animate(t, {
        stroke: RED_HOT,
        duration: 300,
        ease: "outQuad",
      });
    }
  });

  const photon = el.querySelector(".bh-photon");
  // 1. rings drift apart - each in a unique direction
  // Golden-angle spread (137.5°) gives natural, non-uniform distribution
  // easeOutSine = gentle deceleration so momentum visibly carries them
  activeRings.value.forEach((_, i) => {
    const target = el.querySelector(`[data-bh-idx="${i}"]`);
    if (!target) return;
    const angle = (i * 137.5 * Math.PI) / 180;
    const dist = 10 + i * 4;
    bhAnims.push(
      animate(target, {
        translateX: Math.cos(angle) * dist,
        translateY: Math.sin(angle) * dist,
        opacity: 0,
        duration: 700,
        delay: 150,
        ease: "outSine",
      }),
    );
  });

  // 2. photon ring just fades in place
  if (photon) {
    bhAnims.push(
      animate(photon, {
        opacity: 0,
        duration: 700,
        delay: 150,
        ease: "outSine",
      }),
    );
  }

  // 3. escalated circles drift out
  extraCircles.forEach((c, i) => {
    const angle = (i * 137.5 * Math.PI) / 180;
    bhAnims.push(
      animate(c, {
        translateX: Math.cos(angle) * 15,
        translateY: Math.sin(angle) * 15,
        opacity: 0,
        duration: 700,
        delay: 150,
        ease: "outSine",
        onComplete: () => c.parentNode?.removeChild(c),
      }),
    );
  });

  // 4. label turns red
  if (labelRef.value) {
    bhAnims.push(
      animate(labelRef.value, {
        color: RED,
        duration: 400,
        ease: "outQuad",
      }),
    );
  }
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
        animate(target, {
          stroke: diskColor(t, "orange", darkMode.value),
          duration: 5000,
          ease: "inOutQuad",
        });
    });
  }

  const escalationTheme = props.theme === "mono" ? "orange" : props.theme;
  const fullRings = buildRings(
    MAX_ESCALATED_RINGS,
    escalationTheme,
    darkMode.value,
  );
  const initCount = RING_COUNT[props.size];

  let idx = initCount;

  if (labelRef.value) {
    bhAnims.push(
      animate(labelRef.value, {
        letterSpacing: "0.8em",
        duration: 30_000,
        ease: "inQuad",
      }),
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
      `${ring.arcs[0]} ${ring.gaps[0]} ${ring.arcs[1]} ${ring.gaps[1]}`,
    );
    c.setAttribute("stroke-linecap", "round");
    c.setAttribute("opacity", "0");
    diskRef.value.appendChild(c);
    escalatedCircles.push(c);

    animate(c, { opacity: [0, 1], duration: 700, ease: "inSine" });
    bhAnims.push(
      animate(c, {
        strokeDashoffset: -circ(ring.r),
        duration: ring.period,
        ease: "linear",
        loop: true,
      }),
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
  consumedSlices = new Set();
  stopEscalation();
  stopEasterEgg();
  clearEscalatedCircles();
}

watch(
  () => props.state,
  async (s) => {
    await nextTick();
    if (s === "loading") startBHAnim();
    else if (s === "success") playSuccessAnim();
    else if (s === "error") playErrorAnim();
  },
);

watch(
  () => props.progress,
  (newVal) => {
    nextTick(() => syncProgress(newVal));
  },
);

onMounted(async () => {
  await nextTick();
  if (props.state === "loading") startBHAnim();
  syncProgress(props.progress);
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
  color: #64748b;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 500;
}

.bh-label--dark {
  color: #94a3b8;
}
</style>
