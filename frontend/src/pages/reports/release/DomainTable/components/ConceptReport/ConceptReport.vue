<template>
  <div class="flex flex-col gap-10">
    <PageHeader :title="title">
      <template #action>
        <div class="flex flex-row gap-2">
          <button
            @click="navigateToNetworkConcept"
            class="network-btn inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md transition-all duration-150 cursor-pointer whitespace-nowrap"
          >
            <svg-icon type="mdi" :path="mdiCheckNetwork" />
            <span>Network Report</span>
          </button>
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
        route.params.domain === 'measurement' ? getPercentWithValues : undefined
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

    <MeasurementValueDistribution />
    <AgeAtFirstDiagnosis />
    <AgeAtFirstExposure />
    <LengthOfEra />
    <ConditionsByType />
    <DrugsByType />
    <RecordsByUnit />
    <MeasurementsByType />
    <AgeAtFirstOccurrence />
    <RecordCountProportionByMonth :conceptId="conceptId" />
    <DaysSupply />
    <QuantityDistribution />
    <VisitDurationByType />
    <RecordCountProportionByAgeSexYear />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";
import { useStore } from "vuex";
import MeasurementValueDistribution from "./charts/MeasurementValueDistribution";
import AgeAtFirstDiagnosis from "./charts/AgeAtFirstDiagnosis";
import AgeAtFirstExposure from "./charts/AgeAtFirstExposure";
import LengthOfEra from "./charts/LengthOfEra";
import ConditionsByType from "./charts/ConditionsByType";
import DrugsByType from "./charts/DrugsByType";
import RecordsByUnit from "./charts/RecordsByUnit";
import MeasurementsByType from "./charts/MeasurementsByType";
import AgeAtFirstOccurrence from "./charts/AgeAtFirstOccurrence";
import RecordCountProportionByMonth from "./charts/RecordsCountProportionByMonth";
import DaysSupply from "./charts/DaysSupply";
import QuantityDistribution from "./charts/QuantityDistribution";
import VisitDurationByType from "./charts/VisitDurationByType";
import RecordCountProportionByAgeSexYear from "./charts/RecordCountProportionByAgeSexYear";
import InfoPanel from "@/widgets/infoPanel";
import PageHeader from "@/shared/ui/pageHeader";
import { mdiCheckNetwork } from "@mdi/js";
import SvgIcon from "@/shared/ui/svgIcon";

const route = useRoute();
const router = useRouter();
const store = useStore();

const title = store.getters.getData.conceptName || "Report name unknown";
const conceptId = store.getters.getData.conceptId;

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

const darkMode = computed(() => store.getters.getSettings.darkMode);
const btnBorder = computed(() =>
  darkMode.value ? "rgba(33,150,243,0.5)" : "rgb(33,150,243)"
);
const btnColor = computed(() =>
  darkMode.value ? "rgb(33,150,243)" : "rgb(7,56,104)"
);
const btnBg = computed(() =>
  darkMode.value ? "rgba(33,150,243,0.08)" : "rgba(33,150,243,0.05)"
);
const btnBorderHover = computed(() =>
  darkMode.value ? "rgba(33,150,243,0.9)" : "rgb(25,118,210)"
);
const btnColorHover = computed(() =>
  darkMode.value ? "rgb(100,181,246)" : "rgb(4,41,80)"
);
const btnBgHover = computed(() =>
  darkMode.value ? "rgba(33,150,243,0.18)" : "rgba(33,150,243,0.1)"
);
const navigateToNetworkConcept = function () {
  const { domain } = route.params;
  router.push({
    name: "networkComparisonTool",
    query: {
      domain,
      concept: conceptId,
      report: "domain",
    },
  });
};
</script>

<style scoped>
.viz-container {
  width: 90%;
}
.network-btn {
  border: 1px solid v-bind(btnBorder);
  color: v-bind(btnColor);
  background: v-bind(btnBg);
}
.network-btn:hover {
  border-color: v-bind(btnBorderHover);
  color: v-bind(btnColorHover);
  background: v-bind(btnBgHover);
}
</style>
