<template>
  <div class="pa-1">
    <div class="flex flex-col gap-5">
      <AchillesPerformance />
      <CohortDiagnosticsPerformance />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";

const store = useStore();

import AchillesPerformance from "@/pages/reports/release/PerformanceReport/components/AchillesPerformance.vue";
import CohortDiagnosticsPerformance from "@/pages/reports/release/PerformanceReport/components/CohortDiagnosticsPerformance.vue";
</script>

<style scoped>
td {
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
