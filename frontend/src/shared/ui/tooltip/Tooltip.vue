<template>
  <span ref="triggerRef" @mouseenter="onEnter" @mouseleave="onLeave">
    <slot />
    <Teleport to="body">
      <Transition name="tooltip">
        <div
          v-if="visible"
          ref="popupRef"
          :class="['tooltip-popup', { 'tooltip-popup--below': flipped }]"
          :style="popupStyle"
        >
          {{ text }}
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<script lang="ts">
export default { name: "Tooltip" };
</script>

<script setup lang="ts">
import { ref, nextTick } from "vue";

const props = defineProps<{ text: string }>();

const triggerRef = ref<HTMLElement | null>(null);
const popupRef = ref<HTMLElement | null>(null);
const visible = ref(false);

const popupStyle = ref<Record<string, string>>({
  top: "-9999px",
  left: "-9999px",
});
const flipped = ref(false);

async function onEnter() {
  if (!props.text) return;
  visible.value = true;
  await nextTick();
  if (!triggerRef.value || !popupRef.value) return;

  const trigger = triggerRef.value.getBoundingClientRect();
  const popup = popupRef.value.getBoundingClientRect();
  const gap = 6;
  const edge = 8;

  const idealLeft = trigger.left + trigger.width / 2 - popup.width / 2;
  const left = Math.max(
    edge,
    Math.min(idealLeft, window.innerWidth - popup.width - edge)
  );
  const topAbove = trigger.top - popup.height - gap;
  flipped.value = topAbove < edge;
  const top = flipped.value ? trigger.bottom + gap : topAbove;

  popupStyle.value = { top: `${top}px`, left: `${left}px` };
}

function onLeave() {
  visible.value = false;
  popupStyle.value = { top: "-9999px", left: "-9999px" };
}
</script>

<style scoped>
.tooltip-popup {
  position: fixed;
  z-index: 9999;
  padding: 0.2rem 0.5rem;
  font-size: 0.8125rem;
  font-weight: 300;
  border-radius: 4px;
  white-space: normal;
  max-width: 260px;
  pointer-events: none;
  background: var(--color-tooltip-bg);
  color: var(--color-tooltip-fg);
  border: 1px solid var(--color-tooltip-border);
}

.tooltip-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.tooltip-leave-active {
  transition: opacity 0.1s ease;
}
.tooltip-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.tooltip-popup--below.tooltip-enter-from {
  transform: translateY(-4px);
}
.tooltip-leave-to {
  opacity: 0;
}
</style>
