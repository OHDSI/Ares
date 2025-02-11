<template>
  <div class="flex flex-row justify-between">
    <h1 class="font-light uppercase text-2xl text-black dark:text-white">
      {{ props.title }}
    </h1>
    <slot name="action"></slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
}

const props = defineProps<Props>();
</script>

<style scoped></style>
