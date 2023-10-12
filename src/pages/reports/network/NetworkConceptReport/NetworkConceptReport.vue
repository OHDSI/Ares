<template>
  <div v-if="!store.getters.getErrors">
    <v-container fluid>
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-5 d-flex justify-space-between">
          <h2 class="text-uppercase">NETWORK CONCEPT REPORT</h2>
          <ReturnButton />
        </v-layout>
        <v-layout class="ma-0 mb-5 d-flex justify-space-between">
          <v-row>
            <v-col cols="3">
              <v-text-field
                v-model="concept"
                prepend-icon="mdi-magnify"
                label="Enter concept ID"
                single-line
                variant="outlined"
                density="compact"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="3">
              <v-select
                :items="domains"
                v-model="selected"
                variant="outlined"
                density="compact"
                item-title="text"
                item-value="value"
              ></v-select>
            </v-col>
            <v-col cols="3">
              <v-btn @click="atClick"> Show </v-btn>
            </v-col>
            <!--            <v-col cols="auto">
              <SelectColumns :headers="headers" />
            </v-col>-->
          </v-row>
        </v-layout>
        <v-row v-if="metadata" justify="start">
          <v-col cols="2" align="center">
            <v-icon left color="info">mdi-identifier</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="metadata.conceptId"
            ></v-badge>
            <p class="text-caption">Concept Identifier</p>
          </v-col>
          <v-col cols="2" align="center">
            <v-icon left color="info">mdi-account-group</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="metadata.numPersons"
            ></v-badge>
            <p class="text-caption">Number of People in Network</p>
          </v-col>
        </v-row>
        <RecordCountProportionByMonth
          v-if="recordCountProportionByMonth.length"
          :data="recordCountProportionByMonth"
        />
        <MeasurementValueDistributionTable
          v-if="measurementTable.length"
          :data="measurementTable"
        />
        <MeasurementValueDistributionChart
          v-if="measurementChart.length"
          :data="measurementChart"
        />
        <AgeAtFirstExposure
          v-if="ageAtFirstExposure.length"
          :data="ageAtFirstExposure"
        />
        <AgeAtFirstDiagnosis
          v-if="ageAtFirstDiagnosis.length"
          :data="ageAtFirstDiagnosis"
        />
        <DaysSupply v-if="daysSupply.length" :data="daysSupply" />
        <DrugsByType v-if="drugsByType.length" :data="drugsByType" />
        <QuantityDistribution
          v-if="quantityDistribution.length"
          :data="quantityDistribution"
        />
        <ConditionsByType
          v-if="conditionsByType.length"
          :data="conditionsByType"
        />
      </v-responsive>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import ReturnButton from "@/features/returnToPreviousPage";

import { useStore } from "vuex";
import MeasurementValueDistributionTable from "@/pages/reports/network/NetworkConceptReport/charts/measurementValueDistributionTable/MeasurementValueDistributionTable.vue";
import MeasurementValueDistributionChart from "@/pages/reports/network/NetworkConceptReport/charts/measurementValueDistributionChart/MeasurementValueDistributionChart.vue";
import { computed, ref } from "vue";
import RecordCountProportionByMonth from "@/pages/reports/network/NetworkConceptReport/charts/RecordCountProportionByMonth/RecordCountProportionByMonth.vue";
import { useRouter } from "vue-router";
import AgeAtFirstExposure from "@/pages/reports/network/NetworkConceptReport/charts/ageAtFirstExposure/AgeAtFirstExposure.vue";
import DrugsByType from "@/pages/reports/network/NetworkConceptReport/charts/drugsByType/DrugsByType.vue";
import DaysSupply from "@/pages/reports/network/NetworkConceptReport/charts/daysSupply/DaysSupply.vue";
import QuantityDistribution from "@/pages/reports/network/NetworkConceptReport/charts/quantityDistribution/QuantityDistribution.vue";
import AgeAtFirstDiagnosis from "@/pages/reports/network/NetworkConceptReport/charts/ageAtFirstDiagnosis/AgeAtFirstDiagnosis.vue";
import ConditionsByType from "@/pages/reports/network/NetworkConceptReport/charts/conditionsByType/ConditionsByType.vue";
import InfoPanel from "@/widgets/infoPanel";

const store = useStore();
const router = useRouter();

function atClick() {
  router.push({
    params: {
      domain: selected.value,
      concept: concept.value,
    },
  });
}

const concept = ref("");
const selected = ref(null);
const domains = [
  { value: "condition_occurrence", text: "Condition occurrence" },
  { value: "drug_exposure", text: "Drug exposure" },
  { value: "device_exposure", text: "Device exposure" },
  { value: "measurement", text: "Measurement" },
  { value: "death", text: "Death" },
  { value: "procedure_occurrence", text: "Procedure occurrence" },
  { value: "observation_period", text: "Observation" },
];

const metadata = computed(() => {
  return store.getters.getData?.metadata;
});
const recordCountProportionByMonth = computed(() => {
  return store.getters.getData?.chart?.recordCountProportionByMonth || [];
});

const measurementChart = computed(() => {
  return store.getters.getData?.chart?.measurementValueDistribution || [];
});
const ageAtFirstExposure = computed(() => {
  return store.getters.getData?.chart?.ageAtFirstExposure || [];
});
const drugsByType = computed(() => {
  return store.getters.getData?.chart?.drugsByType || [];
});

const daysSupply = computed(() => {
  return store.getters.getData?.chart?.daysSupply || [];
});

const measurementTable = computed(() => {
  return store.getters.getData?.table?.measurementValueDistribution || [];
});
const quantityDistribution = computed(() => {
  return store.getters.getData?.chart?.quantityDistribution || [];
});
const ageAtFirstDiagnosis = computed(() => {
  return store.getters.getData?.chart?.ageAtFirstDiagnosis || [];
});
const conditionsByType = computed(() => {
  return store.getters.getData?.chart?.conditionsByType || [];
});
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
