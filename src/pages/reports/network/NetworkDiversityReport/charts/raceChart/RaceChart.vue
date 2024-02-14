<template>
  <Panel header="Race">
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-race"
      :chartSpec="specRace"
      :data="store.getters.getData.raceData"
    />
  </Panel>
</template>

<script setup lang="ts">
import Panel from "primevue/panel";
import { useStore } from "vuex";
import { specRace } from "@/pages/reports/network/NetworkDiversityReport/charts/raceChart/specRace";
import { Chart } from "@/widgets/chart";

const store = useStore();
</script>

<style scoped></style>
