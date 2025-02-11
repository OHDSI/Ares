<template>
  <div
    v-if="!store.getters.getErrors"
    class="flex flex-col gap-5"
    id="network-data-quality-summary"
  >
    <NetworkDataQualityIssuesByCategory />
    <NetworkDataQualityIssuesByCdmTable />
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import NetworkDataQualityIssuesByCategory from "@/pages/reports/network/NetworkDataQualitySummary/charts/NetworkDataQualityIssuesByCategory/NetworkDataQualityIssuesByCategory.vue";
import NetworkDataQualityIssuesByCdmTable from "@/pages/reports/network/NetworkDataQualitySummary/charts/NetworkDataQualityIssuesByCdmTable/NetworkDataQualityIssuesByCdmTable.vue";

const store = useStore();
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
