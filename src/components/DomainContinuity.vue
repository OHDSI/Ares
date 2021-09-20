<template>
  <v-responsive min-width="900">
    <explorer></explorer>

    <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
      <v-card-title>Domain Continuity</v-card-title>
      <div class="viz-container" id="viz-continuity"></div>
      <info-panel
        details="Domain continuity shows the number of records in each domain table for multiple releases of data from a specific vendor or data source. This is NOT the number of records that occur at specific times within a CDM, but a count of the number of records in a release of a data source, graphed over time. This visualization allows one to see how the data is changing across updates for a single data source."
      ></info-panel>
    </v-card>
  </v-responsive>
</template>

<script>
import embed from "vega-embed";
import axios from "axios";
import explorer from "./Explorer.vue";
import InfoPanel from "./InfoPanel.vue";

export default {
  data() {
    return {
      dataLoaded: false,
      cdmSourceName: "",
      specOverview: {
        $schema: "https://vega.github.io/schema/vega-lite/v4.json",
        data: null,
        facet: {
          row: {
            field: "domain",
            title: null,
            header: {
              title: "# Records by Domain Table",
              labelOrient: "top",
              labelAnchor: "start",
              labelFontSize: 12,
              labelPadding: 2,
              labelFontWeight: "bold",
            },
          },
        },
        config: {
          facet: { spacing: 5 },
        },
        spec: {
          height: 75,
          width: 600,
          description: "Domain Continuity",
          mark: {
            type: "line",
            point: true,
          },
          encoding: {
            x: {
              field: "release_date",
              type: "temporal",
              axis: { title: null },
              timeUnit: "yearmonthdate",
            },
            y: {
              field: "count_records",
              type: "quantitative",
              title: null,
              header: { title: null },
              axis: { tickCount: 4 },
            },
            tooltip: [
              { field: "count_records", title: "# of Records", format: "," },
            ],
            color: { field: "domain", type: "nominal", legend: null },
          },
        },
        resolve: { scale: { y: "independent" } },
      },
    };
  },
  components: {
    explorer,
    InfoPanel,
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
        "data/" + this.$route.params.cdm + "/data-source-history-index.json";

      axios.get(dataUrl).then((response) => {
        vm.dataLoaded = true;
        vm.specOverview.data = {
          values: response.data.domainRecords,
        };
        embed("#viz-continuity", vm.specOverview).then(() => {
          window.dispatchEvent(new Event("resize"));
        });
        vm.dataLoaded = true;
      });
    },
  },
};
</script>

<style scoped>
.viz-container {
  width: 80%;
}
</style>