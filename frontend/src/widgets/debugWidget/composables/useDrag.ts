import { ref, onMounted, onUnmounted, type Ref } from "vue";

type WidgetState = "collapsed" | "menu" | "tool";

export function useDrag(
  state: Ref<WidgetState>,
  sizeOf: (s: WidgetState) => [number, number]
) {
  const pos = ref({ x: 16, y: 16 });
  const isDragging = ref(false);
  const inertiaActive = ref(false);

  let dragStart: {
    mouseX: number;
    mouseY: number;
    posX: number;
    posY: number;
  } | null = null;
  let hasDragged = false;
  let inertiaRaf: number | null = null;
  let recentSamples: { x: number; y: number; t: number }[] = [];

  function clamp(
    x: number,
    y: number,
    s: WidgetState
  ): { x: number; y: number } {
    const [w, h] = sizeOf(s);
    return {
      x: Math.min(Math.max(0, x), Math.max(0, window.innerWidth - w)),
      y: Math.min(Math.max(0, y), Math.max(0, window.innerHeight - h)),
    };
  }

  function startDrag(e: MouseEvent): void {
    if (inertiaRaf !== null) {
      cancelAnimationFrame(inertiaRaf);
      inertiaRaf = null;
      inertiaActive.value = false;
    }
    isDragging.value = true;
    hasDragged = false;
    recentSamples = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
    dragStart = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: pos.value.x,
      posY: pos.value.y,
    };
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
  }

  function onDrag(e: MouseEvent): void {
    if (!dragStart) return;
    const dx = e.clientX - dragStart.mouseX;
    const dy = e.clientY - dragStart.mouseY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) hasDragged = true;
    pos.value = clamp(dragStart.posX - dx, dragStart.posY - dy, state.value);

    const now = performance.now();
    recentSamples.push({ x: e.clientX, y: e.clientY, t: now });
    const cutoff = now - 40;
    recentSamples = recentSamples.filter((s) => s.t >= cutoff);
  }

  function stopDrag(): void {
    isDragging.value = false;
    dragStart = null;
    window.removeEventListener("mousemove", onDrag);
    window.removeEventListener("mouseup", stopDrag);

    let vx = 0;
    let vy = 0;
    if (recentSamples.length >= 2) {
      const first = recentSamples[0];
      const last = recentSamples[recentSamples.length - 1];
      const dt = last.t - first.t;
      if (dt > 0) {
        vx = -((last.x - first.x) / dt) * (1000 / 60);
        vy = -((last.y - first.y) / dt) * (1000 / 60);
      }
    }
    recentSamples = [];

    const MAX_V = 60;
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > MAX_V) {
      vx = (vx / speed) * MAX_V;
      vy = (vy / speed) * MAX_V;
    }

    const FRICTION = 0.93;
    const BOUNCE_LOSS = 0.55;
    const MIN_SPEED = 0.4;

    if (Math.abs(vx) < MIN_SPEED && Math.abs(vy) < MIN_SPEED) return;

    inertiaActive.value = true;

    function step(): void {
      vx *= FRICTION;
      vy *= FRICTION;

      if (Math.abs(vx) < MIN_SPEED && Math.abs(vy) < MIN_SPEED) {
        inertiaActive.value = false;
        inertiaRaf = null;
        return;
      }

      const [w, h] = sizeOf(state.value);
      const maxX = Math.max(0, window.innerWidth - w);
      const maxY = Math.max(0, window.innerHeight - h);

      let nx = pos.value.x + vx;
      let ny = pos.value.y + vy;

      if (nx <= 0) {
        nx = 0;
        vx = Math.abs(vx) * BOUNCE_LOSS;
      } else if (nx >= maxX) {
        nx = maxX;
        vx = -Math.abs(vx) * BOUNCE_LOSS;
      }

      if (ny <= 0) {
        ny = 0;
        vy = Math.abs(vy) * BOUNCE_LOSS;
      } else if (ny >= maxY) {
        ny = maxY;
        vy = -Math.abs(vy) * BOUNCE_LOSS;
      }

      pos.value = { x: nx, y: ny };
      inertiaRaf = requestAnimationFrame(step);
    }

    inertiaRaf = requestAnimationFrame(step);
  }

  function onResize(): void {
    pos.value = clamp(pos.value.x, pos.value.y, state.value);
  }

  // Distinguishes click from drag on the collapsed trigger.
  function onTriggerMousedown(
    e: MouseEvent,
    onClickCallback: () => void
  ): void {
    startDrag(e);
    window.addEventListener(
      "mouseup",
      () => {
        if (!hasDragged) onClickCallback();
      },
      { once: true }
    );
  }

  onMounted(() => {
    window.addEventListener("resize", onResize);
    const [w, h] = sizeOf(state.value);
    pos.value = {
      x: Math.max(0, (window.innerWidth - w) / 2),
      y: Math.max(0, (window.innerHeight - h) / 2),
    };
  });
  onUnmounted(() => {
    window.removeEventListener("resize", onResize);
    window.removeEventListener("mousemove", onDrag);
    window.removeEventListener("mouseup", stopDrag);
  });

  return {
    pos,
    isDragging,
    inertiaActive,
    startDrag,
    onTriggerMousedown,
    clamp,
  };
}
