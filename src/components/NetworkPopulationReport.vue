<template>
  <div>
    <div v-if="componentFailed">
      <error v-bind:text="errorText" v-bind:details="errorDetails"></error>
    </div>
    <v-container v-if="!componentFailed">
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-6 text-uppercase text-h6"
          >{{ conceptName }} NETWORK POPULATION OVERVIEW</v-layout
        >
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <v-card-title>Age at First Observation</v-card-title>
          <div class="viz-container" id="viz-ageatfirstobservation"></div>
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <v-card-title>Cumulative Observation</v-card-title>
          <div class="viz-container" id="viz-cumulativeobservation"></div>
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script>
import axios from "axios";
import embed from "vega-embed";
/*import _ from "lodash";*/
import error from "./Error.vue";
import * as d3Format from "d3-format";

export default {
  data() {
    return {
      sources: [],
      componentFailed: false,
      errorText: "",
      errorDetails: "",
      conceptData: null,
      conceptName: "",
      conceptId: 0,
      dataLoaded: false,
      historyRecords: [],
      cdmSourceName: "",
      specAgeAtFirstObservation: {
        $schema: "https://vega.github.io/schema/vega-lite/v4.json",
        height: 200,
        data: {},
        width: "container",
        mark: { type: "line", interpolate: "linear" },
        encoding: {
          x: { field: "INTERVAL_INDEX", type: "quantitative", title: "Age" },
          y: {
            field: "PERCENT_VALUE",
            type: "quantitative",
            axis: { format: "0.0%" },
            title: "% of Population",
          },
          color: {
            field: "DATA_SOURCE_KEY",
            title: "Data Source",
            legend: { orient: "bottom", direction: "horizontal", columns: 3 },
          },
          tooltip: [
            {
              field: "PERCENT_VALUE",
              title: "% of People",
              format: "0.2p",
            },
            {
              field: "INTERVAL_INDEX",
              title: "Age",
            },
            {
              field: "DATA_SOURCE_KEY",
              title: "Data Source",
            },
          ],
        },
      },
      specCumulativeObservation: {
        $schema: "https://vega.github.io/schema/vega-lite/v4.json",
        height: 150,
        width: "container",
        mark: { type: "line", tooltip: {}, interpolate: "linear" },
        data: {},
        encoding: {
          x: {
            field: "YEARS",
            type: "quantitative",
            title: "Years of Observation",
          },
          y: {
            field: "PERCENT_PEOPLE",
            type: "quantitative",
            title: "% of People",
            axis: { format: "%" },
          },
          color: {
            field: "DATA_SOURCE_KEY",
            title: "Data Source",
            legend: { orient: "bottom", direction: "horizontal", columns: 3 },
          },
          tooltip: [
            {
              field: "PERCENT_PEOPLE",
              title: "% of People",
              format: "0.2p",
            },
            {
              field: "YEARS",
              title: "Years of Observation",
              format: "0.3",
            },
            {
              field: "DATA_SOURCE_KEY",
              title: "Data Source",
            },
          ],
        },
      },
    };
  },
  components: {
    error,
  },
  created() {
    this.load();
  },
  methods: {
    formatPercent: function (value) {
      return d3Format.format("0.0%")(value);
    },
    triggerResize: function () {
      window.dispatchEvent(new Event("resize"));
    },
    navigateToDataQuality() {
      this.$router.push({
        path:
          "/cdm/" +
          this.$route.params.cdm +
          "/" +
          this.$route.params.release +
          "/data_quality?tab=results&conceptFailFilter=" +
          this.$route.params.concept,
      });
    },
    load: function () {
      var self = this;
      var sourceRequests = [];

      axios.get("data/index.json").then((response) => {
        self.sources = response.data.sources;
        self.sources.forEach((source) => {
          var dataUrl =
            "data/" +
            source.cdm_source_key +
            "/" +
            source.releases[0].release_id +
            "/observationperiod.json";

          sourceRequests.push(axios.get(dataUrl));

          // get concept summary data for each network data source
          axios.all(sourceRequests).then(
            axios.spread((...responses) => {
              self.componentFailed = false;

              var allAgeAtFirstObservationData = [];
              var allCumulativeDurationData = [];

              responses.forEach((r, i) => {
                r.data.AGE_AT_FIRST_OBSERVATION.forEach((d) => {
                  d.DATA_SOURCE_KEY = self.sources[i].cdm_source_key;
                });
                r.data.CUMULATIVE_DURATION.forEach((d) => {
                  d.DATA_SOURCE_KEY = self.sources[i].cdm_source_key;
                });
                allCumulativeDurationData = allCumulativeDurationData.concat(
                  r.data.CUMULATIVE_DURATION
                );
                allAgeAtFirstObservationData = allAgeAtFirstObservationData.concat(
                  r.data.AGE_AT_FIRST_OBSERVATION
                );
              });

              self.specAgeAtFirstObservation.data = {
                values: allAgeAtFirstObservationData,
              };
              self.specCumulativeObservation.data = {
                values: allCumulativeDurationData,
              };

              embed(
                "#viz-ageatfirstobservation",
                self.specAgeAtFirstObservation
              );
              embed(
                "#viz-cumulativeobservation",
                self.specCumulativeObservation
              );

              self.dataLoaded = true;
            })
          );
        });
      });
    },
  },
  computed: {},
};
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
