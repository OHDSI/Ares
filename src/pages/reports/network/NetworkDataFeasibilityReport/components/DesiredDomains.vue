<template>
  <v-container fluid>
    <v-data-table
      class="mb-4"
      density="compact"
      hide-default-footer
      disable-pagination
      :headers="getDomainHeaders"
      :items="getDomainsData"
    >
      <template v-slot:top>
        <v-select
          variant="outlined"
          density="compact"
          v-model="switchDomains"
          :items="items"
          chips
          label="Select domains"
          closable-chips
          multiple
          item-title="text"
          item-value="value"
          hide-selected
        ></v-select>
      </template>
      <template v-slot:item.condition_occurrence.data="{ item }">{{
        item.raw.condition_occurrence.data ? "Yes" : "No"
      }}</template>
      <template v-slot:item.drug_exposure.data="{ item }">{{
        item.raw.drug_exposure.data ? "Yes" : "No"
      }}</template>
      <template v-slot:item.device_exposure.data="{ item }">{{
        item.raw.device_exposure.data ? "Yes" : "No"
      }}</template>
      <template v-slot:item.measurement.data="{ item }">{{
        item.raw.measurement.data ? "Yes" : "No"
      }}</template>
      <template v-slot:item.death.data="{ item }">{{
        item.raw.death.data ? "Yes" : "No"
      }}</template>
      <template v-slot:item.procedure_occurrence.data="{ item }">{{
        item.raw.procedure_occurrence.data ? "Yes" : "No"
      }}</template>
      <template v-slot:item.observation_period.data="{ item }">{{
        item.raw.observation_period.data ? "Yes" : "No"
      }}</template>
    </v-data-table>
    <v-divider></v-divider>
    <v-alert
      color="message"
      density="compact"
      icon="mdi-help-rhombus"
      prominent
    >
      This section shows data availability for chosen domains.
    </v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { VDataTable } from "vuetify/labs/VDataTable";

import { computed, ref, watch, defineProps, defineEmits } from "vue";

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

const getDomainHeaders = computed(function () {
  return [
    {
      title: "Data Source",
      align: "start",
      sortable: false,
      key: "cdm_name",
      show: true,
    },
    {
      title: "Condition Occurrence",
      align: "start",
      sortable: false,
      key: "condition_occurrence.data",
      show: getDomainsData.value[0]?.condition_occurrence.show,
    },
    {
      title: "Drug Exposure",
      align: "start",
      sortable: false,
      key: "drug_exposure.data",
      show: getDomainsData.value[0]?.drug_exposure.show,
    },
    {
      title: "Device Exposure",
      align: "start",
      sortable: false,
      key: "device_exposure.data",
      show: getDomainsData.value[0]?.device_exposure.show,
    },
    {
      title: "Measurement",
      align: "start",
      sortable: false,
      key: "measurement.data",
      show: getDomainsData.value[0]?.measurement.show,
    },
    {
      title: "Death",
      align: "start",
      sortable: false,
      key: "death.data",
      show: getDomainsData.value[0]?.death.show,
    },
    {
      title: "Procedure Occurrence",
      align: "start",
      sortable: false,
      key: "procedure_occurrence.data",
      show: getDomainsData.value[0]?.procedure_occurrence.show,
    },
    {
      title: "Observation",
      align: "start",
      sortable: false,
      key: "observation_period.data",
      show: getDomainsData.value[0]?.observation_period.show,
    },
  ].filter((x) => x.show);
});

const domainMap = ref({
  condition_occurrence: "1000000",
  drug_exposure: "0100000",
  device_exposure: "0010000",
  measurement: "0001000",
  death: "0000100",
  procedure_occurrence: "0000010",
  observation_period: "0000001",
});

const switchDomains = ref([]);
const getDomainsData = computed(function () {
  if (switchDomains.value.length) {
    return props.data.map((value) => ({
      cdm_name: value.source,
      condition_occurrence: {
        data: value.data.filter(
          (bits) => domainMap.value.condition_occurrence === bits.DOMAIN_BITS
        )[0]?.COUNT_VALUE,

        show: switchDomains.value.includes("condition_occurrence"),
      },
      drug_exposure: {
        data: value.data.filter(
          (bits) => domainMap.value.drug_exposure === bits.DOMAIN_BITS
        )[0]?.COUNT_VALUE,

        show: switchDomains.value.includes("drug_exposure"),
      },
      device_exposure: {
        data: value.data.filter(
          (bits) => domainMap.value.device_exposure === bits.DOMAIN_BITS
        )[0]?.COUNT_VALUE,

        show: switchDomains.value.includes("device_exposure"),
      },
      measurement: {
        data: value.data.filter(
          (bits) => domainMap.value.measurement === bits.DOMAIN_BITS
        )[0]?.COUNT_VALUE,

        show: switchDomains.value.includes("measurement"),
      },
      death: {
        data: value.data.filter(
          (bits) => domainMap.value.death === bits.DOMAIN_BITS
        )[0]?.COUNT_VALUE,

        show: switchDomains.value.includes("death"),
      },
      procedure_occurrence: {
        data: value.data.filter(
          (bits) => domainMap.value.procedure_occurrence === bits.DOMAIN_BITS
        )[0]?.COUNT_VALUE,

        show: switchDomains.value.includes("procedure_occurrence"),
      },
      observation_period: {
        data: value.data.filter(
          (bits) => domainMap.value.observation_period === bits.DOMAIN_BITS
        )[0]?.COUNT_VALUE,

        show: switchDomains.value.includes("observation_period"),
      },
    }));
  } else {
    return [];
  }
});

const getDesiredDomainsOverview = computed(function () {
  if (switchDomains.value.length && getDomainsData.value.length) {
    return getDomainsData.value.map((value) => ({
      cdm_name: value.cdm_name,
      allDomainsPresent:
        Object.values(value).filter((domain) => domain.data && domain.show)
          .length === switchDomains.value.length,
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
