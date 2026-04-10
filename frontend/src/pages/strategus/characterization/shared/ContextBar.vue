<template>
  <div class="context results-ctx">
    <template v-for="(item, i) in items" :key="i">
      <span class="sep" v-if="i > 0" />
      <span>{{ item }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";

defineProps<{
  items: (string | null | undefined)[];
}>();

const store = useStore();
const darkMode = computed(() => store.getters.getSettings.darkMode);
const contextColor = computed(() => (darkMode.value ? "#9ca3af" : "#64748b"));
const contextBorder = computed(() => (darkMode.value ? "#3a3a3a" : "#94a3b8"));
const contextBg = computed(() => (darkMode.value ? "#1c1c1c" : "#f8fafc"));
</script>

<style scoped>
@import "./styles.css";

.context {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: v-bind(contextColor);
  padding: 0.5rem 0.75rem;
  background: v-bind(contextBg);
  border: 1px solid v-bind(contextBorder);
  border-radius: 8px;
  flex-wrap: wrap;
}
</style>
