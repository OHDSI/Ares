<template>
  <Panel header="Network Data Quality Issues by CDM Table">
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-table"
      :data="store.getters.getData[NETWORK_QUALITY_SUMMARY]"
      :chartSpec="specIssueStratificationByTable"
    />
  </Panel>
</template>

<script setup lang="ts">
import { NETWORK_QUALITY_SUMMARY } from "@/shared/config/files";
import { Chart } from "@/widgets/chart";
import { specIssueStratificationByTable } from "./specIssueStratificationByTable";
import { useStore } from "vuex";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { specIssueStratificationByCategory } from "@/pages/reports/network/NetworkDataQualitySummary/charts/NetworkDataQualityIssuesByCategory/specIssueStratificationByCategory";
import Panel from "primevue/panel";
const store = useStore();
</script>

<style scoped></style>
