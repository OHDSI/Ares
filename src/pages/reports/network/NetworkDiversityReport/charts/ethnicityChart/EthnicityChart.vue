<template>
  <Panel header="Ethnicity">
    <Chart
      id="viz-network-ethnicity"
      :chartSpec="specEthnicity"
      :data="ethnicityData"
    />
  </Panel>
</template>

<script setup lang="ts">
import Panel from "primevue/panel";
import { specEthnicity } from "@/pages/reports/network/NetworkDiversityReport/charts/ethnicityChart/specEthnicity";
import { Chart } from "@/widgets/chart";
import { useStore } from "vuex";
import { computed } from "vue";

const store = useStore();

const ethnicityData = computed(() => {
  return store.getters.getData.ethnicityData;
});
</script>

<style scoped></style>
