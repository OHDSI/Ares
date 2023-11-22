<template>
  <div
    v-if="store.getters.dataInStore && !store.getters.getErrors"
    class="pa-1"
  >
    <PerformanceInformation />
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";

const store = useStore();

import PerformanceInformation from "@/pages/reports/release/PerformanceReport/components/PerformanceInformation.vue";
</script>

<style scoped>
td {
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
