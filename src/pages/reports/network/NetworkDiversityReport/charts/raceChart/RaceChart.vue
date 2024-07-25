<template>
  <Panel header="Race">
    <MultiSelect
      style="width: 100%"
      :options="filterOptions"
      v-model="selectedFilters"
      placeholder="Select filters"
      display="chip"
    />
    <Chart id="viz-race" :chartSpec="specRace" :data="filteredData" />
  </Panel>
</template>

<script setup lang="ts">
import Panel from "primevue/panel";
import { useStore } from "vuex";
import { specRace } from "@/pages/reports/network/NetworkDiversityReport/charts/raceChart/specRace";
import { Chart } from "@/widgets/chart";
import MultiSelect from "primevue/multiselect";
import { computed, ref } from "vue";
import { getValuesArray } from "@/shared/lib/mixins/methods/getValuesArray";

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

const filterOptions = computed(() => {
  return getValuesArray(data.value, "CONCEPT_NAME", true);
});
</script>

<style scoped></style>
