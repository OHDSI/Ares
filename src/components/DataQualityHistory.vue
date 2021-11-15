<template>
  <div>
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

export default {
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
        selection: {
          domain: { type: "multi", fields: ["cdm_table_name"], bind: "legend" },
        },
        encoding: {
          opacity: {
            condition: { selection: "domain", value: 1 },
            value: 0.2,
          },
          x: {
            field: "cdm_release_date",
            type: "temporal",
            timeUnit: "yearmonthdate",
            axis: {
              title: "CDM Release Date",
            },
            scale: {
              type: "utc",
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
            title: "Check Domain",
          },
          tooltip: [
            {
              field: "cdm_release_date",
              title: "CDM Release Date",
              type: "temporal",
              format: "%Y-%m-%d",
              scale: {
                type: "utc",
              },
            },
            { field: "cdm_table_name", title: "Check Domain" },
            {
              field: "count_value",
              aggregate: "sum",
              type: "quantitative",
              title: "Checks Failed",
            },
          ],
        },
      },
      specDataQualityResultsByCategory: {
        $schema: "https://vega.github.io/schema/vega-lite/v4.json",
        data: null,
        width: "container",
        height: 150,
        mark: { type: "line", interpolate: "linear", point: true },
        selection: {
          category: { type: "multi", fields: ["category"], bind: "legend" },
        },
        encoding: {
          opacity: {
            condition: { selection: "category", value: 1 },
            value: 0.2,
          },
          x: {
            field: "cdm_release_date",
            type: "temporal",
            timeUnit: "yearmonthdate",
            axis: {
              title: "CDM Release Date",
            },
            scale: {
              type: "utc",
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
            title: "Check Category",
          },
          tooltip: [
            {
              field: "cdm_release_date",
              title: "CDM Release Date",
              type: "temporal",
              format: "%Y-%m-%d",
              scale: {
                type: "utc",
              },
            },
            { field: "category", title: "Check Category" },
            {
              field: "count_value",
              aggregate: "sum",
              type: "quantitative",
              title: "Checks Failed",
            },
          ],
        },
      },
      specDataQualityResults: {
        $schema: "https://vega.github.io/schema/vega-lite/v4.json",
        data: null,
        width: "container",
        height: 100,
        mark: { type: "line", interpolate: "linear", point: true },
        encoding: {
          tooltip: [
            {
              field: "cdm_release_date",
              title: "CDM Release Date",
              type: "temporal",
              format: "%Y-%m-%d",
              scale: {
                type: "utc",
              },
            },
            { field: "count_failed", title: "Checks Failed" },
          ],
          x: {
            field: "cdm_release_date",
            type: "temporal",
            timeUnit: "yearmonthdate",
            axis: {
              title: "CDM Release Date",
            },
            scale: {
              type: "utc",
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

<style scoped>
.viz-container {
  width: 90%;
}
</style>