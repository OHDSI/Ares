<template>
  <Panel header="Ethnicity">
    <MultiSelect
      style="width: 100%"
      :options="filterOptions"
      v-model="selectedFilters"
      placeholder="Select filters"
      display="chip"
    />
    <Chart
      id="viz-network-ethnicity"
      :chartSpec="specEthnicity"
      :data="filteredData"
    />
  </Panel>
</template>

<script setup lang="ts">
import Panel from "primevue/panel";
import { specEthnicity } from "@/pages/reports/network/NetworkDiversityReport/charts/ethnicityChart/specEthnicity";
import { Chart } from "@/widgets/chart";
import { useStore } from "vuex";
import { computed, ref } from "vue";
import { getValuesArray } from "@/shared/lib/mixins/methods/getValuesArray";
import MultiSelect from "primevue/multiselect";

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

const filterOptions = computed(() => {
  return getValuesArray(data.value, "CONCEPT_NAME", true);
});
</script>

<style scoped></style>
