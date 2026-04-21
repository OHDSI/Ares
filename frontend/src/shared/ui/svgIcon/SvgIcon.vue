<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path :d="path" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    path: string;
    size?: number | string;
    type?: string;
  }>(),
  { size: 24 }
);
</script>
