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
        <v-row v-if="store.getters.getData.metadata" justify="start">
          <v-col cols="2" align="center">
            <v-icon left color="info">mdi-identifier</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="store.getters.getData.metadata.conceptId"
            ></v-badge>
            <p class="text-caption">Concept Identifier</p>
          </v-col>
          <v-col cols="2" align="center">
            <v-icon left color="info">mdi-account-group</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="store.getters.getData.metadata.numPersons"
            ></v-badge>
            <p class="text-caption">Number of People in Network</p>
          </v-col>
        </v-row>
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

const store = useStore();
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
