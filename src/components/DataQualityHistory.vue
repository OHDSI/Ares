<template>
  <div>
    <explorer></explorer>
    <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
      <v-card-title>Historical Data Quality</v-card-title>
      <div class="viz-container" id="viz-dataqualityresults"></div>
      <v-data-table
        class="viz-container"
        dense
        :items="historyRecords"
        :headers="historyColumns"
      >
        <template v-slot:item="records">
          <tr>
            <td>{{ records.item.cdm_release_date }}</td>
            <td>{{ records.item.dqd_execution_date }}</td>
            <td class="text-right">{{ records.item.count_passed }}</td>
            <td class="text-right">{{ records.item.count_failed }}</td>
            <td class="text-right">{{ records.item.count_total }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
      <v-card-title>Historical Data Quality by Category</v-card-title>
      <div class="viz-container" id="viz-dataqualityresultsbycategory"></div>
    </v-card>

    <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
      <v-card-title>Historical Data Quality by Domain</v-card-title>
      <div class="viz-container" id="viz-dataqualityresultsbydomain"></div>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";
import _ from "lodash";
import embed from "vega-embed";
import explorer from "./Explorer.vue";

export default {
  components: {
    explorer,
  },
  data() {
    return {
      dataLoaded: false,
      historyRecords: [],
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
      specDataQualityResultsByDomain: {
        $schema: "https://vega.github.io/schema/vega-lite/v4.json",
        data: null,
        width: "container",
        height: 150,
        description: "Data Quality Results by Date",
        mark: { type: "line", interpolate: "linear", point: true },
        encoding: {
          x: {
            field: "dqd_execution_date",
            type: "temporal",
            timeUnit: "yearmonthdate",
            axis: {
              title: "CDM Release Date",
            },
          },
          y: {
            field: "count_value",
            aggregate: "sum",
            type: "quantitative",
            axis: {
              title: "Checks Failed",
            },
          },
          color: {
            field: "cdm_table_name",
          },
        },
      },
      specDataQualityResultsByCategory: {
        $schema: "https://vega.github.io/schema/vega-lite/v4.json",
        data: null,
        width: "container",
        height: 150,
        description: "Data Quality Results by Date",
        mark: { type: "line", interpolate: "linear", point: true },
        encoding: {
          x: {
            field: "dqd_execution_date",
            type: "temporal",
            timeUnit: "yearmonthdate",
            axis: {
              title: "CDM Release Date",
            },
          },
          y: {
            field: "count_value",
            aggregate: "sum",
            type: "quantitative",
            axis: {
              title: "Checks Failed",
            },
          },
          color: {
            field: "category",
          },
        },
      },
      specDataQualityResults: {
        $schema: "https://vega.github.io/schema/vega-lite/v4.json",
        data: null,
        width: "container",
        height: 100,
        description: "Data Quality Results by Date",
        mark: { type: "line", interpolate: "linear", point: true },
        encoding: {
          x: {
            field: "cdm_release_date",
            type: "temporal",
            timeUnit: "yearmonthdate",
            axis: {
              title: "CDM Release Date",
            },
          },
          y: {
            field: "count_failed",
            type: "quantitative",
            axis: {
              title: "Checks Failed",
            },
          },
        },
      },
    };
  },
  created() {
    this.load();
  },
  watch: {
    $route() {
      this.load();
    },
  },
  methods: {
    load: function () {
      var vm = this;
      var dataUrl =
        "data/" + this.$route.params.cdm + "/data-quality-index.json";

      axios.get(dataUrl).then((response) => {
        vm.dataLoaded = true;
        var dataQualityRecords = response.data.dataQualityRecords;
        dataQualityRecords = _(dataQualityRecords)
          .orderBy("cdm_release_date")
          .reverse()
          .value();
        vm.historyRecords = dataQualityRecords;
        vm.specDataQualityResults.data = {
          values: vm.historyRecords,
        };
        embed("#viz-dataqualityresults", vm.specDataQualityResults).then(() => {
          window.dispatchEvent(new Event("resize"));
        });

        vm.specDataQualityResultsByCategory.data = {
          values: response.data.dataQualityRecordsStratified,
        };
        embed(
          "#viz-dataqualityresultsbycategory",
          vm.specDataQualityResultsByCategory
        ).then(() => {
          window.dispatchEvent(new Event("resize"));
        });

        vm.specDataQualityResultsByDomain.data = {
          values: response.data.dataQualityRecordsStratified,
        };
        embed(
          "#viz-dataqualityresultsbydomain",
          vm.specDataQualityResultsByDomain
        ).then(() => {
          window.dispatchEvent(new Event("resize"));
        });
      });
    },
    displayDetails: function (resultFileName) {
      this.$router.push({ path: "/dq-results/" + resultFileName });
    },
  },
};
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>