<template>
  <div class="view-toggle">
    <button
      v-for="(tab, i) in tabs"
      :key="tab.key"
      :class="['toggle-btn', { active: modelValue === i }]"
      @click="$emit('update:modelValue', i)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  tabs: { type: Array, required: true },
  modelValue: { type: Number, default: 0 },
});
defineEmits(["update:modelValue"]);
</script>

<style scoped>
.view-toggle {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: 6px;
  margin-bottom: 0.75rem;
}

.toggle-btn {
  padding: 0.3rem 0.75rem;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
}

.toggle-btn:hover {
  color: var(--color-interactive-hover);
}

.toggle-btn.active {
  color: var(--color-interactive-hover);
  font-weight: 600;
  background: var(--color-active-bg);
  box-shadow: var(--shadow-active-sm);
}
</style>
