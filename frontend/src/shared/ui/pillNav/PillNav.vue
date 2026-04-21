<template>
  <div class="pill-nav">
    <button
      v-for="(tab, index) in tabs"
      :key="tab.key"
      :class="['pill', { active: modelValue === index }]"
      @click="$emit('update:modelValue', index)"
      v-tooltip.bottom="{
        value: tab.description,
        pt: tooltipPt,
      }"
    >
      {{ tab.label }}
    </button>

    <template v-if="unavailableTabs?.length">
      <span class="pill-divider" />
      <span
        v-for="tab in unavailableTabs"
        :key="tab.key"
        class="pill pill-unavailable"
        v-tooltip.bottom="{
          value: 'No data available for this target',
          pt: tooltipPt,
        }"
      >
        {{ tab.label }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";

defineProps<{
  tabs: { key: string; label: string; description?: string }[];
  modelValue: number;
  unavailableTabs?: { key: string; label: string }[];
}>();

defineEmits<{
  (e: "update:modelValue", index: number): void;
}>();

const store = useStore();

const darkMode = computed(() => store.getters.getSettings.darkMode);
const pillTextColor = computed(() => (darkMode.value ? "#94a3b8" : "#64748b"));
const pillHoverColor = computed(() => (darkMode.value ? "#e2e8f0" : "#334155"));
const dividerBg = computed(() => (darkMode.value ? "#4b5563" : "#cbd5e1"));
const pillActiveBg = computed(() =>
  darkMode.value ? "rgba(255,255,255,0.1)" : "transparent"
);
const pillActiveShadow = computed(() =>
  darkMode.value
    ? "0 2px 8px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)"
    : "0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)"
);

const tooltipPt = {
  root: "absolute",
  text: "border rounded bg-surface-800 dark:bg-surface-50 text-white dark:text-black font-normal p-2 max-w-xs",
};
</script>

<style scoped>
.pill-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  padding: 0.3125rem;
  border-radius: 8px;
  align-items: center;
}

.pill {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: v-bind(pillTextColor);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.pill:hover {
  color: v-bind(pillHoverColor);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.pill.active {
  color: v-bind(pillHoverColor);
  font-weight: 600;
  background: v-bind(pillActiveBg);
  box-shadow: v-bind(pillActiveShadow);
}

.pill-unavailable {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: auto;
}

.pill-divider {
  display: inline-block;
  width: 1px;
  height: 1.25rem;
  background: v-bind(dividerBg);
  margin: 0 0.125rem;
  opacity: 0.5;
}
</style>
