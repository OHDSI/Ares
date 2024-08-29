<template>
  <div
    v-if="store.getters.explorerLoaded"
    id="network-data-quality-overview"
    class="flex flex-col gap-10"
  >
    <div class="flex flex-row gap-5">
      <ReleaseListing class="basis-full" />
    </div>
    <div class="flex flex-row gap-5 items-stretch">
      <PopulationHistory class="basis-full h-full" />
      <DataQualityIssuesHistory class="basis-full h-full" />
    </div>
    <SourceDataStrand />
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import PopulationHistory from "@/pages/reports/source/SourceOverview/charts/populationHistory/PopulationHistory.vue";
import DataQualityIssuesHistory from "@/pages/reports/source/SourceOverview/charts/dataQualityIssuesHistory/DataQualityIssuesHistory.vue";
import ReleaseListing from "@/pages/reports/source/SourceOverview/charts/releaseListing/ReleaseListing.vue";
import SourceDataStrand from "@/pages/reports/source/SourceOverview/charts/sourceDataStrand/SourceDataStrand.vue";

const store = useStore();
</script>

<style scoped></style>
