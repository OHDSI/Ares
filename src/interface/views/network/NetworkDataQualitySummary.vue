<template>
  <div id="network-data-quality-summary" class="pa-2">
    <div v-if="componentFailed">
      <error :text="errorText" :details="errorDetails"></error>
      <ReturnButton block />
    </div>
    <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
      <v-card-title>Network Data Quality Issues by Category</v-card-title>
      <div id="viz-category" class="viz-container"></div>
    </v-card>
    <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
      <v-card-title>Network Data Quality Issues by CDM Table</v-card-title>
      <div id="viz-table" class="viz-container"></div>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";
import * as d3 from "d3-dsv";
import error from "../../components/Error.vue";
import embed from "vega-embed";
import ReturnButton from "@/interface/components/ReturnButton";

export default {
  name: "NetworkDataQualitySummary",
  components: {
    error,
    ReturnButton,
  },
  props: {},
  data() {
    return {
      componentFailed: false,
      dataLoaded: false,
      failureSummary: [],
      specIssueStratificationByCategory: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: null,
        width: "container",
        autosize: "fit",
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
              orient: "right",
              title: null,
              columns: 2,
            },
          },
          detail: [
            { field: "RELEASE_ID", type: "nominal" },
            { field: "CDM_SOURCE_KEY", type: "nominal" },
          ],
        },
      },
      specIssueStratificationByTable: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: null,
        width: "container",
        autosize: "fit",
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
              orient: "right",
              title: null,
              columns: 2,
            },
          },
        },
      },
    };
  },
  created() {
    axios
      .get("data/network-data-quality-summary.csv")
      .then((response) => {
        this.failureSummary = d3.csvParse(response.data);
        this.componentFailed = false;
        this.dataLoaded = true;
        this.specIssueStratificationByCategory.data = {
          values: this.failureSummary,
        };
        this.specIssueStratificationByTable.data = {
          values: this.failureSummary,
        };
        embed("#viz-category", this.specIssueStratificationByCategory).then(
          (vega) => {
            vega.view.addSignalListener("select", (name, value) => {
              const routeUrl =
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
        embed("#viz-table", this.specIssueStratificationByTable).then(() => {
          window.dispatchEvent(new Event("resize"));
        });
      })
      .catch((err) => {
        this.componentFailed = true;
        console.log("explorer failed to load network data quality summary");
        console.log(err);
      });
  },
  methods: {
    navigate: function (route) {
      this.$router.push(route);
      // hide tooltip otherwise it persists on navigation
      document.getElementById("vg-tooltip-element").style.display = "none";
    },
  },
};
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
