<template>
  <div v-if="!store.getters.getErrors">
    <v-container fluid>
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-5 d-flex justify-space-between">
          <h2 v-if="store.getters.getData.metadata" class="text-uppercase">
            {{ store.getters.getData.metadata.conceptName }}
            NETWORK REPORT
          </h2>
          <ReturnButton />
        </v-layout>
        <InfoPanel
          v-if="store.getters.getData.metadata"
          :concept="store.getters.getData.metadata.conceptId"
          :network-population="store.getters.getData.metadata.numPersons"
        />
        <MeasurementValueDistributionTable />
        <MeasurementValueDistributionChart />
      </v-responsive>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import ReturnButton from "@/features/returnToPreviousPage";

import { useStore } from "vuex";
import MeasurementValueDistributionTable from "@/pages/reports/network/NetworkConceptReport/charts/measurementValueDistributionTable/MeasurementValueDistributionTable.vue";
import MeasurementValueDistributionChart from "@/pages/reports/network/NetworkConceptReport/charts/measurementValueDistributionChart/MeasurementValueDistributionChart.vue";
import InfoPanel from "@/widgets/infoPanel";

const store = useStore();
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
