<template>
  <div v-if="!getErrors" id="network-data-quality-summary" class="pa-2">
    <v-card :loading="!getData" elevation="10" class="ma-4 pa-2">
      <Chart
        v-if="dataInStore"
        id="viz-category"
        title="Network Data Quality Issues By Category"
        :data="getData.networkQualitySummary"
        :config="specIssueStratificationByCategory"
      />
    </v-card>
    <v-card :loading="!getData" elevation="10" class="ma-4 pa-2">
      <Chart
        v-if="dataInStore"
        id="viz-table"
        title="Network Data Quality Issues by CDM Table"
        :data="getData.networkQualitySummary"
        :config="specIssueStratificationByTable"
      />
    </v-card>
  </div>
</template>

<script>
import { chartConfigs, Chart } from "@/widgets/chart";
import { mapGetters } from "vuex";
export default {
  name: "NetworkDataQualitySummary",
  components: {
    Chart,
  },
  data() {
    return {
      specIssueStratificationByCategory:
        chartConfigs.specIssueStratificationByCategory,
      specIssueStratificationByTable:
        chartConfigs.specIssueStratificationByTable,
    };
  },
  computed: {
    ...mapGetters(["getData", "getErrors", "dataInStore"]),
  },
};
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
