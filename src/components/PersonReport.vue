<template>
  <div>
    <div v-if="componentFailed">
      <error :text="errorText" :details="errorDetails"></error>
      <ReturnButton block />
    </div>
    <v-container v-if="!componentFailed">
      <v-responsive min-width="900">
        <div class="text-uppercase text-h6">Person Report</div>
        <br />
        <v-row>
          <!-- Total persons in top bar -->
          <v-col cols="2" align="center">
            <v-icon left color="info">mdi-account-group</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="formatComma(numPersons)"
            ></v-badge>
            <p class="text-caption">Number of People</p>
          </v-col>
          <!-- Gender breakdown in top bar -->
          <v-col cols="4" align="center">
            <v-icon left color="info">mdi-human-male-female</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="
                'Male: ' +
                formatComma(genderMaleCount) +
                ' (' +
                formatPercent(genderMalePct) +
                ')'
              "
            ></v-badge>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="
                'Female: ' +
                formatComma(genderFemaleCount) +
                ' (' +
                formatPercent(genderFemalePct) +
                ')'
              "
            ></v-badge>
            <p class="text-caption">Gender Proportions</p>
          </v-col>
        </v-row>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <v-card-title>Population by Age &amp; Sex</v-card-title>
          <div id="viz-populationbyageandsex" class="viz-container"></div>
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <v-card-title>Population by Race</v-card-title>
          <div id="viz-race" class="viz-container"></div>
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <v-card-title>Population by Year of Birth</v-card-title>
          <div id="viz-birthyear" class="viz-container"></div>
        </v-card>
        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <v-card-title>Population by Ethnicity</v-card-title>
          <div id="viz-ethnicity" class="viz-container"></div>
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
import * as d3Format from "d3-format";
import ReturnButton from "@/components/ReturnButton";

export default {
  components: {
    ReturnButton,
    error,
  },
  data() {
    return {
      componentFailed: false,
      errorText: "",
      errorDetails: "",
      hasMeasurementValueDistribution: false,
      hasAgeAtFirstDiagnosis: false,
      hasAgeAtFirstOccurrence: false,
      conceptData: null,
      conceptName: "",
      conceptId: 0,
      dataLoaded: false,
      historyRecords: [],
      cdmSourceName: "",
      numPersons: "",
      genderMaleCount: "",
      genderMalePct: "",
      genderFemalePct: "",
      genderFemaleCount: "",
      specBirthYear: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: null,
        width: "container",
        height: 100,
        mark: "bar",
        encoding: {
          tooltip: [
            { field: "COUNT_PERSON", title: "# of People", format: "," },
          ],
          x: {
            field: "YEAR",
            type: "temporal",
            title: "Year of Birth",
          },
          y: {
            field: "COUNT_PERSON",
            aggregate: "sum",
            title: "Number of People",
          },
        },
      },
      specRace: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: null,
        width: "container",
        height: 75,
        mark: "bar",
        transform: [
          {
            window: [
              {
                op: "sum",
                field: "COUNT_VALUE",
                as: "TOTAL_VALUE",
              },
            ],
            frame: [null, null],
          },
          {
            calculate: "datum.COUNT_VALUE/datum.TOTAL_VALUE",
            as: "PERCENT",
          },
        ],
        encoding: {
          tooltip: [
            { field: "CONCEPT_NAME", title: "Race" },
            { field: "PERCENT", title: "Percent", format: "0.2%" },
            { field: "COUNT_VALUE", title: "Number of People" },
          ],
          x: {
            field: "PERCENT",
            type: "quantitative",
            aggregate: "sum",
            title: "% of People",
            axis: {
              format: "0%",
            },
          },
          color: {
            field: "CONCEPT_NAME",
            type: "nominal",
            legend: {
              orient: "right",
              title: null,
            },
          },
          order: {
            aggregate: "sum",
            field: "COUNT_VALUE",
            sort: "descending",
          },
        },
      },
      specEthnicity: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: null,
        width: "container",
        height: 100,
        mark: "bar",
        encoding: {
          x: {
            field: "COUNT_VALUE",
            aggregate: "sum",
            title: "Number of People",
          },
          color: {
            field: "CONCEPT_NAME",
            legend: {
              orient: "right",
              columns: 2,
              title: "Ethnicity",
            },
          },
        },
      },
      specAgeSex: {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        data: null,
        width: "container",
        height: 75,
        mark: "bar",
        transform: [{ filter: "datum.AGE >= 0" }],
        encoding: {
          tooltip: [
            { field: "CONCEPT_NAME", title: "Sex" },
            { field: "AGE", title: "Age" },
            { field: "COUNT_VALUE", title: "# of People", format: "," },
          ],
          color: {
            field: "CONCEPT_NAME",
            legend: null,
          },
          row: {
            field: "CONCEPT_NAME",
            title: null,
            header: {
              title: "Number of People",
              labelOrient: "top",
              labelAnchor: "start",
              labelFontSize: 12,
              labelPadding: 2,
              labelFontWeight: "bold",
            },
          },
          x: {
            field: "AGE",
            title: "Age at First Observation",
            type: "quantitative",
            scale: { domain: [0, 100] },
          },
          y: {
            aggregate: "sum",
            field: "COUNT_VALUE",
            title: null,
          },
        },
      },
    };
  },
  computed: {},
  watch: {
    $route() {
      this.load();
    },
  },
  created() {
    this.load();
  },
  methods: {
    triggerResize: function () {
      window.dispatchEvent(new Event("resize"));
    },
    // Formats values passed as percentages
    formatPercent: function (value) {
      return d3Format.format("0.0%")(value);
    },
    // Formats values passed with commas added
    formatComma: function (value) {
      return d3Format.format(",")(value);
    },

    load: function () {
      this.dataLoaded = false;
      const dataUrl =
        "data/" +
        this.$route.params.cdm +
        "/" +
        this.$route.params.release +
        "/person.json";
      axios
        .get(dataUrl)
        .then((response) => {
          this.componentFailed = false;
          const dateParse = d3.timeParse("%Y");
          this.personData = response.data;

          //Pulls number of persons from person.json
          this.numPersons = response.data.SUMMARY[1].ATTRIBUTE_VALUE;

          //Pulls gender from person.json
          if (response.data.GENDER_DATA[0].CONCEPT_NAME == "MALE") {
            this.genderMaleCount = response.data.GENDER_DATA[0].COUNT_VALUE;
            this.genderFemaleCount = response.data.GENDER_DATA[1].COUNT_VALUE;
          } else {
            this.genderMaleCount = response.data.GENDER_DATA[1].COUNT_VALUE;
            this.genderFemaleCount = response.data.GENDER_DATA[0].COUNT_VALUE;
          }

          // Gender breakdown (percentage)
          this.genderMalePct = this.genderMaleCount / this.numPersons;
          this.genderFemalePct = this.genderFemaleCount / this.numPersons;

          this.personData.BIRTH_YEAR_DATA.forEach((v, i) => {
            this.personData.BIRTH_YEAR_DATA[i].YEAR = dateParse(v.YEAR);
          });
          this.specBirthYear.data = {
            values: this.personData.BIRTH_YEAR_DATA,
          };
          embed("#viz-birthyear", this.specBirthYear).then(() => {
            window.dispatchEvent(new Event("resize"));
          });

          this.specAgeSex.data = {
            values: this.personData.AGE_GENDER_DATA,
          };
          embed("#viz-populationbyageandsex", this.specAgeSex);

          this.specRace.data = {
            values: this.personData.RACE_DATA,
          };
          embed("#viz-race", this.specRace).then(() => {
            window.dispatchEvent(new Event("resize"));
          });

          this.specEthnicity.data = {
            values: this.personData.ETHNICITY_DATA,
          };
          embed("#viz-ethnicity", this.specEthnicity).then(() => {
            window.dispatchEvent(new Event("resize"));
          });

          this.dataLoaded = true;
        })
        .catch((err) => {
          this.componentFailed = true;
          this.errorText = "Failed to obtain person summary data file.";
          this.errorDetails = err + " (" + dataUrl + ") ";
        });
    },
  },
};
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
