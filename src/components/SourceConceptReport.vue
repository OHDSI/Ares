<template>
  <div>
    <div v-if="componentFailed">
      <error v-bind:text="errorText" v-bind:details="errorDetails"></error>
    </div>
    <v-container v-if="!componentFailed">
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-1 text-uppercase text-h6"
          >Data Source Release Comparison
        </v-layout>
        <v-layout class="ma-0 mb-5 d-flex justify-space-between">
          <h2 class="text-uppercase">{{conceptName}}</h2>
          <ReturnButton />
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
import {flatten, sumBy} from "lodash";
import error from "./Error.vue";
import * as d3Format from "d3-format";
import * as d3 from "d3-time-format";
import ReturnButton from "@/components/ReturnButton";

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
    ReturnButton,
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

    loadRelease(selectedSource, release) {
      return new Promise((resolve, reject) => {
        const url = `data/${selectedSource.cdm_source_key}/${release.release_id}/concepts/${this.$route.params.domain}/concept_${this.$route.params.concept}.json`

        axios.get(url)
            .then(response => resolve({response, release}))
            .catch(error => reject(error));
      })
    },
    load() {
      // first get network data source listing
      axios.get("data/index.json").then((response) => {
        this.sources = response.data.sources;

        const dateParse = d3.timeParse("%Y%m");
        const selectedSource = this.sources.find(s => s.cdm_source_key === this.$route.params.cdm);

        const requests = selectedSource.releases.map(release => this.loadRelease(selectedSource, release))

        Promise.allSettled(requests).then(responses => {
          const parsedResponses = responses
              .filter(response => response.status === 'fulfilled')
              .map(response => ({
                data: response.value.response.data,
                release: response.value.release
              }))

          if (!parsedResponses.length) return

          this.componentFailed = false
          this.conceptName = parsedResponses[0].data.CONCEPT_NAME[0]
          this.conceptId = parsedResponses[0].data.CONCEPT_ID[0]
          this.numPersons = sumBy(parsedResponses, item => item.data.NUM_PERSONS[0])

          const prevalence = parsedResponses.map(response => response.data.PREVALENCE_BY_MONTH.map(prevalence => {
                return {
                  ...prevalence,
                  date: dateParse(prevalence.X_CALENDAR_MONTH),
                  release: response.release.release_name
                }
              }
          ))

          this.specRecordProportionByMonth.data = {
            values: flatten(prevalence)
          }

          embed(
              "#viz-recordproportionbymonth",
              this.specRecordProportionByMonth
          );
          this.dataLoaded = true;
        })
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
