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
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        height: 200,
        data: {},
        width: "container",
        encoding: {
          x: {
            field: "INTERVAL_INDEX",
            type: "quantitative",
            title: "Age",
          },
          y: {
            field: "PERCENT_VALUE",
            type: "quantitative",
            axis: { format: "0.0%" },
            title: "% of Population",
          },
          color: {
            field: "DATA_SOURCE_KEY",
            title: "Data Source",
          },
        },
        layer: [
          {
            mark: { type: "line", interpolate: "linear" },
            params: [
              {
                name: "source",
                select: { type: "point", fields: ["DATA_SOURCE_KEY"] },
                bind: "legend",
              },
            ],
            encoding: {
              opacity: {
                condition: { param: "source", value: 1 },
                value: 0.2,
              },
            },
          },
          {
            selection: {
              dataSource: {
                type: "multi",
                fields: ["DATA_SOURCE_KEY"],
                bind: "legend",
              },
              x: {
                type: "single",
                on: "mousemove",
                encodings: ["x"],
                nearest: true,
              },
            },
            transform: [
              {
                filter: { selection: "dataSource" },
              },
            ],
            mark: { type: "point", tooltip: true },
          },
          {
            transform: [
              {
                filter: {
                  and: ["x.INTERVAL_INDEX", { selection: "x" }],
                },
              },
              { filter: { selection: "dataSource" } },
            ],
            layer: [
              {
                mark: "rule",
                encoding: {
                  y: {
                    height: 1,
                  },
                  color: {
                    value: "black",
                  },
                },
              },
            ],
          },
        ],
      },

      specCumulativeObservation: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        height: 150,
        width: "container",
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
            axis: { format: "0.0%" },
          },
          color: {
            field: "DATA_SOURCE_KEY",
            title: "Data Source",
          },
        },

        layer: [
          {
            mark: { type: "line", interpolate: "linear" },
            params: [
              {
                name: "source",
                select: { type: "point", fields: ["DATA_SOURCE_KEY"] },
                bind: "legend",
              },
            ],
            encoding: {
              opacity: {
                condition: { param: "source", value: 1 },
                value: 0.2,
              },
            },
          },
          {
            selection: {
              dataSource: {
                type: "multi",
                fields: ["DATA_SOURCE_KEY"],
                bind: "legend",
              },
              x: {
                type: "single",
                on: "mousemove",
                encodings: ["x"],
                nearest: true,
              },
            },
            transform: [
              {
                filter: { selection: "dataSource" },
              },
            ],
            mark: { type: "point", tooltip: true },
          },
          {
            transform: [
              {
                filter: {
                  and: ["x.YEARS", { selection: "x" }],
                },
              },
              { filter: { selection: "dataSource" } },
            ],
            layer: [
              {
                mark: "rule",
                encoding: {
                  y: {
                    height: 1,
                  },
                  color: {
                    value: "black",
                  },
                },
              },
            ],
          },
        ],
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
                allAgeAtFirstObservationData =
                  allAgeAtFirstObservationData.concat(
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
