<template>
  <Panel header="Ethnicity">
    <Echarts
      id="viz-network-ethnicity"
      :data="filteredData"
      :chart-spec="getEChartsEthnicity"
    />
  </Panel>
</template>

<script setup lang="ts">
import Panel from "primevue/panel";
import { useStore } from "vuex";
import { computed, ref } from "vue";
import Echarts from "@/widgets/echarts/Echarts.vue";
import getEChartsEthnicity from "@/pages/reports/network/NetworkDiversityReport/charts/ethnicityChart/ethnicity";

const store = useStore();
const selectedFilters = ref([]);

const data = computed(() => {
  return store.getters.getData.ethnicityData;
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
