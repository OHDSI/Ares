<template>
  <Panel header="Network Data Quality Issues By Category">
    <Echarts
      id="viz-category"
      :data="data"
      :chart-spec="getEChartsIssueStratificationByCategory"
    />
  </Panel>
</template>

<script setup lang="ts">
import { NETWORK_QUALITY_SUMMARY } from "@/shared/config/files";
import { useStore } from "vuex";
import Panel from "primevue/panel";
import Echarts from "@/widgets/echarts/Echarts.vue";
import getEChartsIssueStratificationByCategory from "@/pages/reports/network/NetworkDataQualitySummary/charts/NetworkDataQualityIssuesByCategory/issuesStratification";
import { computed } from "vue";

const store = useStore();

const data = computed(() => store.getters.getData[NETWORK_QUALITY_SUMMARY]);
</script>

<style scoped></style>
