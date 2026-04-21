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

import AgeAtFirstObservation from "@/pages/reports/network/NetworkPopulationReport/charts/ageAtFirstObservation";
import CumulativeObservation from "@/pages/reports/network/NetworkPopulationReport/charts/cumulativeObservation";
import PageHeader from "@/shared/ui/pageHeader";

const store = useStore();
</script>

<style scoped></style>
