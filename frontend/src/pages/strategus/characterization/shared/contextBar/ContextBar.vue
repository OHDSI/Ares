<template>
  <div class="context results-ctx">
    <template v-for="(item, i) in items" :key="i">
      <span class="sep" v-if="i > 0">/</span>
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
@import "../styles.css";

.context {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  padding: 0.25rem 0;
  flex-wrap: wrap;
}

.sep {
  color: var(--color-border-strong);
  font-size: 0.875rem;
  line-height: 1;
  user-select: none;
}
</style>
