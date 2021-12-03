<template>
  <div>
    <div v-if="componentFailed">
      <error v-bind:text="errorText" v-bind:details="errorDetails"></error>
      <ReturnButton block />
    </div>
    <v-container v-if="!componentFailed">
      <v-responsive min-width="900">
        <div class="text-uppercase text-h6">Observation Period Report</div>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <v-card-title>Cumulative Observation</v-card-title>
          <div class="viz-container" id="viz-cumulativeobservation"></div>
        </v-card>
        <v-card
          :loading="!dataLoaded"
          v-if="dataLoaded"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-card-title>Observation Periods per Person</v-card-title>
          <v-simple-table>
            <template v-slot:default
              ><thead>
                <tr>
                  <th class="text-right">Number of Observation Periods</th>
                  <th class="text-right">Number of People</th>
                  <th class="text-right">% of People</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in personPeriods" :key="item.CONCEPT_ID">
                  <td class="text-right">{{ item.CONCEPT_NAME }}</td>
                  <td class="text-right">{{ item.COUNT_VALUE }}</td>
                  <td class="text-right">
                    {{ getPersonPeriodsPercent(item.COUNT_VALUE) }}
                  </td>
                </tr>
              </tbody></template
            ></v-simple-table
          >
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <v-card-title>Observation over Time</v-card-title>
          <div class="viz-container" id="viz-observationbymonth"></div>
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <v-card-title>Years of Observation by Age</v-card-title>
          <div class="viz-container" id="viz-observationbyage"></div>
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <v-card-title>Years of Observation by Sex</v-card-title>
          <div class="viz-container" id="viz-observationbysex"></div>
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <v-card-title>Age at First Observation</v-card-title>
          <div class="viz-container" id="viz-ageatfirstobservation"></div>
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <v-card-title>Age at First Observation by Sex</v-card-title>
          <div class="viz-container" id="viz-agebysex"></div>
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script>
import axios from "axios";
import embed from "vega-embed";
import error from "./Error.vue";
import * as d3 from "d3-time-format";
import dataService from "../services/DataService";
import ReturnButton from "@/components/ReturnButton";

export default {
  data() {
    return {
      componentFailed: false,
      errorText: "",
      errorDetails: "",
      dataLoaded: false,
      personPeriods: null,
      observationPeriodData: null,
      specAgeAtFirstObservation: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        height: 150,
        width: "container",
        mark: { type: "bar", tooltip: {}, width: 10 },
        data: null,
        encoding: {
          x: {
            field: "INTERVAL_INDEX",
            type: "quantitative",
            title: "Age",
            scale: { domainMin: 0 },
          },
          y: {
            field: "COUNT_VALUE",
            type: "quantitative",
            title: "Count People",
          },
          tooltip: [
            {
              field: "INTERVAL_INDEX",
              title: "Age",
            },
            {
              field: "COUNT_VALUE",
              title: "Number of People",
              format: ",",
            },
            { field: "PERCENT_VALUE", title: "% of People", format: "0.1%" },
          ],
        },
      },
      specAgeBySex: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        height: 75,
        width: "container",
        data: null,
        encoding: { y: { field: "CATEGORY", type: "nominal", title: null } },
        layer: [
          {
            mark: { type: "rule" },
            encoding: {
              x: {
                field: "MIN_VALUE",
                type: "quantitative",
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
              color: { field: "CATEGORY", type: "nominal", legend: null },
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
          field: "CATEGORY",
          type: "nominal",
          title: "Measurement",
        },
      },
      specCumulativeObservation: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        height: 150,
        width: "container",
        mark: { type: "area", point: true, tooltip: {} },
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
          ],
        },
      },
      specObservationByAge: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        height: {"step": "20"},
        width: "container",
        data: null,
        encoding: {
          y: {
            field: "CATEGORY", type: "nominal", title: null, sort: {"field": "categoryOrder"},
          },
        },
        layer: [
          {
            mark: { type: "rule" },
            encoding: {
              x: {
                field: "MIN_VALUE",
                type: "quantitative",
                scale: { zero: false },
                title: "Years",
                format: ".0d",
              },
              x2: { field: "MAX_VALUE" },
            },
          },
          {
            mark: { type: "bar", size: 14, tooltip: {} },
            encoding: {
              x: { field: "P25_VALUE", type: "quantitative" },
              x2: { field: "P75_VALUE" },
              color: { field: "CATEGORY", type: "nominal", legend: null },
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
          field: "CATEGORY",
          type: "nominal",
          title: "Measurement",
        },
      },
      specObservationBySex: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        height: 75,
        width: "container",
        data: null,
        encoding: {
          y: { field: "CATEGORY", type: "nominal", title: null },
        },
        layer: [
          {
            mark: { type: "rule" },
            encoding: {
              x: {
                field: "MIN_VALUE",
                type: "quantitative",
                scale: { zero: false },
                title: "Years",
              },
              x2: { field: "MAX_VALUE" },
            },
          },
          {
            mark: { type: "bar", size: 14, tooltip: {} },
            encoding: {
              x: { field: "P25_VALUE", type: "quantitative" },
              x2: { field: "P75_VALUE" },
              color: { field: "CATEGORY", type: "nominal", legend: null },
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
          field: "CATEGORY",
          type: "nominal",
          title: "Measurement",
        },
      },
      specObservationByMonth: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: null,
        vconcat: [
          {
            height: 150,
            width: "container",
            mark: {
              type: "line",
              point: true,
              strokeWidth: 1,
            },
            encoding: {
              x: {
                field: "DATE",
                type: "temporal",
                scale: { domain: { selection: "brush" } },
                axis: { title: "" },
                timeUnit: "yearmonth",
              },
              y: {
                field: "PERCENT_VALUE",
                type: "quantitative",
                title: "% of People",
                axis: { format: "%" },
              },
              tooltip: [
                {
                  field: "DATE",
                  title: "Date",
                  timeUnit: "yearmonth",
                },
                {
                  field: "COUNT_VALUE",
                  title: "# of People",
                  format: ",",
                },
                {
                  field: "PERCENT_VALUE",
                  title: "% of People",
                  format: "0.2%",
                },
              ],
            },
          },
          {
            width: "container",
            height: 50,
            mark: "line",
            selection: {
              brush: { type: "interval", encodings: ["x"] },
            },
            encoding: {
              x: { field: "DATE", type: "temporal", title: "Date" },
              y: {
                field: "COUNT_VALUE",
                type: "quantitative",
                axis: null,
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
  watch: {
    $route() {
      this.load();
    },
  },
  created() {
    this.load();
  },
  methods: {
    getPersonPeriodsPercent: function (value) {
      let denominator = 0;
      this.personPeriods.forEach((item) => (denominator += item.COUNT_VALUE));
      return (value / denominator).toFixed(3) * 100 + " %";
    },
    triggerResize: function () {
      window.dispatchEvent(new Event("resize"));
    },
    load: function () {
      let dateParse = d3.timeParse("%Y%m");
      let dataUrl =
        "data/" +
        this.$route.params.cdm +
        "/" +
        this.$route.params.release +
        "/observationperiod.json";
      axios
        .get(dataUrl)
        .then((response) => {
          this.observationPeriodData = response.data;
          this.personPeriods = response.data.PERSON_PERIODS_DATA;
          this.specAgeAtFirstObservation.data = {
            values: this.observationPeriodData.AGE_AT_FIRST_OBSERVATION,
          };
          this.specAgeBySex.data = {
            values: this.observationPeriodData.AGE_BY_GENDER,
          };
          this.specCumulativeObservation.data = {
            values: this.observationPeriodData.CUMULATIVE_DURATION,
          };
          this.specObservationByAge.data = {
            values: dataService.sortByRange(this.observationPeriodData.OBSERVATION_PERIOD_LENGTH_BY_AGE, "ascending", "CATEGORY", "categoryOrder"),
          };
          this.specObservationBySex.data = {
            values:
              this.observationPeriodData.OBSERVATION_PERIOD_LENGTH_BY_GENDER,
          };
          this.specObservationByMonth.data = {
            values: this.observationPeriodData.OBSERVED_BY_MONTH,
          };
          this.specObservationByMonth.data.values.forEach((v) => {
            v.DATE = dateParse(v.MONTH_YEAR);
          });
          embed("#viz-ageatfirstobservation", this.specAgeAtFirstObservation);
          embed("#viz-agebysex", this.specAgeBySex);
          embed("#viz-cumulativeobservation", this.specCumulativeObservation);
          embed("#viz-observationbyage", this.specObservationByAge);
          embed("#viz-observationbysex", this.specObservationBySex);
          embed("#viz-observationbymonth", this.specObservationByMonth);
          this.dataLoaded = true;
        })
        .catch((err) => {
          this.componentFailed = true;
          this.errorText = "Failed to obtain observation period data file.";
          this.errorDetails = err + " (" + dataUrl + ") ";
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
