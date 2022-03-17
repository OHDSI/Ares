<template>
  <div>
    <v-container v-if="!getErrors">
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-6 d-flex justify-md-space-between">
          <h2 class="text-uppercase">
            {{ conceptName }}
          </h2>
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
            <p class="text-caption">Number of People</p></v-col
          ><v-col cols="2" align="center">
            <v-icon small left color="info">mdi-percent</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="formatPercent(percentPersons)"
            ></v-badge>
            <p class="text-caption">% of People</p></v-col
          ><v-col cols="2" align="center">
            <v-icon left color="info">mdi-table-row</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="recordsPerPerson"
            ></v-badge>
            <p class="text-caption">Records per Person</p></v-col
          >
          <v-col
            v-if="$route.params.domain === 'measurement'"
            cols="2"
            align="center"
          >
            <v-icon left color="info">mdi-database-check-outline</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="getPercentWithValues"
            ></v-badge>
            <p class="text-caption">% with Values</p></v-col
          >
          <v-col v-if="hasCountFailed" cols="2" align="center">
            <v-icon left color="error" @click="navigateToDataQuality()"
              >mdi-database-alert</v-icon
            >
            <v-badge
              tile
              inline
              dark
              color="error"
              :content="countFailed"
            ></v-badge>
            <p class="text-caption">Data Quality Issues</p></v-col
          ><v-col v-if="isNotStationary" cols="2" align="center">
            <v-icon left color="error">mdi-clock-alert</v-icon>
            <p class="text-caption">Non-Stationary Time Series</p></v-col
          ></v-row
        >
        <v-card
          v-if="hasMeasurementValueDistribution"
          :loading="!dataLoaded"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-card-title>Measurement Value Distributions</v-card-title>
          <v-layout class="pa-4">
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
            <v-btn small color="primary" @click="toggleMeasurementValueChart()"
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
            <v-layout>
              <router-link :to="getNetworkConceptRoute()">
                <v-icon small color="primary" left>mdi-check-network</v-icon
                >Check measurement value distributions across the network
              </router-link>
            </v-layout>
            <router-link to="/help">
              <v-icon small color="info" left> mdi-help-circle</v-icon>Learn how
              to interpret this plot.
            </router-link>
          </v-card-text>
        </v-card>
        <v-card
          v-if="hasAgeAtFirstDiagnosis"
          :loading="!dataLoaded"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataLoaded"
            id="viz-ageatfirstdiagnosis"
            :config="specAgeAtFirstDiagnosis"
            :data="conceptData.AGE_AT_FIRST_DIAGNOSIS"
            title="Age at First Diagnosis"
          />
          <v-card-text>
            <router-link to="/help">
              <v-icon small color="info" left> mdi-help-circle</v-icon>Learn how
              to interpret this plot.
            </router-link>
          </v-card-text>
        </v-card>
        <v-card
          v-if="hasAgeAtFirstExposure"
          :loading="!dataLoaded"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataLoaded"
            id="viz-ageatfirstexposure"
            :config="specAgeAtFirstExposure"
            :data="conceptData.AGE_AT_FIRST_EXPOSURE"
            title="Age At First Exposure"
          />
          <v-card-text>
            <router-link to="/help">
              <v-icon small color="info" left> mdi-help-circle</v-icon>Learn how
              to interpret this plot.
            </router-link>
          </v-card-text>
        </v-card>

        <v-card
          v-if="hasLengthOfEra"
          :loading="!dataLoaded"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataLoaded"
            id="viz-lengthofera"
            :config="specLengthOfEra"
            :data="conceptData.LENGTH_OF_ERA"
            title="Length of Era"
          />
        </v-card>

        <v-card
          v-if="hasConditionsByType"
          :loading="!dataLoaded"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataLoaded"
            id="viz-conditionsbytype"
            :config="specConditionsByType"
            :data="conceptData.CONDITIONS_BY_TYPE"
            title="Conditions by Type"
          />
          <v-card-text>
            <a
              href="https://ohdsi.github.io/CommonDataModel/cdm531.html#CONDITION_OCCURRENCE"
              target="_blank"
            >
              <v-icon small color="info" left> mdi-help-circle</v-icon>
              Learn about Condition types.
            </a>
          </v-card-text>
        </v-card>

        <v-card
          v-if="hasDrugsByType"
          :loading="!dataLoaded"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataLoaded"
            id="viz-drugsbytype"
            :config="specDrugsByType"
            :data="conceptData.DRUGS_BY_TYPE"
            title="Drugs by Type"
          />
          <v-card-text>
            <a
              href="https://ohdsi.github.io/CommonDataModel/cdm531.html#DRUG_EXPOSURE"
              target="_blank"
            >
              <v-icon small color="info" left> mdi-help-circle</v-icon>
              Learn about Drug types.
            </a>
          </v-card-text>
        </v-card>

        <v-card
          v-if="hasRecordsByUnit"
          :loading="!dataLoaded"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataLoaded"
            id="viz-recordsbyunit"
            :config="specRecordsByUnit"
            :data="conceptData.RECORDS_BY_UNIT"
            title="Records by Unit"
          />
        </v-card>

        <v-card
          v-if="hasMeasurementsByType"
          :loading="!dataLoaded"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataLoaded"
            id="viz-measurementsbytype"
            :config="specMeasurementsByType"
            :data="conceptData.MEASUREMENTS_BY_TYPE"
            title="Measurements by Type"
          />
          <v-card-text>
            <a
              href="https://ohdsi.github.io/CommonDataModel/cdm531.html#MEASUREMENT"
              target="_blank"
            >
              <v-icon small color="info" left> mdi-help-circle</v-icon>
              Learn about Measurement types.
            </a>
          </v-card-text>
        </v-card>

        <v-card
          v-if="hasAgeAtFirstOccurrence"
          :loading="!dataLoaded"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataLoaded"
            id="viz-ageatfirstoccurrence"
            :config="specAgeAtFirstOccurrence"
            :data="conceptData.AGE_AT_FIRST_OCCURRENCE"
            title="Age at First Occurrence"
          />
          <info-panel
            details="Learn how to interpret this plot"
            route-link="/help"
          ></info-panel>
        </v-card>

        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataLoaded"
            id="viz-recordproportionbymonth"
            :config="specRecordProportionByMonth"
            :data="conceptData.PREVALENCE_BY_MONTH"
            title="Record Count Proportion by Month"
          />
          <info-panel
            details="Proportion of people with at least one record per 1000 people."
          ></info-panel>
          <info-panel
            v-if="isNotStationary"
            icon="mdi-clock-alert"
            details="This time series has been deemed non-stationary by temporal characterization."
            :divider="false"
          ></info-panel>
          <info-panel
            v-if="hasSeasonalityScore"
            icon="mdi-clock-alert"
            :details="seasonalityComment"
            :divider="false"
            link="http://www.github.com/ohdsi/castor"
          ></info-panel>
          <info-panel
            icon="mdi-database-clock"
            :divider="false"
            :link-details="true"
            :route-link="getSourceConceptReportLink()"
            details="Review this Time-Series across data source releases."
          ></info-panel>
        </v-card>

        <v-card
          v-if="hasDaysSupply"
          :loading="!dataLoaded"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataLoaded"
            id="viz-dayssupply"
            :config="specDaysSupply"
            :data="conceptData.DAYS_SUPPLY_DISTRIBUTION"
            title="Days Supply"
          />
          <info-panel
            details="Learn how to interpret this plot"
            route-link="/help"
          ></info-panel>
        </v-card>

        <v-card
          v-if="hasQuantity"
          :loading="!dataLoaded"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataLoaded"
            id="viz-quantity"
            :config="specQuantity"
            :data="conceptData.QUANTITY_DISTRIBUTION"
            title="Quantity"
          />
          <info-panel
            details="Learn how to interpret this plot"
            route-link="/help"
          ></info-panel>
        </v-card>

        <v-card
          v-if="hasVisitDurationByType"
          :loading="!dataLoaded"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataLoaded"
            id="viz-visitdurationbytype"
            :config="specVisitDurationByType"
            :data="conceptData.VISIT_DURATION_BY_TYPE"
            title="Visit Duration By Type"
          />
        </v-card>

        <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataLoaded"
            id="viz-recordproportionbyagesexyear"
            :config="specRecordProportionByAgeSexYear"
            :data="conceptData.PREVALENCE_BY_GENDER_AGE_YEAR"
            title="Record Count Proportion by Age, Sex, and Year"
          />
          <info-panel
            details="Proportion of people with at least one record per 1000 people."
          ></info-panel>
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script>
import * as d3 from "d3-time-format";
import { csvParse } from "d3-dsv";
import * as d3Format from "d3-format";
import InfoPanel from "../../components/InfoPanel.vue";
import ReturnButton from "@/interface/components/ReturnButton";
import { charts } from "@/configs";
import { FETCH_FILES } from "@/data/store/modules/view/actions.type";
import { CONCEPT, DOMAIN_SUMMARY } from "@/data/services/getFilePath";
import { mapGetters } from "vuex";
import VegaChart from "@/interface/components/VegaChart";
import sortByRange from "@/services/range-sort";
export default {
  components: {
    VegaChart,
    ReturnButton,
    InfoPanel,
  },
  data() {
    return {
      toggleMode: "P10/P90",
      hasMeasurementValueDistribution: false,
      selectedMeasurementUnits: [],
      hasAgeAtFirstDiagnosis: false,
      hasAgeAtFirstOccurrence: false,
      hasAgeAtFirstExposure: false,
      hasRecordsByUnit: false,
      hasConditionsByType: false,
      hasMeasurementsByType: false,
      hasDrugsByType: false,
      hasVisitDurationByType: false,
      hasDaysSupply: false,
      hasQuantity: false,
      hasLengthOfEra: false,
      hasCountFailed: false,
      isNotStationary: false,
      hasSeasonalityScore: false,
      seasonalityScore: 0,
      seasonalityComment: "",
      countFailed: 0,
      conceptData: {},
      conceptName: "",
      conceptId: 0,
      dataLoaded: false,
      historyRecords: [],
      cdmSourceName: "",
      specConditionsByType: charts.specConditionsByType,
      specDrugsByType: charts.specDrugsByType,
      specRecordsByUnit: charts.specRecordsByUnit,
      specRecordProportionByAgeSexYear: charts.specRecordProportionByAgeSexYear,
      specMeasurementValueDistribution: charts.specMeasurementValueDistribution,
      specMeasurementsByType: charts.specMeasurementsByType,
      specAgeAtFirstOccurrence: charts.specAgeAtFirstOccurrence,
      specVisitDurationByType: charts.specVisitDurationByType,
      specDaysSupply: charts.specDaysSupply,
      specQuantity: charts.specQuantity,
      specLengthOfEra: charts.specLengthOfEra,
      specAgeAtFirstExposure: charts.specAgeAtFirstExposure,
      specAgeAtFirstDiagnosis: charts.specAgeAtFirstDiagnosis,
      specRecordProportionByMonth: charts.specRecordProportionByMonth,
    };
  },
  computed: {
    ...mapGetters(["getData", "getErrors"]),
    getPercentWithValues: function () {
      const missingData = csvParse(this.getData[DOMAIN_SUMMARY]).filter(
        (data) => data.CONCEPT_ID === this.$route.params.concept
      )[0].PERCENT_MISSING_VALUES;
      return missingData
        ? `${(1 - missingData) * (100).toFixed(2)}%`
        : "No data";
    },

    getMeasurementUnits: function () {
      return this.getData[CONCEPT].MEASUREMENT_VALUE_DISTRIBUTION.map(
        (value) => value.CATEGORY
      );
    },
    getSelectedMeasurementUnits: function () {
      return this.selectedMeasurementUnits.length
        ? this.getData[CONCEPT].MEASUREMENT_VALUE_DISTRIBUTION.filter((value) =>
            this.selectedMeasurementUnits.includes(value.CATEGORY)
          )
        : this.getData[CONCEPT].MEASUREMENT_VALUE_DISTRIBUTION;
    },
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
    getSourceConceptReportLink: function () {
      return (
        "/datasource/" +
        this.$route.params.cdm +
        "/" +
        this.$route.params.domain +
        "/" +
        this.$route.params.concept +
        "/overlay"
      );
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

    formatPercent: function (value) {
      return d3Format.format("0.0%")(value);
    },
    formatComma: function (value) {
      return d3Format.format(",")(value);
    },
    triggerResize: function () {
      window.dispatchEvent(new Event("resize"));
    },
    getNetworkConceptRoute() {
      return (
        "/network/concept/" +
        this.$route.params.domain +
        "/" +
        this.$route.params.concept +
        "/summary"
      );
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
      const files = [{ name: CONCEPT, required: true }];
      if (this.$route.params.domain === "measurement") {
        files.push({ name: DOMAIN_SUMMARY, required: true });
      }

      this.$store
        .dispatch(FETCH_FILES, {
          files,
        })
        .then(() => {
          if (!this.getErrors) {
            const dateParse = d3.timeParse("%Y%m");
            this.conceptData = this.getData[CONCEPT];
            this.conceptName = this.conceptData.CONCEPT_NAME[0];
            this.conceptId = this.conceptData.CONCEPT_ID[0];
            this.numPersons = this.formatComma(this.conceptData.NUM_PERSONS[0]);
            this.percentPersons = this.conceptData.PERCENT_PERSONS[0];
            this.recordsPerPerson = this.conceptData.RECORDS_PER_PERSON[0];

            if (this.conceptData.COUNT_FAILED) {
              this.hasCountFailed = true;
              this.countFailed = this.conceptData.COUNT_FAILED[0];
            }

            if (this.conceptData.IS_STATIONARY) {
              this.isNotStationary = !this.conceptData.IS_STATIONARY[0];
            }

            if (this.conceptData.SEASONALITY_SCORE) {
              this.hasSeasonalityScore = true;
              this.seasonalityScore = this.conceptData.SEASONALITY_SCORE[0];
              this.seasonalityComment =
                "Seasonality score of " + this.seasonalityScore + ".";
            }

            if (this.conceptData.LENGTH_OF_ERA) {
              this.hasLengthOfEra = true;
            }

            if (this.conceptData.DAYS_SUPPLY_DISTRIBUTION) {
              this.hasDaysSupply = true;
            }

            if (this.conceptData.QUANTITY_DISTRIBUTION) {
              this.hasQuantity = true;
            }

            if (this.conceptData.AGE_AT_FIRST_OCCURRENCE) {
              this.hasAgeAtFirstOccurrence = true;
            }

            if (this.conceptData.VISIT_DURATION_BY_TYPE) {
              this.hasVisitDurationByType = true;
            }

            if (this.conceptData.CONDITIONS_BY_TYPE) {
              this.hasConditionsByType = true;
            }

            if (this.conceptData.DRUGS_BY_TYPE) {
              this.hasDrugsByType = true;
            }

            if (this.conceptData.RECORDS_BY_UNIT) {
              this.hasRecordsByUnit = true;
            }

            if (this.conceptData.MEASUREMENTS_BY_TYPE) {
              this.hasMeasurementsByType = true;
            }

            if (this.conceptData.AGE_AT_FIRST_EXPOSURE) {
              this.hasAgeAtFirstExposure = true;
            }

            if (this.conceptData.AGE_AT_FIRST_DIAGNOSIS) {
              this.hasAgeAtFirstDiagnosis = true;
            }

            this.conceptData.PREVALENCE_BY_GENDER_AGE_YEAR = sortByRange(
              this.conceptData.PREVALENCE_BY_GENDER_AGE_YEAR,
              "ascending",
              "TRELLIS_NAME",
              "trellisOrder"
            );

            this.specRecordProportionByMonth.data = {
              values: this.conceptData.PREVALENCE_BY_MONTH,
            };

            if (
              this.conceptData.MEASUREMENT_VALUE_DISTRIBUTION &&
              this.conceptData.MEASUREMENT_VALUE_DISTRIBUTION.length > 0
            ) {
              this.hasMeasurementValueDistribution = true;
            }

            this.conceptData.PREVALENCE_BY_MONTH.forEach((v, i) => {
              this.conceptData.PREVALENCE_BY_MONTH[i].date = dateParse(
                v.X_CALENDAR_MONTH
              );
            });

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
