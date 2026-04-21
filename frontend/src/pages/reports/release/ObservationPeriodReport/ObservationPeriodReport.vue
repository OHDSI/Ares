<template>
  <div class="flex flex-col gap-10">
    <PageHeader title="Observation Period Report" />
    <div class="flex flex-col gap-5">
      <CumulativeObservation />
      <ObservationPeriodsPerPerson />
      <ObservationOverTime />
      <YearsOfObservationByAge />
      <YearsOfObservationBySex />
      <AgeAtFirstObservation />
      <AgeAtFirstObservationBySex />
    </div>
  </div>
</template>

<script setup lang="ts">
import CumulativeObservation from "@/pages/reports/release/ObservationPeriodReport/charts/CumulativeObservation";
import ObservationPeriodsPerPerson from "@/pages/reports/release/ObservationPeriodReport/charts/ObservationPeriodPerPerson";
import ObservationOverTime from "@/pages/reports/release/ObservationPeriodReport/charts/ObservationOverTime";
import YearsOfObservationByAge from "@/pages/reports/release/ObservationPeriodReport/charts/YearsOfObservationByAge";
import YearsOfObservationBySex from "@/pages/reports/release/ObservationPeriodReport/charts/YearsOfObservationBySex";
import AgeAtFirstObservation from "@/pages/reports/release/ObservationPeriodReport/charts/AgeAtFirstObservation";
import AgeAtFirstObservationBySex from "@/pages/reports/release/ObservationPeriodReport/charts/AgeAtFirstObservationBySex";
import { useStore } from "vuex";
import PageHeader from "@/shared/ui/pageHeader";

const store = useStore();
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
