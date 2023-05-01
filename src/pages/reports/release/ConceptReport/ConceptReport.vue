<template>
  <div>
    <v-container v-if="!store.getErrors && store.getters.dataInStore" fluid>
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-6 d-flex justify-md-space-between">
          <h2 class="text-uppercase">
            {{ store.getters.getData.conceptName }}
          </h2>
          <ReturnButton />
        </v-layout>
        <v-row v-if="store.getters.dataInStore" justify="start"
          ><v-col cols="2" align="center">
            <v-icon left color="primary">mdi-identifier</v-icon>
            <v-badge
              tile
              inline
              color="primary"
              :content="store.getters.getData.conceptId"
            ></v-badge>
            <p class="text-caption">Concept Identifier</p></v-col
          ><v-col cols="2" align="center">
            <v-icon left color="primary">mdi-account-group</v-icon>
            <v-badge
              tile
              inline
              dark
              color="primary"
              :content="store.getters.getData.numPersons"
            ></v-badge>
            <p class="text-caption">Number of People</p></v-col
          ><v-col cols="2" align="center">
            <v-icon small left color="primary">mdi-percent</v-icon>
            <v-badge
              tile
              inline
              dark
              color="primary"
              :content="
                helpers.formatPercent(store.getters.getData.percentPersons)
              "
            ></v-badge>
            <p class="text-caption">% of People</p></v-col
          ><v-col cols="2" align="center">
            <v-icon left color="primary">mdi-table-row</v-icon>
            <v-badge
              tile
              inline
              dark
              color="primary"
              :content="store.getters.getData.recordsPerPerson"
            ></v-badge>
            <p class="text-caption">Records per Person</p></v-col
          >
          <v-col
            v-if="route.params.domain === 'measurement'"
            cols="2"
            align="center"
          >
            <v-icon left color="primary">mdi-database-check-outline</v-icon>
            <v-badge
              tile
              inline
              dark
              color="primary"
              :content="getPercentWithValues"
            ></v-badge>
            <p class="text-caption">% with Values</p></v-col
          >
          <v-col
            v-if="store.getters.getData.conceptData.COUNT_FAILED"
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
              :content="store.getters.getData.countFailed"
            ></v-badge>
            <p class="text-caption">Data Quality Issues</p></v-col
          ><v-col
            v-if="store.getters.getData.isNotStationary"
            cols="2"
            align="center"
          >
            <v-icon left color="error">mdi-clock-alert</v-icon>
            <p class="text-caption">Non-Stationary Time Series</p></v-col
          ></v-row
        >
        <v-card
          v-if="store.getters.getData.measurementTable"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-data-table
            density="compact"
            :headers="headers"
            :items="store.getters.getData.measurementTable"
          >
          </v-data-table>
        </v-card>
        <v-card
          v-if="
            store.getters.getData.conceptData.MEASUREMENT_VALUE_DISTRIBUTION
          "
          :loading="!store.getters.dataInStore"
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
              variant="outlined"
              hide-selected
              closable-chips
              chips
              label="Filter units"
              multiple
            ></v-select>
          </v-layout>
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-measurementvaluedistribution"
            ref="measurementvalue"
            :config="chartConfigs.specMeasurementValueDistribution"
            :data="getSelectedMeasurementUnits"
          />
          <info-panel
            details="Check measurement value distributions across the network"
            icon="mdi-check-network"
            link-details
            :route-link="getNetworkConceptRoute()"
            :divider="true"
          ></info-panel>
          <info-panel
            details="Learn how
              to interpret this plot."
            icon="mdi-help-circle"
            link-details
            :route-link="{ name: 'help' }"
            divider
          ></info-panel>
          <info-panel
            v-if="store.getters.getQueryIndex"
            details="View export query."
            icon="mdi-code-braces"
            link-details
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .MEASUREMENT_VALUE_DISTRIBUTION[0]
              )
            "
            divider
          ></info-panel>
        </v-card>
        <v-card
          v-if="store.getters.getData.conceptData.AGE_AT_FIRST_DIAGNOSIS"
          :loading="!store.getters.dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-ageatfirstdiagnosis"
            :config="chartConfigs.specAgeAtFirstDiagnosis"
            :data="store.getters.getData.conceptData.AGE_AT_FIRST_DIAGNOSIS"
            title="Age at First Diagnosis"
          />
          <info-panel
            details="Learn how
              to interpret this plot."
            icon="mdi-help-circle"
            link-details
            :route-link="{ name: 'help' }"
            divider
          ></info-panel>
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            link-details
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .AGE_AT_FIRST_DIAGNOSIS[0]
              )
            "
            divider
          ></info-panel>
        </v-card>
        <v-card
          v-if="store.getters.getData.conceptData.AGE_AT_FIRST_EXPOSURE"
          :loading="!store.getters.dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-ageatfirstexposure"
            :config="chartConfigs.specAgeAtFirstExposure"
            :data="store.getters.getData.conceptData.AGE_AT_FIRST_EXPOSURE"
            title="Age At First Exposure"
          />
          <info-panel
            details="Learn how
              to interpret this plot."
            icon="mdi-help-circle"
            link-details
            :route-link="{ name: 'help' }"
            divider
          ></info-panel>
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            link-details
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .AGE_AT_FIRST_EXPOSURE[0]
              )
            "
            divider
          ></info-panel>
        </v-card>
        <v-card
          v-if="store.getters.getData.conceptData.LENGTH_OF_ERA"
          :loading="!store.getters.dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-lengthofera"
            :config="chartConfigs.specLengthOfEra"
            :data="store.getters.getData.conceptData.LENGTH_OF_ERA"
            title="Length of Era"
          />
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            link-details
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .LENGTH_OF_ERA[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card
          v-if="store.getters.getData.conceptData.CONDITIONS_BY_TYPE"
          :loading="!store.getters.dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-conditionsbytype"
            :config="chartConfigs.specConditionsByType"
            :data="store.getters.getData.conceptData.CONDITIONS_BY_TYPE"
            title="Conditions by Type"
          />
          <info-panel
            details="Learn about Condition types."
            icon="mdi-help-circle"
            link-details
            :link="links.getDocsLink('CONDITION_OCCURRENCE')"
            :divider="true"
          ></info-panel>
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            link-details
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .CONDITIONS_BY_TYPE[0]
              )
            "
            divider
          ></info-panel>
        </v-card>
        <v-card
          v-if="store.getters.getData.conceptData.DRUGS_BY_TYPE"
          :loading="!store.getters.dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-drugsbytype"
            :config="chartConfigs.specDrugsByType"
            :data="store.getters.getData.conceptData.DRUGS_BY_TYPE"
            title="Drugs by Type"
          />
          <info-panel
            details="Learn about Drug types."
            icon="mdi-help-circle"
            link-details
            :link="links.getDocsLink('DRUG_EXPOSURE')"
            :divider="true"
          ></info-panel>
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            link-details
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .DRUGS_BY_TYPE[0]
              )
            "
            divider
          ></info-panel>
        </v-card>
        <v-card
          v-if="store.getters.getData.conceptData.RECORDS_BY_UNIT"
          :loading="!store.getters.dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-recordsbyunit"
            :config="chartConfigs.specRecordsByUnit"
            :data="store.getters.getData.conceptData.RECORDS_BY_UNIT"
            title="Records by Unit"
          />
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            link-details
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .RECORDS_BY_UNIT[0]
              )
            "
            :divider="true"
          ></info-panel>
        </v-card>
        <v-card
          v-if="store.getters.getData.conceptData.MEASUREMENTS_BY_TYPE"
          :loading="!store.getters.dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-measurementsbytype"
            :config="chartConfigs.specMeasurementsByType"
            :data="store.getters.getData.conceptData.MEASUREMENTS_BY_TYPE"
            title="Measurements by Type"
          />
          <info-panel
            details="Learn about Measurement types."
            icon="mdi-help-circle"
            link-details
            :link="links.getDocsLink('MEASUREMENT')"
            :divider="true"
          ></info-panel>
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            link-details
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .MEASUREMENTS_BY_TYPE[0]
              )
            "
            divider
          ></info-panel>
        </v-card>
        <v-card
          v-if="store.getters.getData.conceptData.AGE_AT_FIRST_OCCURRENCE"
          :loading="!store.getters.dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-ageatfirstoccurrence"
            :config="chartConfigs.specAgeAtFirstOccurrence"
            :data="store.getters.getData.conceptData.AGE_AT_FIRST_OCCURRENCE"
            title="Age at First Occurrence"
          />
          <info-panel
            details="Learn how to interpret this plot"
            :route-link="{ name: 'help' }"
          ></info-panel>
          <info-panel
            details="View export query."
            icon="mdi-code-braces"
            link-details
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .AGE_AT_FIRST_OCCURRENCE[0]
              )
            "
            divider
          ></info-panel>
        </v-card>
        <v-card
          :loading="!store.getters.dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-recordproportionbymonth"
            width="99"
            :config="chartConfigs.specRecordProportionByMonth"
            :data="store.getters.getData.conceptData.PREVALENCE_BY_MONTH"
            title="Record Count Proportion by Month"
          />
          <info-panel
            details="Proportion of people with at least one record per 1000 people."
          ></info-panel>
          <info-panel
            v-if="store.getters.getData.isNotStationary"
            icon="mdi-clock-alert"
            details="This time series has been deemed non-stationary by temporal characterization."
            divider
          ></info-panel>
          <info-panel
            v-if="store.getters.getData.seasonalityScore"
            icon="mdi-clock-alert"
            :details="store.getters.getData.seasonalityComment"
            divider
            :link="links.getCastorLink()"
          ></info-panel>
          <info-panel
            icon="mdi-database-clock"
            divider
            link-details
            :route-link="getSourceConceptReportLink()"
            details="Review this Time-Series across data source releases."
          ></info-panel>
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            link-details
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .PREVALENCE_BY_MONTH[0]
              )
            "
            divider
          ></info-panel>
        </v-card>
        <v-card
          v-if="store.getters.getData.conceptData.DAYS_SUPPLY_DISTRIBUTION"
          :loading="!store.getters.dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-dayssupply"
            :config="chartConfigs.specDaysSupply"
            :data="store.getters.getData.conceptData.DAYS_SUPPLY_DISTRIBUTION"
            title="Days Supply"
          />
          <info-panel
            details="Learn how to interpret this plot"
            :route-link="{ name: 'help' }"
          ></info-panel>
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            link-details
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .DAYS_SUPPLY_DISTRIBUTION[0]
              )
            "
            divider
          ></info-panel>
        </v-card>
        <v-card
          v-if="store.getters.getData.conceptData.QUANTITY_DISTRIBUTION"
          :loading="!store.getters.dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-quantity"
            :config="chartConfigs.specQuantity"
            :data="store.getters.getData.conceptData.QUANTITY_DISTRIBUTION"
            title="Quantity"
          />
          <info-panel
            details="Learn how to interpret this plot"
            :route-link="{ name: 'help' }"
          ></info-panel>
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            link-details
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .QUANTITY_DISTRIBUTION[0]
              )
            "
            divider
          ></info-panel>
        </v-card>
        <v-card
          v-if="store.getters.getData.conceptData.VISIT_DURATION_BY_TYPE"
          :loading="!store.getters.dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.dataInStore"
            id="viz-visitdurationbytype"
            :config="chartConfigs.specVisitDurationByType"
            :data="store.getters.getData.conceptData.VISIT_DURATION_BY_TYPE"
            title="Visit Duration By Type"
          />
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            link-details
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .VISIT_DURATION_BY_TYPE[0]
              )
            "
            divider
          ></info-panel>
        </v-card>
        <v-card
          :loading="!store.getters.dataInStore"
          elevation="10"
          class="ma-4 pa-2"
        >
          <Chart
            v-if="store.getters.getData"
            id="viz-recordproportionbyagesexyear"
            width="90"
            :config="chartConfigs.specRecordProportionByAgeSexYear"
            :data="
              store.getters.getData.conceptData.PREVALENCE_BY_GENDER_AGE_YEAR
            "
            title="Record Count Proportion by Age, Sex, and Year"
          />
          <info-panel
            details="Proportion of people with at least one record per 1000 people."
          ></info-panel>
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            link-details
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .PREVALENCE_BY_GENDER_AGE_YEAR[0]
              )
            "
            divider
          ></info-panel>
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import InfoPanel from "../../../../widgets/infoPanel";
import ReturnButton from "@/features/returnToPreviousPage";
import { useRoute } from "vue-router";
import { chartConfigs, Chart } from "@/widgets/chart";
import { helpers } from "@/shared/lib/mixins";
import { links } from "@/shared/config/links";
import { computed, ref, Ref } from "vue";
import { useStore } from "vuex";
import { VDataTable } from "vuetify/labs/VDataTable";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";

const route = useRoute();
const store = useStore();
const headers: Ref<DataTableHeader[]> = ref([
  {
    title: "Unit",
    sortable: true,
    key: "CATEGORY",
    align: "start",
  },
  {
    title: "Count value",
    sortable: true,
    key: "UNIT_COUNT",
    align: "start",
  },
  {
    title: "Min Value",
    sortable: true,
    key: "MIN_VALUE",
    align: "start",
  },
  {
    title: "P10 Value",
    sortable: true,
    key: "P10_VALUE",
    align: "start",
  },
  {
    title: "P25 Value",
    sortable: true,
    key: "P25_VALUE",
    align: "start",
  },
  {
    title: "Median Value",
    sortable: true,
    key: "MEDIAN_VALUE",
    align: "start",
  },
  {
    title: "P75 Value",
    sortable: true,
    key: "P75_VALUE",
    align: "start",
  },
  {
    title: "P90 Value",
    sortable: true,
    key: "P90_VALUE",
    align: "start",
  },
  {
    title: "Max Value",
    sortable: true,
    key: "MAX_VALUE",
    align: "start",
  },
]);

const selectedMeasurementUnits: Ref<string[]> = ref([]);

const getSelectedMeasurementUnits = computed((): string[] => {
  if (store.getters.getData?.conceptData?.MEASUREMENT_VALUE_DISTRIBUTION) {
    return selectedMeasurementUnits.value.length
      ? store.getters.getData.conceptData.MEASUREMENT_VALUE_DISTRIBUTION.filter(
          (value) => selectedMeasurementUnits.value.includes(value.CATEGORY)
        )
      : store.getters.getData.conceptData.MEASUREMENT_VALUE_DISTRIBUTION;
  } else {
    return [];
  }
});

const getPercentWithValues = computed((): string => {
  const missingData = store.getters.getData.domainSummary.filter(
    (data) => data.CONCEPT_ID === route.params.concept
  )[0].PERCENT_MISSING_VALUES;
  return missingData ? `${((1 - missingData) * 100).toFixed(2)}%` : "No data";
});

const getMeasurementUnits = computed((): string[] => {
  if (store.getters.getData?.conceptData?.MEASUREMENT_VALUE_DISTRIBUTION) {
    return store.getters.getData.conceptData.MEASUREMENT_VALUE_DISTRIBUTION.map(
      (value) => value.CATEGORY
    );
  } else {
    return [];
  }
});

const getSourceConceptReportLink = function () {
  return {
    name: "sourceConceptOverlay",
    params: {
      domain: route.params.domain,
      concept: route.params.concept,
    },
  };
};

const getNetworkConceptRoute = function (): object {
  return {
    name: "networkConcept",
    params: {
      domain: route.params.domain,
      concept: route.params.concept,
    },
  };
};

const navigateToDataQuality = function () {
  return {
    name: "dataQuality",
    query: { tab: "results", search: route.params.concept },
  };
};
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
