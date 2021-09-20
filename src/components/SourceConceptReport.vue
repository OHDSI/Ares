<template>
  <div>
    <div v-if="componentFailed">
      <error v-bind:text="errorText" v-bind:details="errorDetails"></error>
    </div>
    <v-container v-if="!componentFailed">
      <v-responsive min-width="900">
        <explorer></explorer>
        <v-layout class="ma-0 mb-1 text-uppercase text-h6"
          >Data Source Release Comparison
        </v-layout>
        <v-layout class="ma-0 mb-5 text-uppercase text-h6"
          >{{ conceptName }}
        </v-layout>
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
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <v-card-title>Record Proportion by Month</v-card-title>
          <div class="viz-container" id="viz-recordproportionbymonth"></div>
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
import explorer from "./Explorer.vue";
import * as d3Format from "d3-format";
import * as d3 from "d3-time-format";

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
      cdmSourceName: "",
      specRecordProportionByMonth: {
        $schema: "https://vega.github.io/schema/vega-lite/v4.json",
        data: null,
        vconcat: [
          {
            height: 150,
            width: "container",
            description: "Domain Data Density",
            mark: { type: "circle", opacity: 0.5 },
            selection: {
              release: { type: "multi", fields: ["release"], bind: "legend" },
            },
            encoding: {
              x: {
                field: "date",
                type: "temporal",
                timeUnit: "yearmonth",
                scale: { domain: { selection: "brush" } },
                axis: { title: "" },
              },
              y: {
                field: "Y_PREVALENCE_1000PP",
                type: "quantitative",
                title: "Record Proportion per 1000",
              },
              color: {
                title: "Release",
                field: "release",
              },
              opacity: {
                condition: { selection: "release", value: 1 },
                value: 0.2,
              },
              tooltip: [
                { field: "release", title: "Release" },
                {
                  field: "Y_PREVALENCE_1000PP",
                  title: "RPP1000",
                  type: "quantitative",
                },
                {
                  field: "date",
                  title: "Date",
                  type: "temporal",
                  timeUnit: "yearmonth",
                },
              ],
            },
          },
          {
            width: "container",
            height: 25,
            mark: { type: "line", opacity: 0.5 },
            selection: {
              brush: { type: "interval", encodings: ["x"] },
            },
            encoding: {
              x: {
                field: "date",
                type: "temporal",
                title: "Date",
                timeUnit: "yearmonth",
              },
              y: {
                field: "Y_PREVALENCE_1000PP",
                type: "quantitative",
                title: "",
              },
              color: {
                field: "release",
              },
            },
          },
        ],
      },
    };
  },
  components: {
    error,
    explorer,
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
    load: function () {
      var self = this;
      var requests = [];
      var dateParse = d3.timeParse("%Y%m");
      // first get network data source listing
      axios.get("data/index.json").then((response) => {
        self.sources = response.data.sources;
        var selectedSource = self.sources.find(
          (s) => s.cdm_source_key == this.$route.params.cdm
        );
        selectedSource.releases.forEach((release) => {
          var dataUrl =
            "data/" +
            selectedSource.cdm_source_key +
            "/" +
            release.release_id +
            "/concepts/" +
            this.$route.params.domain +
            "/concept_" +
            this.$route.params.concept +
            ".json";
          requests.push(axios.get(dataUrl));
        });
        axios.all(requests).then(
          axios.spread((...responses) => {
            self.componentFailed = false;
            self.conceptName = responses[0].data.CONCEPT_NAME[0];
            self.conceptId = responses[0].data.CONCEPT_ID[0];
            self.numPersons = _.sumBy(responses, function (r) {
              return r.data.NUM_PERSONS[0];
            });
            var allData = [];

            responses.forEach((r, ri) => {
              r.data.PREVALENCE_BY_MONTH.forEach((v, i) => {
                r.data.PREVALENCE_BY_MONTH[i].date = dateParse(
                  v.X_CALENDAR_MONTH
                );
                r.data.PREVALENCE_BY_MONTH[i].release =
                  selectedSource.releases[ri].release_name;
              });

              allData = allData.concat(r.data.PREVALENCE_BY_MONTH);
            });

            self.specRecordProportionByMonth.data = {
              values: allData,
            };

            embed(
              "#viz-recordproportionbymonth",
              self.specRecordProportionByMonth
            );
            self.dataLoaded = true;
          })
        );
      });
    },
  },
  computed: {},
};
</script>

<style scoped>
.viz-container {
  width: 80%;
}
</style>
