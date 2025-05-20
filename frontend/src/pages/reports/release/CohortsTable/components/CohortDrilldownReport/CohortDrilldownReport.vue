<template>
  <div class="flex flex-col gap-10">
    <PageHeader :title="cohortName || 'Report name unknown'"> </PageHeader>
    <CohortCharacterizationReport :data="characterizationTable" />
    <IndexEventBreakdownTable :data="indexEventBreakdownTable" />
    <TimeDistributionChart :data="timeDistributionChart" />
  </div>
</template>

<script setup lang="ts">
import CohortCharacterizationReport from "@/pages/reports/release/CohortDrilldownReport/reports/CohortCharacterizationTable.vue";
import PageHeader from "@/entities/pageHeader/PageHeader.vue";
import { computed } from "vue";
import IndexEventBreakdownTable from "@/pages/reports/release/CohortDrilldownReport/reports/IndexEventBreakdownTable.vue";
import TimeDistributionChart from "@/pages/reports/release/CohortDrilldownReport/reports/timeDistribution/TimeDistributionChart.vue";
import { useRoute } from "vue-router";

interface Props {
  data: never;
}

const route = useRoute();

const cohort_id = computed(() => {
  return route.params.cohort_id;
});

const props = defineProps<Props>();

const data = computed(() => {
  return props.data;
});

const characterizationTable = computed(() => {
  return (
    data.value.characterizationTable.filter(
      (val) => val.cohort_id.toString() === cohort_id.value
    ) || []
  );
});

const indexEventBreakdownTable = computed(() => {
  return (
    data.value.indexEventBreakdownTable.filter(
      (val) => val.cohort_id.toString() === cohort_id.value
    ) || []
  );
});

const timeDistributionChart = computed(() => {
  return (
    data.value.timeDistribution.filter(
      (val) => val.cohort_id.toString() === cohort_id.value
    ) || []
  );
});

const cohortName = computed(() => {
  return characterizationTable.value[0]?.cohort_name;
});
</script>

<style scoped></style>
