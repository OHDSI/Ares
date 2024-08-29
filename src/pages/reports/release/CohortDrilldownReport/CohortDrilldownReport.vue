<template>
  <div class="flex flex-col gap-10">
    <PageHeader :title="cohortName || 'Report name unknown'">
      <template #action>
        <div class="flex flex-row gap-2">
          <ReturnButton />
        </div>
      </template>
    </PageHeader>
    <CohortCharacterizationReport :data="characterizationTable" />
    <IndexEventBreakdownTable :data="indexEventBreakdownTable" />
    <TimeDistributionChart :data="timeDistributionChart" />
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import CohortCharacterizationReport from "@/pages/reports/release/CohortDrilldownReport/reports/CohortCharacterizationTable.vue";
import PageHeader from "@/entities/pageHeader/PageHeader.vue";
import { computed } from "vue";
import { useRoute } from "vue-router";
import ReturnButton from "@/features/returnToPreviousPage";
import IndexEventBreakdownTable from "@/pages/reports/release/CohortDrilldownReport/reports/IndexEventBreakdownTable.vue";
import TimeDistributionChart from "@/pages/reports/release/CohortDrilldownReport/reports/timeDistribution/TimeDistributionChart.vue";

const store = useStore();
const route = useRoute();

const characterizationTable = computed(() => {
  return store.getters.getData.characterizationTable || [];
});

const indexEventBreakdownTable = computed(() => {
  return store.getters.getData.indexEventBreakdownTable || [];
});

const timeDistributionChart = computed(() => {
  return store.getters.getData.timeDistribution || [];
});

// const getFilteredCharacterizationTable = computed(() => {
//   return characterizationTable.value.filter((val) => {
//     return route.params.cohort_id === val.cohort_id;
//   });
// });

// const getFilteredIndexEventBreakdownTable = computed(() => {
//   return indexEventBreakdownTable.value.filter((val) => {
//     return route.params.cohort_id === val.cohort_id;
//   });
// });

// const getFilteredTimeDistributionChart = computed(() => {
//   return timeDistributionChart.value.filter((val) => {
//     return route.params.cohort_id === val.cohort_id;
//   });
// });

const cohortName = computed(() => {
  return characterizationTable.value[0]?.cohort_name;
});
</script>

<style scoped></style>
