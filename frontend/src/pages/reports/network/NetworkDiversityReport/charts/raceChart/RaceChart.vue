<template>
  <Panel header="Race">
    <Echarts
      id="viz-race"
      :data="data"
      :chart-spec="getEChartsRace"
      :height="totalHeight"
    />
  </Panel>
</template>

<script setup lang="ts">
import Panel from "primevue/panel";
import { useStore } from "vuex";
import { computed } from "vue";
import Echarts from "@/widgets/echarts/Echarts.vue";
import getEChartsRace from "@/pages/reports/network/NetworkDiversityReport/charts/raceChart/race";
import { helpers } from "@/shared/lib/mixins";

const store = useStore();

const data = computed(() => {
  return store.getters.getData.raceData;
});

const trellis = helpers.getValuesArray(data.value, "DATA_SOURCE_KEY", true);

const facetCount = trellis.length;
const perFacetHeight = 50;
const minHeight = 200;

const totalHeight = `${Math.max(facetCount * perFacetHeight, minHeight)}px`;
</script>

<style scoped></style>
