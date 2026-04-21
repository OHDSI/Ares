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
import { computed } from "vue";
import { useStore } from "vuex";

defineProps({
  tabs: { type: Array, required: true },
  modelValue: { type: Number, default: 0 },
});
defineEmits(["update:modelValue"]);

const store = useStore();
const darkMode = computed(() => store.getters.getSettings.darkMode);
const btnColor = computed(() => (darkMode.value ? "#9ca3af" : "#64748b"));
const btnHoverColor = computed(() => (darkMode.value ? "#e2e8f0" : "#334155"));
const activeBg = computed(() =>
  darkMode.value ? "rgba(255,255,255,0.1)" : "#ffffff"
);
const activeShadow = computed(() =>
  darkMode.value ? "0 1px 4px rgba(0,0,0,0.5)" : "0 1px 3px rgba(0,0,0,0.08)"
);
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
  color: v-bind(btnColor);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
}

.toggle-btn:hover {
  color: v-bind(btnHoverColor);
}

.toggle-btn.active {
  color: v-bind(btnHoverColor);
  font-weight: 600;
  background: v-bind(activeBg);
  box-shadow: v-bind(activeShadow);
}
</style>
