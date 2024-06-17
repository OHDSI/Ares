<template>
  <div v-if="!store.getters.getErrors">
    <div class="flex flex-col gap-5">
      <PageHeader title="NETWORK CONCEPT REPORT">
        <template #action>
          <div class="flex flex-row gap-2">
            <Button @click="atClick">
              <span class="uppercase font-light text-white py-1 px-2">
                Search concepts
              </span></Button
            >
            <ReturnButton />
          </div>
        </template>
      </PageHeader>

      <div class="flex flex-col gap-5" v-if="data">
        <info-panel
          v-if="metadata"
          :concept="metadata.conceptId"
          :population="metadata.numPersons"
          :domain="metadata.domain"
        />
        <AgeAtFirstOccurrence
          v-if="ageAtFirstOccurrence.length"
          :data="ageAtFirstOccurrence"
        />
        <RecordCountProportionByMonth
          v-if="recordCountProportionByMonth.length"
          :data="recordCountProportionByMonth"
        />
        <MeasurementValueDistributionChart
          v-if="measurementValueDistribution.chart.length"
          :data="measurementValueDistribution"
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
        <VisitDurationByType
          v-if="visitDurationByType.length"
          :data="visitDurationByType"
        />
        <RecordsByUnit v-if="recordsByUnit.length" :data="recordsByUnit" />
        <MeasurementsByType
          v-if="measurementsByType.length"
          :data="measurementsByType"
        />
        <LengthOfEra v-if="lengthOfEra.length" :data="lengthOfEra" />
      </div>
      <div
        class="flex items-center content-center justify-center h-[50vh]"
        v-else
      >
        <span class="text-center text-2xl text-black dark:text-white">
          No data available. Please select a concept.
        </span>
      </div>
    </div>
    <ConceptSearchForm
      :added-concepts="selectedConcept"
      :success-message="successMessage"
      :errors="errors"
      @close="close"
      @inputChanged="clearMessages"
      :show="showWebApiSearchForm"
    />
  </div>
</template>

<script setup lang="ts">
import ReturnButton from "@/features/returnToPreviousPage";

import { useStore } from "vuex";
import MeasurementValueDistributionChart from "@/pages/reports/network/NetworkConceptReport/charts/measurementValueDistributionChart/MeasurementValueDistributionChart.vue";
import { computed, onMounted, ref } from "vue";
import RecordCountProportionByMonth from "@/pages/reports/network/NetworkConceptReport/charts/RecordCountProportionByMonth/RecordCountProportionByMonth.vue";
import { useRoute } from "vue-router";
import AgeAtFirstExposure from "@/pages/reports/network/NetworkConceptReport/charts/ageAtFirstExposure/AgeAtFirstExposure.vue";
import DrugsByType from "@/pages/reports/network/NetworkConceptReport/charts/drugsByType/DrugsByType.vue";
import DaysSupply from "@/pages/reports/network/NetworkConceptReport/charts/daysSupply/DaysSupply.vue";
import QuantityDistribution from "@/pages/reports/network/NetworkConceptReport/charts/quantityDistribution/QuantityDistribution.vue";
import AgeAtFirstDiagnosis from "@/pages/reports/network/NetworkConceptReport/charts/ageAtFirstDiagnosis/AgeAtFirstDiagnosis.vue";
import ConditionsByType from "@/pages/reports/network/NetworkConceptReport/charts/conditionsByType/ConditionsByType.vue";
import VisitDurationByType from "@/pages/reports/network/NetworkConceptReport/charts/visitDurationByType/VisitDurationByType.vue";
import RecordsByUnit from "@/pages/reports/network/NetworkConceptReport/charts/recordsByUnit/RecordsByUnit.vue";
import MeasurementsByType from "@/pages/reports/network/NetworkConceptReport/charts/measurementsByType/MeasurementsByType.vue";
import LengthOfEra from "@/pages/reports/network/NetworkConceptReport/charts/lengthOfEra/LengthOfEra.vue";
import AgeAtFirstOccurrence from "@/pages/reports/network/NetworkConceptReport/charts/ageAtFirstOccurrence/AgeAtFirstOccurrence.vue";
import InfoPanel from "@/widgets/infoPanel";
import PageHeader from "@/entities/pageHeader/PageHeader.vue";
import Button from "primevue/button";
import environment from "@/shared/api/environment";
import { ConceptSearchForm } from "@/widgets/conceptSearchForm";
import { webApiActions } from "@/shared/api/webAPI";

const store = useStore();
const route = useRoute();

const selectedConcept = ref([]);

const isDataLoaded = computed(() => {
  return Object.keys(data.value).length;
});

const showWebApiSearchForm = ref(false);
const clearMessages = function () {
  errors.value = "";
  successMessage.value = [];
};

const data = computed(() => {
  return store.getters.getData.concept;
});

function atClick() {
  showWebApiSearchForm.value = true;
}

const errors = ref("");
const close = function () {
  showWebApiSearchForm.value = false;
  store.dispatch(webApiActions.RESET_API_STORAGE);
  successMessage.value = [];
};

const successMessage = ref([]);

const concept = ref("");
const selected = ref(null);

const metadata = computed(() => {
  return data.value?.metadata;
});
const recordCountProportionByMonth = computed(() => {
  return data.value?.chart?.recordCountProportionByMonth || [];
});

const ageAtFirstExposure = computed(() => {
  return data.value?.chart?.ageAtFirstExposure || [];
});
const drugsByType = computed(() => {
  return data.value?.chart?.drugsByType || [];
});
const daysSupply = computed(() => {
  return data.value?.chart?.daysSupply || [];
});
const measurementValueDistribution = computed(() => {
  return {
    table: data.value?.table?.measurementValueDistribution || [],
    chart: data.value?.chart?.measurementValueDistribution || [],
  };
});
const quantityDistribution = computed(() => {
  return data.value?.chart?.quantityDistribution || [];
});
const ageAtFirstDiagnosis = computed(() => {
  return data.value?.chart?.ageAtFirstDiagnosis || [];
});
const conditionsByType = computed(() => {
  return data.value?.chart?.conditionsByType || [];
});
const visitDurationByType = computed(() => {
  return data.value?.chart?.visitDurationByType || [];
});
const recordsByUnit = computed(() => {
  return data.value?.chart?.recordsByUnit || [];
});
const measurementsByType = computed(() => {
  return data.value?.chart?.measurementsByType || [];
});
const lengthOfEra = computed(() => {
  return data.value?.chart?.lengthOfEra || [];
});
const ageAtFirstOccurrence = computed(() => {
  return data.value?.chart?.ageAtFirstOccurrence || [];
});

onMounted(() => {
  concept.value = route.params.concept;
  selected.value = route.params.domain;
});
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
