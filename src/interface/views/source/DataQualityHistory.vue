<template>
  <div>
    <v-card
      v-if="!getErrors"
      :loading="!dataInStore"
      elevation="10"
      class="ma-4 pa-2"
    >
      <VegaChart
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
        <template v-if="dataInStore" v-slot:item="records">
          <tr>
            <td>
              <router-link
                :to="getDataQualityOverviewRoute(records.item)"
                :title="records.item.cdm_release_date"
                >{{ records.item.cdm_release_date }}
              </router-link>
            </td>
            <td>{{ records.item.dqd_execution_date }}</td>
            <td class="text-right">{{ records.item.count_passed }}</td>
            <td class="text-right">
              <router-link
                :to="getDataQualityResultsFailedRoute(records.item)"
                :title="records.item.count_failed"
                >{{ records.item.count_failed }}
              </router-link>
            </td>
            <td class="text-right">{{ records.item.count_total }}</td>
            <td class="text-right">{{ records.item.vocabulary_version }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
      <VegaChart
        v-if="dataInStore"
        id="viz-dataqualityresultsbycategory"
        title="Historical Data Quality by Category"
        :data="getData.qualityIndex.dataQualityRecordsStratified"
        :config="specDataQualityResultsByCategory"
      />
    </v-card>

    <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
      <VegaChart
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
import { charts } from "@/configs";
import { QUALITY_INDEX } from "@/data/services/getFilePath";
import { FETCH_FILES } from "@/data/store/modules/view/actions.type";
import VegaChart from "@/interface/components/VegaChart";
import { mapGetters } from "vuex";

export default {
  components: { VegaChart },
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
      specDataQualityResultsByDomain: charts.specDataQualityResultsByDomain,
      specDataQualityResultsByCategory: charts.specDataQualityResultsByCategory,
      specDataQualityResults: charts.specDataQualityResults,
    };
  },

  computed: {
    ...mapGetters(["getData", "getErrors", "dataInStore"]),
  },

  methods: {
    getDataQualityOverviewRoute(item) {
      return (
        "/cdm/" +
        this.$route.params.cdm +
        "/" +
        item.cdm_release_date.replaceAll("-", "") +
        "/data_quality?tab=overview"
      );
    },
    getDataQualityResultsFailedRoute(item) {
      return (
        "/cdm/" +
        this.$route.params.cdm +
        "/" +
        item.cdm_release_date.replaceAll("-", "") +
        "/data_quality?tab=results&FAILED=FAIL"
      );
    },
  },
};
</script>

<style scoped></style>
