<template>
  <Panel toggleable header="Desired Domains" fluid>
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
        ></MultiSelect
      ></template>
      <Column header="Data Source" field="cdm_name"></Column>
      <Column
        :hiden="!getDomainsData[0]?.condition_occurrence.show"
        sortable
        header="Condition Occurrence"
        field="condition_occurrence.data"
      >
        <template #body="slotProps">
          {{ slotProps.data.condition_occurrence.data ? "Yes" : "No" }}
        </template>
      </Column>
      <Column
        :hidden="!getDomainsData[0]?.drug_exposure.show"
        sortable
        header="Drug Exposure"
        field="drug_exposure.data"
      >
        <template #body="slotProps">
          {{ slotProps.data.drug_exposure.data ? "Yes" : "No" }}
        </template>
      </Column>
      <Column
        :hidden="!getDomainsData[0]?.device_exposure.show"
        header="Device Exposure"
        field="device_exposure.data"
      >
        <template #body="slotProps">
          {{ slotProps.data.device_exposure.data ? "Yes" : "No" }}
        </template>
      </Column>
      <Column
        :hidden="!getDomainsData[0]?.measurement.show"
        header="Measurement"
        field="measurement.data"
      >
        <template #body="slotProps">
          {{ slotProps.data.measurement.data ? "Yes" : "No" }}
        </template>
      </Column>
      <Column
        :hidden="!getDomainsData[0]?.death.show"
        header="Death"
        field="death.data"
      >
        <template #body="slotProps">
          {{ slotProps.data.death.data ? "Yes" : "No" }}
        </template>
      </Column>
      <Column
        :hidden="!getDomainsData[0]?.procedure_occurrence.show"
        header="Procedure Occurrence"
        field="procedure_occurrence.data"
      >
        <template #body="slotProps">
          {{ slotProps.data.procedure_occurrence.data ? "Yes" : "No" }}
        </template>
      </Column>
      <Column
        :hidden="!getDomainsData[0]?.observation_period.show"
        header="Observation"
        field="observation_period.data"
      >
        <template #body="slotProps">
          {{ slotProps.data.observation_period.data ? "Yes" : "No" }}
        </template>
      </Column>
    </DataTable>

    <Divider></Divider>
    <Message :closable="false" severity="info">
      This section shows data availability for chosen domains.
    </Message>
  </Panel>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Message from "primevue/message";
import Panel from "primevue/panel";
import Divider from "primevue/divider";
import MultiSelect from "primevue/multiselect";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

interface Props {
  data: [];
}

const props = defineProps<Props>();

const items = ref([
  { value: "condition_occurrence", text: "Condition occurrence" },
  { value: "drug_exposure", text: "Drug exposure" },
  { value: "device_exposure", text: "Device exposure" },
  { value: "measurement", text: "Measurement" },
  { value: "death", text: "Death" },
  { value: "procedure_occurrence", text: "Procedure occurrence" },
  { value: "observation_period", text: "Observation" },
]);

const domainMap = {
  condition_occurrence: "1000000",
  drug_exposure: "0100000",
  device_exposure: "0010000",
  measurement: "0001000",
  death: "0000100",
  procedure_occurrence: "0000010",
  observation_period: "0000001",
};

const switchDomains = ref([]);

const getDomainData = (domainKey, valueData) => {
  return {
    data: valueData.filter(
      (bits) => domainMap[domainKey] === bits.DOMAIN_BITS
    )[0]?.COUNT_VALUE,
    show: switchDomains.value.includes(domainKey),
  };
};

const getDomainsData = computed(function () {
  if (switchDomains.value.length) {
    return props.data.map((value) => ({
      cdm_name: value.source,
      condition_occurrence: getDomainData("condition_occurrence", value.data),
      drug_exposure: getDomainData("drug_exposure", value.data),
      device_exposure: getDomainData("device_exposure", value.data),
      measurement: getDomainData("measurement", value.data),
      death: getDomainData("death", value.data),
      procedure_occurrence: getDomainData("procedure_occurrence", value.data),
      observation_period: getDomainData("observation_period", value.data),
    }));
  } else {
    return [];
  }
});

const isAllDomainsPresent = (value) => {
  return (
    Object.values(value).filter((domain) => domain.data && domain.show)
      .length === switchDomains.value.length
  );
};

const getDesiredDomainsOverview = computed(() => {
  if (switchDomains.value.length && getDomainsData.value.length) {
    return getDomainsData.value.map((value) => ({
      cdm_name: value.cdm_name,
      allDomainsPresent: isAllDomainsPresent(value),
    }));
  } else {
    return [];
  }
});

const emit = defineEmits(["desiredDomainsDataChanged"]);

watch(getDesiredDomainsOverview, () => {
  emit("desiredDomainsDataChanged", getDesiredDomainsOverview.value);
});
</script>

<script lang="ts">
export default {
  name: "DesiredDomains",
};
</script>

<style scoped></style>
