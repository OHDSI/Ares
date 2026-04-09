<template>
  <Button
    label="Generate"
    :disabled="disabled"
    @click="$emit('click')"
    unstyled
    :pt="{
      root: {
        class:
          'inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md border border-primary-400 dark:border-primary-400 text-primary-600 dark:text-primary-300 bg-primary-50/50 dark:bg-primary-500/10 hover:bg-primary-100 dark:hover:bg-primary-500/20 hover:border-primary-500 dark:hover:border-primary-300 hover:text-primary-700 dark:hover:text-primary-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer whitespace-nowrap',
      },
    }"
  />
</template>

<script setup>
import Button from "primevue/button";

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["click"]);
</script>
