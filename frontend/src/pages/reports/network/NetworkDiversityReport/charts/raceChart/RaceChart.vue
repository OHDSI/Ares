<template>
  <Panel header="Race">
    <Echarts id="viz-race" :data="filteredData" :chart-spec="getEChartsRace" />
  </Panel>
</template>

<script setup lang="ts">
import Panel from "primevue/panel";
import { useStore } from "vuex";
import { computed, ref } from "vue";
import Echarts from "@/widgets/echarts/Echarts.vue";
import getEChartsRace from "@/pages/reports/network/NetworkDiversityReport/charts/raceChart/race";

const store = useStore();

const selectedFilters = ref([]);

const data = computed(() => {
  return store.getters.getData.raceData;
});

const filteredData = computed(() => {
  if (selectedFilters.value.length) {
    return data.value.filter((val) =>
      selectedFilters.value.includes(val.CONCEPT_NAME)
    );
  } else {
    return data.value;
  }
});
</script>

<style scoped></style>
