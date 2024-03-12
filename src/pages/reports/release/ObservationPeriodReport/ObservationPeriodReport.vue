<template>
  <div
    class="flex flex-col gap-10"
    v-if="!store.getters.getErrors && store.getters.dataInStore"
  >
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
import CumulativeObservation from "@/pages/reports/release/ObservationPeriodReport/charts/CumulativeObservation/CumulativeObservation.vue";
import ObservationPeriodsPerPerson from "@/pages/reports/release/ObservationPeriodReport/charts/ObservationPeriodPerPerson/ObservationPeriodsPerPerson.vue";
import ObservationOverTime from "@/pages/reports/release/ObservationPeriodReport/charts/ObservationOverTime/ObservationOverTime.vue";
import YearsOfObservationByAge from "@/pages/reports/release/ObservationPeriodReport/charts/YearsOfObservationByAge/YearsOfObservationByAge.vue";
import YearsOfObservationBySex from "@/pages/reports/release/ObservationPeriodReport/charts/YearsOfObservationBySex/YearsOfObservationBySex.vue";
import AgeAtFirstObservation from "@/pages/reports/release/ObservationPeriodReport/charts/AgeAtFirstObservation/AgeAtFirstObservation.vue";
import AgeAtFirstObservationBySex from "@/pages/reports/release/ObservationPeriodReport/charts/AgeAtFirstObservationBySex/AgeAtFirstObservationBySex.vue";
import { useStore } from "vuex";
import PageHeader from "@/entities/pageHeader/PageHeader.vue";

const store = useStore();
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
