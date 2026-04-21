<template>
  <div v-if="!store.getters.getErrors">
    <div class="flex flex-col gap-5" v-if="data">
      <PageHeader :title="title || 'Report name unknown'"> </PageHeader>
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
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import SvgIcon from "@/shared/ui/svgIcon";
import MeasurementValueDistributionChart from "./charts/measurementValueDistributionChart";
import { computed } from "vue";
import RecordCountProportionByMonth from "./charts/RecordCountProportionByMonth";
import AgeAtFirstExposure from "./charts/ageAtFirstExposure";
import DrugsByType from "./charts/drugsByType";
import DaysSupply from "./charts/daysSupply";
import QuantityDistribution from "./charts/quantityDistribution";
import AgeAtFirstDiagnosis from "./charts/ageAtFirstDiagnosis";
import ConditionsByType from "./charts/conditionsByType";
import VisitDurationByType from "./charts/visitDurationByType";
import RecordsByUnit from "./charts/recordsByUnit";
import MeasurementsByType from "./charts/measurementsByType";
import LengthOfEra from "./charts/lengthOfEra";
import AgeAtFirstOccurrence from "./charts/ageAtFirstOccurrence";
import InfoPanel from "@/widgets/infoPanel";
import { mdiCheckNetwork } from "@mdi/js";
import Button from "primevue/button";
import PageHeader from "@/shared/ui/pageHeader";

const store = useStore();

const props = defineProps(["data"]);

const data = computed(() => {
  return props.data?.concept;
});

const metadata = computed(() => {
  return data.value?.metadata;
});

const title = computed(() => metadata.value.conceptName);
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
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
