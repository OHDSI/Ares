<template>
  <div ref="triggerRef" @mouseenter="onEnter" @mouseleave="onLeave">
    <slot />
    <Teleport to="body">
      <Transition name="tooltip">
        <div
          v-if="visible"
          ref="popupRef"
          class="tooltip-popup"
          :style="{ ...popupStyle, background: bg, color: fg, border: `1px solid ${bd}` }"
        >
          {{ text }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script lang="ts">
export default { name: "Tooltip" };
</script>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { useStore } from "vuex";

defineProps<{ text: string }>();

const store = useStore();
const darkMode = computed(() => store.getters.getSettings.darkMode);

const bg = computed(() => (darkMode.value ? "#f1f5f9" : "#1e293b"));
const fg = computed(() => (darkMode.value ? "#1e293b" : "#f1f5f9"));
const bd = computed(() => (darkMode.value ? "#cbd5e1" : "#334155"));

const triggerRef = ref<HTMLElement | null>(null);
const popupRef = ref<HTMLElement | null>(null);
const visible = ref(false);

const popupStyle = ref<Record<string, string>>({
  top: "-9999px",
  left: "-9999px",
});

async function onEnter() {
  visible.value = true;
  await nextTick();
  if (!triggerRef.value || !popupRef.value) return;

  const trigger = triggerRef.value.getBoundingClientRect();
  const popup = popupRef.value.getBoundingClientRect();
  const gap = 6;
  const edge = 8;

  const idealLeft = trigger.left + trigger.width / 2 - popup.width / 2;
  const left = Math.max(edge, Math.min(idealLeft, window.innerWidth - popup.width - edge));
  const top = trigger.top - popup.height - gap;

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
  white-space: nowrap;
  pointer-events: none;
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
.tooltip-leave-to {
  opacity: 0;
}
</style>
