<template>
  <div>
    <v-card
      v-if="!getErrors"
      :loading="!dataLoaded"
      elevation="10"
      class="ma-4 pa-2"
    >
      <VegaChart
        v-if="dataLoaded"
        id="viz-dataqualityresults"
        title="Historical Data Quality"
        :data="getData.qualityIndex.dataQualityRecords"
        :config="specDataQualityResults"
      />
      <v-data-table
        v-if="dataLoaded"
        class="viz-container"
        dense
        :items="getData.qualityIndex.dataQualityRecords"
        :headers="historyColumns"
      >
        <template v-if="dataLoaded" v-slot:item="records">
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
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
      <VegaChart
        v-if="dataLoaded"
        id="viz-dataqualityresultsbycategory"
        title="Historical Data Quality by Category"
        :data="getData.qualityIndex.dataQualityRecordsStratified"
        :config="specDataQualityResultsByCategory"
      />
    </v-card>

    <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
      <VegaChart
        v-if="dataLoaded"
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
      dataLoaded: false,
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
      ],
      specDataQualityResultsByDomain: charts.specDataQualityResultsByDomain,
      specDataQualityResultsByCategory: charts.specDataQualityResultsByCategory,
      specDataQualityResults: charts.specDataQualityResults,
    };
  },
  watch: {
    $route() {
      this.load();
    },
  },
  created() {
    this.load();
  },

  computed: {
    ...mapGetters(["getData", "getErrors"]),
  },

  methods: {
    load() {
      this.dataLoaded = false;
      this.$store
        .dispatch(FETCH_FILES, {
          files: [{ name: QUALITY_INDEX, required: true }],
        })
        .then(() => {
          if (!this.getErrors) {
            this.dataLoaded = true;
          }
        });
    },
    displayDetails: function (resultFileName) {
      this.$router.push({ path: "/dq-results/" + resultFileName });
    },
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
        "/data_quality?tab=results&failFilter=enabled"
      );
    },
  },
};
</script>

<style scoped></style>
