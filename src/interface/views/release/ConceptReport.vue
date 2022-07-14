<template>
  <div>
    <v-container v-if="!getErrors" fluid>
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-6 d-flex justify-md-space-between">
          <h2 class="text-uppercase">
            {{ getData.conceptName }}
          </h2>
          <ReturnButton />
        </v-layout>
        <v-row v-if="dataInStore" justify="start"
          ><v-col cols="2" align="center">
            <v-icon left color="info">mdi-identifier</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="getData.conceptId"
            ></v-badge>
            <p class="text-caption">Concept Identifier</p></v-col
          ><v-col cols="2" align="center">
            <v-icon left color="info">mdi-account-group</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="getData.numPersons"
            ></v-badge>
            <p class="text-caption">Number of People</p></v-col
          ><v-col cols="2" align="center">
            <v-icon small left color="info">mdi-percent</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="formatPercent(getData.percentPersons)"
            ></v-badge>
            <p class="text-caption">% of People</p></v-col
          ><v-col cols="2" align="center">
            <v-icon left color="info">mdi-table-row</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="getData.recordsPerPerson"
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
          <v-col
            v-if="getData.conceptData.COUNT_FAILED"
            cols="2"
            align="center"
          >
            <v-icon left color="error" @click="navigateToDataQuality()"
              >mdi-database-alert</v-icon
            >
            <v-badge
              tile
              inline
              dark
              color="error"
              :content="getData.countFailed"
            ></v-badge>
            <p class="text-caption">Data Quality Issues</p></v-col
          ><v-col v-if="getData.isNotStationary" cols="2" align="center">
            <v-icon left color="error">mdi-clock-alert</v-icon>
            <p class="text-caption">Non-Stationary Time Series</p></v-col
          ></v-row
        >
        <v-card
          v-if="getData.conceptData.MEASUREMENT_VALUE_DISTRIBUTION"
          :loading="!dataInStore"
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
            v-if="dataInStore"
            id="viz-measurementvaluedistribution"
            ref="measurementvalue"
            :config="specMeasurementValueDistribution"
            :data="getSelectedMeasurementUnits"
          />
          <info-panel
            details="Check measurement value distributions across the network"
            icon="mdi-check-network"
            :link-details="true"
            :route-link="getNetworkConceptRoute()"
            :divider="true"
          ></info-panel>
          <info-panel
            details="Learn how
              to interpret this plot."
            icon="mdi-help-circle"
            :link-details="true"
            route-link="/help"
            :divider="false"
          ></info-panel>
          <info-panel
            v-if="getQueryIndex"
            details="View export query."
            icon="mdi-code-braces"
            :link-details="true"
            :link="
              getQueryLink(
                getQueryIndex[$route.params.domain.toUpperCase()]
                  .MEASUREMENT_VALUE_DISTRIBUTION[0]
              )
            "
            :divider="false"
          ></info-panel>
        </v-card>
        <v-card
          v-if="getData.conceptData.AGE_AT_FIRST_DIAGNOSIS"
          :loading="!dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataInStore"
            id="viz-ageatfirstdiagnosis"
            :config="specAgeAtFirstDiagnosis"
            :data="getData.conceptData.AGE_AT_FIRST_DIAGNOSIS"
            title="Age at First Diagnosis"
          />
          <info-panel
            details="Learn how
              to interpret this plot."
            icon="mdi-help-circle"
            :link-details="true"
            route-link="/help"
            :divider="false"
          ></info-panel>
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getQueryLink(
                getQueryIndex[$route.params.domain.toUpperCase()]
                  .AGE_AT_FIRST_DIAGNOSIS[0]
              )
            "
            :divider="false"
          ></info-panel>
        </v-card>
        <v-card
          v-if="getData.conceptData.AGE_AT_FIRST_EXPOSURE"
          :loading="!dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataInStore"
            id="viz-ageatfirstexposure"
            :config="specAgeAtFirstExposure"
            :data="getData.conceptData.AGE_AT_FIRST_EXPOSURE"
            title="Age At First Exposure"
          />
          <info-panel
            details="Learn how
              to interpret this plot."
            icon="mdi-help-circle"
            :link-details="true"
            route-link="/help"
            :divider="true"
          ></info-panel>
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getQueryLink(
                getQueryIndex[$route.params.domain.toUpperCase()]
                  .AGE_AT_FIRST_EXPOSURE[0]
              )
            "
            :divider="false"
          ></info-panel>
        </v-card>
        <v-card
          v-if="getData.conceptData.LENGTH_OF_ERA"
          :loading="!dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataInStore"
            id="viz-lengthofera"
            :config="specLengthOfEra"
            :data="getData.conceptData.LENGTH_OF_ERA"
            title="Length of Era"
          />
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getQueryLink(
                getQueryIndex[$route.params.domain.toUpperCase()]
                  .LENGTH_OF_ERA[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card
          v-if="getData.conceptData.CONDITIONS_BY_TYPE"
          :loading="!dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataInStore"
            id="viz-conditionsbytype"
            :config="specConditionsByType"
            :data="getData.conceptData.CONDITIONS_BY_TYPE"
            title="Conditions by Type"
          />
          <info-panel
            details="Learn about Condition types."
            icon="mdi-help-circle"
            :link-details="true"
            link="https://ohdsi.github.io/CommonDataModel/cdm531.html#CONDITION_OCCURRENCE"
            :divider="true"
          ></info-panel>
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getQueryLink(
                getQueryIndex[$route.params.domain.toUpperCase()]
                  .CONDITIONS_BY_TYPE[0]
              )
            "
            :divider="false"
          ></info-panel>
        </v-card>
        <v-card
          v-if="getData.conceptData.DRUGS_BY_TYPE"
          :loading="!dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataInStore"
            id="viz-drugsbytype"
            :config="specDrugsByType"
            :data="getData.conceptData.DRUGS_BY_TYPE"
            title="Drugs by Type"
          />
          <info-panel
            details="Learn about Drug types."
            icon="mdi-help-circle"
            :link-details="true"
            link="https://ohdsi.github.io/CommonDataModel/cdm531.html#DRUG_EXPOSURE"
            :divider="true"
          ></info-panel>
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getQueryLink(
                getQueryIndex[$route.params.domain.toUpperCase()]
                  .DRUGS_BY_TYPE[0]
              )
            "
            :divider="false"
          ></info-panel>
        </v-card>
        <v-card
          v-if="getData.conceptData.RECORDS_BY_UNIT"
          :loading="!dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataInStore"
            id="viz-recordsbyunit"
            :config="specRecordsByUnit"
            :data="getData.conceptData.RECORDS_BY_UNIT"
            title="Records by Unit"
          />
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getQueryLink(
                getQueryIndex[$route.params.domain.toUpperCase()]
                  .RECORDS_BY_UNIT[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card
          v-if="getData.conceptData.MEASUREMENTS_BY_TYPE"
          :loading="!dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataInStore"
            id="viz-measurementsbytype"
            :config="specMeasurementsByType"
            :data="getData.conceptData.MEASUREMENTS_BY_TYPE"
            title="Measurements by Type"
          />
          <info-panel
            details="Learn about Measurement types."
            icon="mdi-help-circle"
            :link-details="true"
            link="https://ohdsi.github.io/CommonDataModel/cdm531.html#MEASUREMENT"
            :divider="true"
          ></info-panel>
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getQueryLink(
                getQueryIndex[$route.params.domain.toUpperCase()]
                  .MEASUREMENTS_BY_TYPE[0]
              )
            "
            :divider="false"
          ></info-panel>
        </v-card>
        <v-card
          v-if="getData.conceptData.AGE_AT_FIRST_OCCURRENCE"
          :loading="!dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataInStore"
            id="viz-ageatfirstoccurrence"
            :config="specAgeAtFirstOccurrence"
            :data="getData.conceptData.AGE_AT_FIRST_OCCURRENCE"
            title="Age at First Occurrence"
          />
          <info-panel
            details="Learn how to interpret this plot"
            route-link="/help"
          ></info-panel>
          <info-panel
            details="View export query."
            icon="mdi-code-braces"
            :link-details="true"
            :link="
              getQueryLink(
                getQueryIndex[$route.params.domain.toUpperCase()]
                  .AGE_AT_FIRST_OCCURRENCE[0]
              )
            "
            :divider="false"
          ></info-panel>
        </v-card>
        <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="dataInStore"
            id="viz-recordproportionbymonth"
            :config="specRecordProportionByMonth"
            :data="getData.conceptData.PREVALENCE_BY_MONTH"
            title="Record Count Proportion by Month"
          />
          <info-panel
            details="Proportion of people with at least one record per 1000 people."
          ></info-panel>
          <info-panel
            v-if="getData.isNotStationary"
            icon="mdi-clock-alert"
            details="This time series has been deemed non-stationary by temporal characterization."
            :divider="false"
          ></info-panel>
          <info-panel
            v-if="getData.seasonalityScore"
            icon="mdi-clock-alert"
            :details="getData.seasonalityComment"
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
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getQueryLink(
                getQueryIndex[$route.params.domain.toUpperCase()]
                  .PREVALENCE_BY_MONTH[0]
              )
            "
            :divider="false"
          ></info-panel>
        </v-card>
        <v-card
          v-if="getData.conceptData.DAYS_SUPPLY_DISTRIBUTION"
          :loading="!dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataInStore"
            id="viz-dayssupply"
            :config="specDaysSupply"
            :data="getData.conceptData.DAYS_SUPPLY_DISTRIBUTION"
            title="Days Supply"
          />
          <info-panel
            details="Learn how to interpret this plot"
            route-link="/help"
          ></info-panel>
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getQueryLink(
                getQueryIndex[$route.params.domain.toUpperCase()]
                  .DAYS_SUPPLY_DISTRIBUTION[0]
              )
            "
            :divider="false"
          ></info-panel>
        </v-card>
        <v-card
          v-if="getData.conceptData.QUANTITY_DISTRIBUTION"
          :loading="!dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataInStore"
            id="viz-quantity"
            :config="specQuantity"
            :data="getData.conceptData.QUANTITY_DISTRIBUTION"
            title="Quantity"
          />
          <info-panel
            details="Learn how to interpret this plot"
            route-link="/help"
          ></info-panel>
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getQueryLink(
                getQueryIndex[$route.params.domain.toUpperCase()]
                  .QUANTITY_DISTRIBUTION[0]
              )
            "
            :divider="false"
          ></info-panel>
        </v-card>
        <v-card
          v-if="getData.conceptData.VISIT_DURATION_BY_TYPE"
          :loading="!dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <VegaChart
            v-if="dataInStore"
            id="viz-visitdurationbytype"
            :config="specVisitDurationByType"
            :data="getData.conceptData.VISIT_DURATION_BY_TYPE"
            title="Visit Duration By Type"
          />
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getQueryLink(
                getQueryIndex[$route.params.domain.toUpperCase()]
                  .VISIT_DURATION_BY_TYPE[0]
              )
            "
            :divider="false"
          ></info-panel>
        </v-card>
        <v-card :loading="!dataInStore" elevation="10" class="ma-4 pa-2">
          <VegaChart
            v-if="getData"
            id="viz-recordproportionbyagesexyear"
            :config="specRecordProportionByAgeSexYear"
            :data="getData.conceptData.PREVALENCE_BY_GENDER_AGE_YEAR"
            title="Record Count Proportion by Age, Sex, and Year"
          />
          <info-panel
            details="Proportion of people with at least one record per 1000 people."
          ></info-panel>
          <info-panel
            v-if="getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              getQueryLink(
                getQueryIndex[$route.params.domain.toUpperCase()]
                  .PREVALENCE_BY_GENDER_AGE_YEAR[0]
              )
            "
            :divider="false"
          ></info-panel>
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script>
import * as d3Format from "d3-format";
import InfoPanel from "../../components/InfoPanel.vue";
import ReturnButton from "@/interface/components/ReturnButton";
import { charts } from "@/configs";
import { mapGetters } from "vuex";
import VegaChart from "@/interface/components/VegaChart";
export default {
  components: {
    VegaChart,
    ReturnButton,
    InfoPanel,
  },
  data() {
    return {
      toggleMode: "P10/P90",
      selectedMeasurementUnits: [],
      hasCountFailed: false,
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
    ...mapGetters(["getData", "getErrors", "dataInStore", "getQueryIndex"]),
    getPercentWithValues: function () {
      const missingData = this.getData.domainSummary.filter(
        (data) => data.CONCEPT_ID === this.$route.params.concept
      )[0].PERCENT_MISSING_VALUES;
      return missingData
        ? `${(1 - missingData) * (100).toFixed(2)}%`
        : "No data";
    },

    getMeasurementUnits: function () {
      return this.getData.conceptData.MEASUREMENT_VALUE_DISTRIBUTION.map(
        (value) => value.CATEGORY
      );
    },
    getSelectedMeasurementUnits: function () {
      return this.selectedMeasurementUnits.length
        ? this.getData.conceptData.MEASUREMENT_VALUE_DISTRIBUTION.filter(
            (value) => this.selectedMeasurementUnits.includes(value.CATEGORY)
          )
        : this.getData.conceptData.MEASUREMENT_VALUE_DISTRIBUTION;
    },
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
    getQueryLink(queryPath) {
      return `https://github.com/OHDSI/Achilles/tree/main/inst/sql/sql_server/${queryPath}`;
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
          "/data_quality?tab=results&search=" +
          this.$route.params.concept,
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
