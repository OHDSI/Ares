<template>
  <div class="pill-nav">
    <Tooltip
      v-for="(tab, index) in tabs"
      :key="tab.key"
      :text="tab.description ?? ''"
    >
      <button
        :class="['pill', { active: modelValue === index }]"
        @click="$emit('update:modelValue', index)"
      >
        {{ tab.label }}
      </button>
    </Tooltip>

    <template v-if="unavailableTabs?.length">
      <span class="pill-divider" />
      <Tooltip
        v-for="tab in unavailableTabs"
        :key="tab.key"
        text="No data available for this target"
      >
        <span class="pill pill-unavailable">{{ tab.label }}</span>
      </Tooltip>
    </template>
  </div>
</template>

<script setup lang="ts">
import Tooltip from "@/shared/ui/tooltip";

defineProps<{
  tabs: { key: string; label: string; description?: string }[];
  modelValue: number;
  unavailableTabs?: { key: string; label: string }[];
}>();

defineEmits<{
  (e: "update:modelValue", index: number): void;
}>();
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
  color: var(--color-text-muted);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.pill:hover {
  color: var(--color-interactive-hover);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.pill.active {
  color: var(--color-interactive-hover);
  font-weight: 600;
  background: var(--color-active-bg);
  box-shadow: var(--shadow-active);
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
  background: var(--color-border-strong);
  margin: 0 0.125rem;
  opacity: 0.5;
}
</style>
