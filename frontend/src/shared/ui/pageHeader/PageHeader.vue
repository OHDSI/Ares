<template>
  <div class="flex flex-row justify-between">
    <h1
      class="font-light uppercase text-2xl tracking-wider"
      :style="{ color: headerColor }"
    >
      {{ props.title }}
    </h1>
    <slot name="action"></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";

interface Props {
  title: string;
}

const props = defineProps<Props>();

const store = useStore();
const darkMode = computed(() => store.getters.getSettings.darkMode);
const headerColor = computed(() => (darkMode.value ? "#f1f5f9" : "#1e293b"));
</script>

<style scoped></style>
