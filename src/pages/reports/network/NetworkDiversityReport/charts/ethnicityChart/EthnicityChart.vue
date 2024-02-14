<template>
  <Panel header="Ethnicity">
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-network-ethnicity"
      :chartSpec="specEthnicity"
      :data="store.getters.getData.ethnicityData"
    />
  </Panel>
</template>

<script setup lang="ts">
import Panel from "primevue/panel";
import { specEthnicity } from "@/pages/reports/network/NetworkDiversityReport/charts/ethnicityChart/specEthnicity";
import { Chart } from "@/widgets/chart";
import { useStore } from "vuex";

const store = useStore();
</script>

<style scoped></style>
