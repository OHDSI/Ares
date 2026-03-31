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
  background: var(--surface-100, #f1f5f9);
  padding: 0.25rem;
  border-radius: 6px;
  margin-bottom: 0.75rem;
}

.toggle-btn {
  padding: 0.3rem 0.75rem;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-color-secondary, #64748b);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
}

.toggle-btn:hover {
  background: var(--surface-0, #fff);
  color: var(--text-color, #334155);
}

.toggle-btn.active {
  background: var(--surface-0, #fff);
  color: var(--primary-700, #1d4ed8);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
</style>
