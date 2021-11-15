<template>
  <div id="network-data-quality-summary" class="pa-2">
    <div v-if="componentFailed">
      <error v-bind:text="errorText" v-bind:details="errorDetails"></error>
    </div>
    <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
      <v-card-title>Network Data Quality Issues by Category</v-card-title>
      <div class="viz-container" id="viz-category"></div>
    </v-card>
    <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
      <v-card-title>Network Data Quality Issues by CDM Table</v-card-title>
      <div class="viz-container" id="viz-table"></div>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";
import * as d3 from "d3-dsv";
import error from "./Error.vue";
import embed from "vega-embed";

export default {
  data() {
    return {
      componentFailed: false,
      dataLoaded: false,
      failureSummary: [],
      specIssueStratificationByCategory: {
        $schema: "https://vega.github.io/schema/vega-lite/v4.json",
        data: null,
        width: "container",
        height: 200,
        mark: "bar",
        params: [
          {
            name: "select",
            on: [{ events: "mousedown", update: "datum" }],
          },
        ],
        encoding: {
          y: {
            field: "CATEGORY",
            type: "ordinal",
            title: null,
          },
          x: {
            field: "CHECK_NAME",
            aggregate: "count",
            title: "Number of Issues",
          },
          color: {
            field: "CDM_SOURCE_ABBREVIATION",
            type: "nominal",
            title: "Data Source",
            legend: {
              orient: "bottom",
              title: null,
            },
          },
          detail: [
            { field: "RELEASE_ID", type: "nominal" },
            { field: "CDM_SOURCE_KEY", type: "nominal" },
          ],
        },
      },
      specIssueStratificationByTable: {
        $schema: "https://vega.github.io/schema/vega-lite/v4.json",
        data: null,
        width: "container",
        height: 300,
        mark: "bar",
        encoding: {
          y: {
            field: "CDM_TABLE_NAME",
            type: "ordinal",
            title: null,
          },
          x: {
            field: "CHECK_NAME",
            aggregate: "count",
            title: "Number of Issues",
          },
          color: {
            field: "CDM_SOURCE_ABBREVIATION",
            type: "nominal",
            title: "Data Source",
            legend: {
              orient: "bottom",
              title: null,
            },
          },
        },
      },
    };
  },
  created() {
    var vm = this;
    axios
      .get("data/network-data-quality-summary.csv")
      .then((response) => {
        vm.failureSummary = d3.csvParse(response.data);
        vm.componentFailed = false;
        vm.dataLoaded = true;
        vm.specIssueStratificationByCategory.data = {
          values: vm.failureSummary,
        };
        vm.specIssueStratificationByTable.data = {
          values: vm.failureSummary,
        };
        embed("#viz-category", vm.specIssueStratificationByCategory).then(
          (vega) => {
            vega.view.addSignalListener("select", (name, value) => {
              var routeUrl =
                "/cdm/" +
                value.CDM_SOURCE_ +
                "/" +
                value.cdm_release_key +
                "/data_quality?tab=results&categoryFailFilter=" +
                value.c;
              console.log(routeUrl);
              console.log(value);
            });
          }
        );
        embed("#viz-table", vm.specIssueStratificationByTable).then(() => {
          window.dispatchEvent(new Event("resize"));
        });
      })
      .catch((err) => {
        vm.componentFailed = true;
        console.log("explorer failed to load network data quality summary");
        console.log(err);
      });
  },
  components: {
    error,
  },
  methods: {
    navigate: function (route) {
      this.$router.push(route);
      // hide tooltip otherwise it persists on navigation
      document.getElementById("vg-tooltip-element").style.display = "none";
    },
  },
  name: "network-data-quality-summary",
  props: {},
};
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
