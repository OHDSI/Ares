<template>
  <div
    v-if="!store.getters.getErrors"
    id="network-data-quality-summary"
    class="pa-2"
  >
    <v-card :loading="!store.getters.getData" elevation="10" class="ma-4 pa-2">
      <Chart
        v-if="store.getters.dataInStore"
        id="viz-category"
        title="Network Data Quality Issues By Category"
        :data="store.getters.getData[NETWORK_QUALITY_SUMMARY]"
        :config="chartConfigs.specIssueStratificationByCategory"
      />
    </v-card>
    <v-card :loading="!store.getters.getData" elevation="10" class="ma-4 pa-2">
      <Chart
        v-if="store.getters.dataInStore"
        id="viz-table"
        title="Network Data Quality Issues by CDM Table"
        :data="store.getters.getData[NETWORK_QUALITY_SUMMARY]"
        :config="chartConfigs.specIssueStratificationByTable"
      />
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { chartConfigs, Chart } from "@/widgets/chart";
import { NETWORK_QUALITY_SUMMARY } from "@/shared/config/files";
import { useStore } from "vuex";

const store = useStore();
</script>
<script lang="ts">
export default {
  name: "NetworkDataQualitySummary",
};
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
