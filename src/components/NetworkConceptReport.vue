<template>
  <div>
    <div v-if="componentFailed">
      <error v-bind:text="errorText" v-bind:details="errorDetails"></error>
    </div>
    <v-container v-if="!componentFailed">
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-6 text-uppercase text-h6"
          >{{ conceptName }} NETWORK REPORT</v-layout
        >
        <v-row v-if="dataLoaded" justify="start"
          ><v-col cols="2" align="center">
            <v-icon left color="info">mdi-identifier</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="conceptId"
            ></v-badge>
            <p class="text-caption">Concept Identifier</p></v-col
          ><v-col cols="2" align="center">
            <v-icon left color="info">mdi-account-group</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="numPersons"
            ></v-badge>
            <p class="text-caption">Number of People in Network</p></v-col
          ></v-row
        >
        <v-card
          :loading="!dataLoaded"
          v-if="hasMeasurementValueDistribution"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-card-title
            >Measurement Value Distributions by Database and Unit</v-card-title
          >
          <v-layout class="pa-4" justify-end>
            <v-btn color="primary" @click="toggleMeasurementValueChart()"
              ><v-icon dark left>mdi-toggle-switch</v-icon
              >{{ toggleMode }}</v-btn
            >
          </v-layout>
          <div
            class="viz-container"
            id="viz-measurementvaluedistribution"
          ></div>
          <v-card-text>
            <router-link to="/help">
              <v-icon small color="info" left> mdi-help-circle</v-icon>Learn how
              to interpret this plot.
            </router-link>
          </v-card-text>
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script>
import axios from "axios";
import embed from "vega-embed";
import _ from "lodash";
import error from "./Error.vue";
import * as d3Format from "d3-format";

export default {
  data() {
    return {
      sources: [],
      componentFailed: false,
      errorText: "",
      errorDetails: "",
      toggleMode: "MIN/MAX",
      hasMeasurementValueDistribution: false,
      hasAgeAtFirstDiagnosis: false,
      hasAgeAtFirstOccurrence: false,
      hasAgeAtFirstExposure: false,
      hasConditionsByType: false,
      hasVisitDurationByType: false,
      hasLengthOfEra: false,
      hasCountFailed: false,
      countFailed: 0,
      conceptData: null,
      conceptName: "",
      conceptId: 0,
      dataLoaded: false,
      historyRecords: [],
      cdmSourceName: "",
      specMeasurementValueDistribution: {
        $schema: "https://vega.github.io/schema/vega-lite/v4.json",
        height: 400,
        width: "container",
        data: {},
        encoding: {
          y: { field: "SOURCE_UNIT_KEY", type: "nominal", title: null },
        },
        layer: [
          {
            mark: { type: "rule" },
            encoding: {
              x: {
                field: "MIN_VALUE",
                type: "quantitative",
                scale: { zero: false },
                title: null,
              },
              x2: { field: "MAX_VALUE" },
            },
          },
          {
            mark: { type: "bar", size: 14, tooltip: {} },
            encoding: {
              x: { field: "P25_VALUE", type: "quantitative" },
              x2: { field: "P75_VALUE" },
              color: {
                field: "SOURCE_UNIT_KEY",
                type: "nominal",
                legend: null,
              },
            },
          },
          {
            mark: { type: "tick", color: "white", size: 14 },
            encoding: {
              x: { field: "MEDIAN_VALUE", type: "quantitative" },
            },
          },
        ],
        row: {
          field: "SOURCE_UNIT_KEY",
          type: "nominal",
          title: "Measurement",
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
    toggleMeasurementValueChart() {
      if (this.toggleMode == "MIN/MAX") {
        this.specMeasurementValueDistribution.layer[0].encoding.x.field =
          "P10_VALUE";
        this.specMeasurementValueDistribution.layer[0].encoding.x2.field =
          "P90_VALUE";
        this.toggleMode = "P10/P90";
      } else {
        this.specMeasurementValueDistribution.layer[0].encoding.x.field =
          "MIN_VALUE";
        this.specMeasurementValueDistribution.layer[0].encoding.x2.field =
          "MAX_VALUE";
        this.toggleMode = "MIN/MAX";
      }
      embed(
        "#viz-measurementvaluedistribution",
        this.specMeasurementValueDistribution
      ).then(() => {
        window.dispatchEvent(new Event("resize"));
      });
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

      // first get network data source listing
      axios.get("data/index.json").then((response) => {
        self.sources = response.data.sources;
        self.sources.forEach((source) => {
          var dataUrl =
            "data/" +
            source.cdm_source_key +
            "/" +
            source.releases[0].release_id +
            "/concepts/" +
            this.$route.params.domain +
            "/concept_" +
            this.$route.params.concept +
            ".json";
          sourceRequests.push(axios.get(dataUrl));

          // get concept summary data for each network data source
          axios.all(sourceRequests).then(
            axios.spread((...responses) => {
              self.componentFailed = false;
              self.conceptName = responses[0].data.CONCEPT_NAME[0];
              self.conceptId = responses[0].data.CONCEPT_ID[0];
              self.numPersons = _.sumBy(
                responses,
                (r) => r.data.NUM_PERSONS[0]
              );

              if (
                responses[0].data.MEASUREMENT_VALUE_DISTRIBUTION &&
                responses[0].data.MEASUREMENT_VALUE_DISTRIBUTION.length > 0
              ) {
                var allData = [];
                responses.forEach((r, i) => {
                  r.data.MEASUREMENT_VALUE_DISTRIBUTION.forEach((d) => {
                    d.SOURCE_UNIT_KEY =
                      self.sources[i].cdm_source_key + " - " + d.CATEGORY;
                  });
                  allData = allData.concat(
                    r.data.MEASUREMENT_VALUE_DISTRIBUTION
                  );
                });
                self.specMeasurementValueDistribution.data = {
                  values: allData,
                };
                self.hasMeasurementValueDistribution = true;
                embed(
                  "#viz-measurementvaluedistribution",
                  self.specMeasurementValueDistribution
                ).then(() => {
                  window.dispatchEvent(new Event("resize"));
                });
              }

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
