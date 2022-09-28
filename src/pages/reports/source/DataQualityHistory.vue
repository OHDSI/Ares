<template>
  <div>
    <v-card
      v-if="!getErrors"
      :loading="!dataInStore"
      elevation="10"
      class="ma-4 pa-2"
    >
      <Chart
        v-if="dataInStore"
        id="viz-dataqualityresults"
        title="Historical Data Quality"
        :data="getData.qualityIndex.dataQualityRecords"
        :config="specDataQualityResults"
      />
      <v-data-table
        v-if="dataInStore"
        class="viz-container"
        dense
        :items="getData.qualityIndex.dataQualityRecords"
        :headers="historyColumns"
      >
        <template v-slot:item.cdm_release_date="{ item }">
          <router-link
            :to="{
              name: 'dataQuality',
              query: { tab: 'overview' },
              params: {
                cdm: $route.params.cdm,
                release: item.cdm_release_date.replaceAll('-', ''),
              },
            }"
            :title="item.cdm_release_date"
            >{{ item.cdm_release_date }}
          </router-link>
        </template>
        <template v-slot:item.count_failed="{ item }">
          <router-link
            :to="{
              name: 'dataQuality',
              query: { tab: 'results', FAILED: 'FAIL' },
              params: {
                cdm: $route.params.cdm,
                release: item.cdm_release_date.replaceAll('-', ''),
              },
            }"
            :title="item.count_failed"
            >{{ item.count_failed }}
          </router-link>
        </template>
      </v-data-table>
    </v-card>

    <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
      <Chart
        v-if="dataInStore"
        id="viz-dataqualityresultsbycategory"
        title="Historical Data Quality by Category"
        :data="getData.qualityIndex.dataQualityRecordsStratified"
        :config="specDataQualityResultsByCategory"
      />
    </v-card>

    <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
      <Chart
        v-if="dataInStore"
        id="viz-dataqualityresultsbydomain"
        title="Historical Data Quality by Domain"
        :config="specDataQualityResultsByDomain"
        :data="getData.qualityIndex.dataQualityRecordsStratified"
      />
    </v-card>
  </div>
</template>

<script>
import { chartConfigs, Chart } from "@/widgets/chart";
import { mapGetters } from "vuex";

export default {
  components: { Chart },
  data() {
    return {
      historyColumns: [
        {
          text: "CDM Release Date",
          align: "start",
          sortable: true,
          value: "cdm_release_date",
        },
        {
          text: "DQ Execution Date",
          align: "start",
          sortable: true,
          value: "end_timestamp",
        },
        {
          text: "# Passed",
          align: "end",
          sortable: true,
          value: "count_passed",
        },
        {
          text: "# Failed",
          align: "end",
          sortable: true,
          value: "count_failed",
        },
        {
          text: "# Total",
          align: "end",
          sortable: true,
          value: "count_total",
        },
        {
          text: "Vocabulary",
          align: "end",
          sortable: false,
          value: "vocabulary_version",
        },
      ],
      specDataQualityResultsByDomain:
        chartConfigs.specDataQualityResultsByDomain,
      specDataQualityResultsByCategory:
        chartConfigs.specDataQualityResultsByCategory,
      specDataQualityResults: chartConfigs.specDataQualityResults,
    };
  },

  computed: {
    ...mapGetters(["getData", "getErrors", "dataInStore"]),
  },
};
</script>

<style scoped></style>
