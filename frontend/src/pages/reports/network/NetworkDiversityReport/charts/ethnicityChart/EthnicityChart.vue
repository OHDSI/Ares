<template>
  <Panel header="Ethnicity">
    <Echarts
      id="viz-network-ethnicity"
      :data="data"
      :chart-spec="getEChartsEthnicity"
      :height="totalHeight"
    />
  </Panel>
</template>

<script setup lang="ts">
import Panel from "primevue/panel";
import { useStore } from "vuex";
import { computed } from "vue";
import Echarts from "@/widgets/echarts/echarts";
import getEChartsEthnicity from "@/pages/reports/network/NetworkDiversityReport/charts/ethnicityChart/ethnicity";
import { getValuesArray } from "@/shared/lib/utils";

const store = useStore();

const data = computed(() => {
  return store.getters.getData.ethnicityData;
});

const trellis = getValuesArray(data.value, "DATA_SOURCE_KEY", true);

const facetCount = trellis.length;
const perFacetHeight = 50;
const minHeight = 200;

const totalHeight = `${Math.max(facetCount * perFacetHeight, minHeight)}px`;
</script>

<style scoped></style>
