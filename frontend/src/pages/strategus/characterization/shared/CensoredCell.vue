<template>
  <span :class="{ 'censored-cell': isCensored }">{{ text }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ text: string | number }>();

const isCensored = computed(
  () => typeof props.text === "string" && props.text.startsWith("<")
);
</script>

<style scoped>
.censored-cell {
  opacity: 0.4;
  font-style: italic;
}
</style>
