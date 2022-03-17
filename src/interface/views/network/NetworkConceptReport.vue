<template>
  <div v-if="!getErrors">
    <v-container>
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-5 d-flex justify-space-between">
          <h2 class="text-uppercase">{{ conceptName }} NETWORK REPORT</h2>
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
        <v-card
          v-if="hasMeasurementValueDistribution"
          :loading="!dataLoaded"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-card-title
            >Measurement Value Distributions by Database and Unit</v-card-title
          >
          <v-layout class="pa-4" justify-end>
            <v-select
              v-model="selectedMeasurementUnits"
              class="mr-13"
              :items="getMeasurementUnits"
              attach
              hide-selected
              deletable-chips
              chips
              label="Filter units"
              multiple
            ></v-select>
            <v-btn color="primary" @click="toggleMeasurementValueChart()"
              ><v-icon dark left>mdi-toggle-switch</v-icon
              >{{ toggleMode }}</v-btn
            >
          </v-layout>
          <VegaChart
            v-if="dataLoaded"
            id="viz-measurementvaluedistribution"
            ref="measurementvalue"
            :config="specMeasurementValueDistribution"
            :data="getSelectedMeasurementUnits"
          />
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
import _ from "lodash";
import * as d3Format from "d3-format";
import ReturnButton from "@/interface/components/ReturnButton";
import { charts } from "@/configs";
import { FETCH_MULTIPLE_FILES_BY_SOURCE } from "@/data/store/modules/view/actions.type";
import { CONCEPT } from "@/data/services/getFilePath";
import { mapGetters } from "vuex";
import VegaChart from "@/interface/components/VegaChart";
export default {
  components: {
    VegaChart,
    ReturnButton,
  },
  data() {
    return {
      sources: [],
      toggleMode: "MIN/MAX",
      hasMeasurementValueDistribution: false,
      hasAgeAtFirstDiagnosis: false,
      hasAgeAtFirstOccurrence: false,
      selectedMeasurementUnits: [],
      hasAgeAtFirstExposure: false,
      hasConditionsByType: false,
      hasVisitDurationByType: false,
      measurementValueDistribution: [],
      hasLengthOfEra: false,
      hasCountFailed: false,
      countFailed: 0,
      conceptData: null,
      numPersons: 0,
      conceptName: "",
      conceptId: 0,
      dataLoaded: false,
      historyRecords: [],
      cdmSourceName: "",
      specMeasurementValueDistribution:
        charts.specMeasurementValueDistribution1,
    };
  },
  computed: {
    ...mapGetters(["getData", "getSources", "getErrors"]),
    getSelectedMeasurementUnits: function () {
      return this.selectedMeasurementUnits.length
        ? this.measurementValueDistribution.filter((value) =>
            this.selectedMeasurementUnits.includes(value.CATEGORY)
          )
        : this.measurementValueDistribution;
    },
    getMeasurementUnits: function () {
      return this.measurementValueDistribution.map((value) => value.CATEGORY);
    },
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
      const encoding = this.specMeasurementValueDistribution.layer[0].encoding;

      if (this.toggleMode === "MIN/MAX") {
        encoding.x.field = "P10_VALUE";
        encoding.x2.field = "P90_VALUE";
        this.toggleMode = "P10/P90";
      } else {
        encoding.x.field = "MIN_VALUE";
        encoding.x2.field = "MAX_VALUE";
        this.toggleMode = "MIN/MAX";
      }
      this.$refs.measurementvalue.load();
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
      this.dataLoaded = false;
      this.$store
        .dispatch(FETCH_MULTIPLE_FILES_BY_SOURCE, {
          files: [CONCEPT],
        })
        .then(() => {
          if (!this.getErrors) {
            this.conceptName = this.getData[CONCEPT][0].data.CONCEPT_NAME[0];
            this.conceptId = this.getData[CONCEPT][0].data.CONCEPT_ID[0];
            this.numPersons = _.sumBy(
              this.getData[CONCEPT],
              (r) => r.data.NUM_PERSONS[0]
            );

            if (
              this.getData[CONCEPT][0].data.MEASUREMENT_VALUE_DISTRIBUTION
                ?.length > 0
            ) {
              this.measurementValueDistribution = this.getData[CONCEPT].reduce(
                (prevValue, current) => [
                  ...prevValue,
                  ...current.data.MEASUREMENT_VALUE_DISTRIBUTION.map(
                    (value) => ({
                      ...value,
                      SOURCE_UNIT_KEY: `${current.source.cdm_source_key} - ${value.CATEGORY}`,
                    })
                  ),
                ],
                []
              );
              this.hasMeasurementValueDistribution = true;
            }
            this.dataLoaded = true;
          }
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
