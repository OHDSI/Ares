<template>
  <Panel header="Race">
    <Chart id="viz-race" :chartSpec="specRace" :data="raceData" />
  </Panel>
</template>

<script setup lang="ts">
import Panel from "primevue/panel";
import { useStore } from "vuex";
import { specRace } from "@/pages/reports/network/NetworkDiversityReport/charts/raceChart/specRace";
import { Chart } from "@/widgets/chart";
import { computed } from "vue";

const store = useStore();

const raceData = computed(() => {
  return store.getters.getData.raceData;
});
</script>

<style scoped></style>
