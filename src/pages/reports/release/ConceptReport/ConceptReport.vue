<template>
  <div v-if="!store.getErrors && store.getters.dataInStore">
    <div class="flex flex-col gap-10">
      <PageHeader :title="store.getters.getData.conceptName">
        <template #default>
          <div class="flex flex-row gap-2">
            <Button
              size="small"
              style="width: 180px; height: 30px"
              @click="navigateToNetworkConcept"
            >
              <svg-icon
                class="text-white"
                type="mdi"
                :path="mdiCheckNetwork"
              ></svg-icon>
              <span class="text-white uppercase text-base">
                Network Report
              </span>
            </Button>
            <ReturnButton />
          </div>
        </template>
      </PageHeader>
      <InfoPanel
        :network-concept-report="navigateToNetworkConcept"
        :concept="store.getters.getData.conceptId"
        :population="store.getters.getData.numPersons"
        :percent-people="store.getters.getData.percentPersons"
        :records-per-person="store.getters.getData.recordsPerPerson"
        :percent-values="
          route.params.domain === 'measurement'
            ? getPercentWithValues
            : undefined
        "
        :count-failed="
          store.getters.getData.countFailed
            ? {
                value: store.getters.getData.countFailed,
                action: navigateToDataQuality,
              }
            : undefined
        "
        :not-stationary="store.getters.getData.isNotStationary"
      />

      <MeasurementTable />
      <MeasurementValueDistribution />
      <AgeAtFirstDiagnosis />
      <AgeAtFirstExposure />
      <LengthOfEra />
      <ConditionsByType />
      <DrugsByType />
      <RecordsByUnit />
      <MeasurementsByType />
      <AgeAtFirstOccurrence />
      <RecordCountProportionByMonth />
      <DaysSupply />
      <QuantityDistribution />
      <VisitDurationByType />
      <RecordCountProportionByAgeSexYear />
    </div>
  </div>
</template>

<script setup lang="ts">
import ReturnButton from "@/features/returnToPreviousPage";
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";
import { useStore } from "vuex";
import MeasurementTable from "@/pages/reports/release/ConceptReport/charts/MeasurementTable/MeasurementTable.vue";
import MeasurementValueDistribution from "@/pages/reports/release/ConceptReport/charts/MeasurementValueDistribution/MeasurementValueDistribution.vue";
import AgeAtFirstDiagnosis from "@/pages/reports/release/ConceptReport/charts/AgeAtFirstDiagnosis/AgeAtFirstDiagnosis.vue";
import AgeAtFirstExposure from "@/pages/reports/release/ConceptReport/charts/AgeAtFirstExposure/AgeAtFirstExposure.vue";
import LengthOfEra from "@/pages/reports/release/ConceptReport/charts/LengthOfEra/LengthOfEra.vue";
import ConditionsByType from "@/pages/reports/release/ConceptReport/charts/ConditionsByType/ConditionsByType.vue";
import DrugsByType from "@/pages/reports/release/ConceptReport/charts/DrugsByType/DrugsByType.vue";
import RecordsByUnit from "@/pages/reports/release/ConceptReport/charts/RecordsByUnit/RecordsByUnit.vue";
import MeasurementsByType from "@/pages/reports/release/ConceptReport/charts/MeasurementsByType/MeasurementsByType.vue";
import AgeAtFirstOccurrence from "@/pages/reports/release/ConceptReport/charts/AgeAtFirstOccurrence/AgeAtFirstOccurrence.vue";
import RecordCountProportionByMonth from "@/pages/reports/release/ConceptReport/charts/RecordsCountProportionByMonth/RecordCountProportionByMonth.vue";
import DaysSupply from "@/pages/reports/release/ConceptReport/charts/DaysSupply/DaysSupply.vue";
import QuantityDistribution from "@/pages/reports/release/ConceptReport/charts/QuantityDistribution/QuantityDistribution.vue";
import VisitDurationByType from "@/pages/reports/release/ConceptReport/charts/VisitDurationByType/VisitDurationByType.vue";
import RecordCountProportionByAgeSexYear from "@/pages/reports/release/ConceptReport/charts/RecordCountProportionByAgeSexYear/RecordCountProportionByAgeSexYear.vue";
import InfoPanel from "@/widgets/infoPanel";
import PageHeader from "@/entities/pageHeader/PageHeader.vue";
import { mdiCheckNetwork } from "@mdi/js";
import SvgIcon from "@jamescoyle/vue-icon";
import Button from "primevue/button";

const route = useRoute();
const router = useRouter();
const store = useStore();

const getPercentWithValues = computed((): string => {
  const missingData = store.getters.getData.domainSummary.filter(
    (data) => data.CONCEPT_ID === route.params.concept
  )[0].PERCENT_MISSING_VALUES;
  return missingData ? `${((1 - missingData) * 100).toFixed(2)}%` : "No data";
});

const navigateToDataQuality = function () {
  return {
    name: "dataQuality",
    query: { tab: "results", search: route.params.concept },
  };
};
const navigateToNetworkConcept = function () {
  router.push({
    name: "networkConcept",
    params: {
      domain: route.params.domain,
      concept: route.params.concept,
    },
  });
};
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
