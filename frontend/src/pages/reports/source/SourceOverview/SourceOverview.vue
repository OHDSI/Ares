<template>
  <div
    v-if="store.getters.explorerLoaded"
    id="network-data-quality-overview"
    class="flex flex-col gap-10"
  >
    <div class="flex flex-row gap-5">
      <ReleaseListing class="basis-full" />
    </div>
    <div class="grid grid-cols-2 gap-5">
      <div>
        <PopulationHistory class="min-h-[425px]" />
      </div>
      <div>
        <DataQualityIssuesHistory class="min-h-[425px]" />
      </div>
    </div>
    <SourceDataStrand />
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import PopulationHistory from "@/pages/reports/source/SourceOverview/charts/populationHistory";
import DataQualityIssuesHistory from "@/pages/reports/source/SourceOverview/charts/dataQualityIssuesHistory";
import ReleaseListing from "@/pages/reports/source/SourceOverview/charts/releaseListing";
import SourceDataStrand from "@/pages/reports/source/SourceOverview/charts/sourceDataStrand";

const store = useStore();
</script>

<style scoped></style>
