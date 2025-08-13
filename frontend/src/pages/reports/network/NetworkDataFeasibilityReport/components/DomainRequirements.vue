<template>
  <Panel header="Domain Requirements" toggleable fluid>
    <DataTable
      :striped-rows="store.getters.getSettings.strippedRows"
      removable-sort
      size="small"
      :value="getDomainsData"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
    >
      <template #header>
        <MultiSelect
          style="width: 100%"
          v-model="switchDomains"
          :options="items"
          display="chip"
          option-value="value"
          option-label="text"
          placeholder="Select domains"
          @update:modelValue="updateBits"
        ></MultiSelect
      ></template>
      <Column header="Data Source" field="cdm_name"></Column>
      <Column sortable header="Person Count" field="population">
        <template #body="slotProps">
          {{ formatComma(slotProps.data.population) }}
        </template>
      </Column>
      <Column sortable header="%" field="percentage">
        <template #body="slotProps">
          {{ (slotProps.data.percentage * 100).toFixed(2) }}
        </template>
      </Column>
    </DataTable>
    <Divider />
    <Message :closable="false" severity="info">
      This section uses pre-calculated data to display % of overlapping values
    </Message>
  </Panel>
</template>

<script setup lang="ts">
import * as d3Format from "d3-format";

import { computed, ref, watch, Ref } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Panel from "primevue/panel";
import MultiSelect from "primevue/multiselect";
import Divider from "primevue/divider";
import Message from "primevue/message";
import { useStore } from "vuex";

interface Props {
  data: [];
}

const props = defineProps<Props>();

const store = useStore();

const formatComma = function (value) {
  return d3Format.format(",")(value);
};

const switchDomains = ref([]);
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
