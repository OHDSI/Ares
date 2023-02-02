<template>
  <v-container fluid>
    <v-data-table
      class="mb-4"
      density="compact"
      :hide-default-footer="true"
      :disable-pagination="true"
      :headers="domainHeaders"
      :items="getDomainsData"
    >
      <template v-slot:top>
        <v-select
          v-model="switchDomains"
          :items="items"
          chips
          variant="outlined"
          item-value="value"
          item-title="text"
          label="Select domains"
          closable-chips
          multiple
          hide-selected
          @update:modelValue="updateBits"
        ></v-select>
      </template>
      <template v-slot:item.percentage="{ item }">{{
        (item.raw.percentage * 100).toFixed(2)
      }}</template>
      <template v-slot:item.population="{ item }">{{
        formatComma(item.raw.population)
      }}</template>
    </v-data-table>
    <v-divider></v-divider>
    <v-alert
      color="message"
      density="compact"
      icon="mdi-help-rhombus"
      prominent
    >
      This section uses pre-calculated data to display % of overlapping values
    </v-alert>
  </v-container>
</template>

<script setup lang="ts">
import * as d3Format from "d3-format";
import { VDataTable } from "vuetify/labs/VDataTable";

import { computed, ref, watch, defineProps, defineEmits, Ref } from "vue";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";

interface Props {
  data: [];
}

const props = defineProps<Props>();

const formatComma = function (value) {
  return d3Format.format(",")(value);
};

const switchDomains = ref([]);
const domainHeaders: Ref<DataTableHeader[]> = ref([
  {
    title: "Data Source",
    align: "start",
    sortable: false,
    key: "cdm_name",
  },
  {
    title: "Person Count",
    key: "population",
    align: "end",
  },
  {
    title: "%",
    key: "percentage",
    align: "end",
  },
]);
const items = ref([
  { value: "condition_occurrence", text: "Condition occurrence" },
  { value: "drug_exposure", text: "Drug exposure" },
  { value: "device_exposure", text: "Device exposure" },
  { value: "measurement", text: "Measurement" },
  { value: "death", text: "Death" },
  { value: "procedure_occurrence", text: "Procedure occurrence" },
  { value: "observation", text: "Observation" },
]);

const domainBits: Ref<string> = ref("0000000");

const getDomainsData = computed(function () {
  if (domainBits.value === "0000000") {
    return [];
  } else {
    return props.data.map((value) => {
      const data = value.data.filter((d) => d.DOMAIN_BITS === domainBits.value);
      return {
        cdm_name: value.source,
        percentage: data[0]?.PERCENT_VALUE,
        population: data[0]?.COUNT_VALUE,
      };
    });
  }
});

const updateBits = function (): void {
  domainBits.value = "";
  domainBits.value = domainBits.value.concat(
    switchDomains.value.includes("condition_occurrence") ? "1" : "0",
    switchDomains.value.includes("drug_exposure") ? "1" : "0",
    switchDomains.value.includes("device_exposure") ? "1" : "0",
    switchDomains.value.includes("measurement") ? "1" : "0",
    switchDomains.value.includes("death") ? "1" : "0",
    switchDomains.value.includes("procedure_occurrence") ? "1" : "0",
    switchDomains.value.includes("observation") ? "1" : "0"
  );
};

const emit = defineEmits(["domainsDataChanged"]);

watch(getDomainsData, () => {
  emit("domainsDataChanged", getDomainsData.value);
});
</script>
<script lang="ts">
export default {
  name: "DomainRequirements",
};
</script>

<style scoped></style>
