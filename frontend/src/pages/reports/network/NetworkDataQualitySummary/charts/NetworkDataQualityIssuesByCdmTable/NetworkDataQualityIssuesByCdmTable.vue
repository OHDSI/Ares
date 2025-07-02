<template>
  <Panel header="Network Data Quality Issues by CDM Table">
    <Echarts
      id="viz-table"
      :data="data"
      :chart-spec="getEChartsIssueStratificationByTable"
      height="650px"
    />
  </Panel>
</template>

<script setup lang="ts">
import { NETWORK_QUALITY_SUMMARY } from "@/shared/config/files";
import { useStore } from "vuex";
import Panel from "primevue/panel";
import Echarts from "@/widgets/echarts/Echarts.vue";
import getEChartsIssueStratificationByTable from "@/pages/reports/network/NetworkDataQualitySummary/charts/NetworkDataQualityIssuesByCdmTable/issuesStratificationByTable";
import { computed } from "vue";

const store = useStore();

const data = computed(() => store.getters.getData[NETWORK_QUALITY_SUMMARY]);
</script>

<style scoped></style>
