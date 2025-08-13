<template>
  <div v-if="!store.getters.getErrors" class="flex flex-col gap-10">
    <PageHeader title="Network Population Overview" />
    <div class="flex flex-col gap-5">
      <AgeAtFirstObservation />
      <CumulativeObservation />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";

import AgeAtFirstObservation from "@/pages/reports/network/NetworkPopulationReport/charts/ageAtFirstObservation/AgeAtFirstObservation.vue";
import CumulativeObservation from "@/pages/reports/network/NetworkPopulationReport/charts/cumulativeObservation/CumulativeObservation.vue";
import PageHeader from "@/entities/pageHeader/PageHeader.vue";

const store = useStore();
</script>

<style scoped></style>
