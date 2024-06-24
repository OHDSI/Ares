<template>
  <Panel header="Network Data Quality Issues By Category">
    <Chart
      id="viz-category"
      :data="store.getters.getData[NETWORK_QUALITY_SUMMARY]"
      :chartSpec="specIssueStratificationByCategory"
    />
  </Panel>
</template>

<script setup lang="ts">
import { NETWORK_QUALITY_SUMMARY } from "@/shared/config/files";
import { Chart } from "@/widgets/chart";
import { specIssueStratificationByCategory } from "./specIssueStratificationByCategory";
import { useStore } from "vuex";
import Panel from "primevue/panel";

const store = useStore();
</script>

<style scoped></style>
