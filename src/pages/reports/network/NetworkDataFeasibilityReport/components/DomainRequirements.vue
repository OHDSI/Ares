<template>
  <Panel header="Domain Requirements" toggleable fluid>
    <DataTable
      removable-sort
      size="small"
      :value="getDomainsData"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
    >
      <template #header>
        <MultiSelect
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

import { computed, ref, watch, defineProps, defineEmits, Ref } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Panel from "primevue/panel";
import MultiSelect from "primevue/multiselect";
import Divider from "primevue/divider";
import Message from "primevue/message";

interface Props {
  data: [];
}

const props = defineProps<Props>();

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

const getDomainsData = computed(() => {
  if (domainBits.value === "0000000") {
    return [];
  }

  return props.data.map(({ data, source }) => {
    const filteredData = data.filter(
      (d) => d.DOMAIN_BITS === domainBits.value
    )[0];
    return {
      cdm_name: source,
      percentage: filteredData?.PERCENT_VALUE,
      population: filteredData?.COUNT_VALUE,
    };
  });
});

const updateBits = function (): void {
  domainBits.value = items.value
    .map((item) => (switchDomains.value.includes(item.value) ? "1" : "0"))
    .join("");
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
