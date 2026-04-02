<template>
  <div class="context results-ctx">
    <template v-for="(item, i) in items" :key="i">
      <span class="sep" v-if="i > 0" />
      <span>{{ item }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: (string | null | undefined)[];
}>();
</script>

<style scoped>
@import "./styles.css";

.context {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-color-secondary, #64748b);
  padding: 0.5rem 0.75rem;
  border-top: 1px solid var(--bg-surface-200, #e2e8f0);
  border-bottom: 1px solid var(--bg-surface-200, #e2e8f0);
  flex-wrap: wrap;
}
</style>
