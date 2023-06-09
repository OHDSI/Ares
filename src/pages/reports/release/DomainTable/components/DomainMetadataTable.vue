<template>
  <v-card v-if="items.length" elevation="10" class="ma-4 pa-2">
    <v-card-title>Domain metadata</v-card-title>
    <v-data-table :headers="headers" :items="items"></v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { VDataTable } from "vuetify/labs/VDataTable";

import { useStore } from "vuex";
import { computed, ref, Ref, defineProps } from "vue";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";
import { useRoute } from "vue-router";

interface Props {
  data: [];
}

const props = defineProps<Props>();

const store = useStore();
const route = useRoute();

const items = computed(() => {
  console.log(route);
  console.log(props.data);

  if (props.data) {
    const domain = route.params.domain || route.name;
    console.log(domain);
    return props.data.filter((row) => {
      return row.NAME === domainMap[domain as string];
    });
  } else {
    return [];
  }
});

const domainMap = {
  condition_occurrence: "CONDITION OCCURRENCE",
  condition_era: "CONDITION ERA",
  drug_exposure: "DRUG EXPOSURE",
  drug_era: "DRUG ERA",
  visit_occurrence: "VISIT OCCURRENCE",
  visit_detail: "VISIT DETAIL",
  measurement: "MEASUREMENT",
  observation: "OBSERVATION",
  procedure_occurrence: "PROCEDURE OCCURRENCE",
  device_exposure: "DEVICE EXPOSURE",
  person: "PERSON",
  observationPeriod: "OBSERVATION PERIOD",
};

const headers: Ref<DataTableHeader[]> = ref([
  {
    title: "METADATA_CONCEPT_ID",
    sortable: true,
    key: "METADATA_CONCEPT_ID",
    align: "start",
  },
  {
    title: "NAME",
    sortable: true,
    key: "NAME",
    align: "start",
  },
  {
    title: "VALUE_AS_STRING",
    sortable: true,
    key: "VALUE_AS_STRING",
    align: "start",
  },
  {
    title: "VALUE_AS_CONCEPT_ID",
    sortable: true,
    key: "VALUE_AS_CONCEPT_ID",
    align: "start",
  },
  {
    title: "METADATA_DATE",
    sortable: true,
    key: "METADATA_DATE",
    align: "start",
  },
  {
    title: "METADATA_DATETIME",
    sortable: true,
    key: "METADATA_DATETIME",
    align: "start",
  },
]);
</script>

<style scoped></style>
