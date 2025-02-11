<template>
  <Panel
    header="Domain metadata"
    v-if="items.length"
    elevation="10"
    class="ma-4"
  >
    <DataTable
      :striped-rows="store.getters.getSettings.strippedRows"
      size="small"
      paginator
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      :value="items"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
    >
      <Column header="METADATA_CONCEPT_ID" field="METADATA_CONCEPT_ID"></Column>
      <Column header="NAME" field="NAME"></Column>
      <Column header="VALUE_AS_STRING" field="VALUE_AS_STRING"></Column>
      <Column header="VALUE_AS_CONCEPT_ID" field="VALUE_AS_CONCEPT_ID">
      </Column>
      <Column header="METADATA_DATE" field="METADATA_DATE"> </Column>
      <Column header="METADATA_DATETIME" field="METADATA_DATETIME"> </Column>
    </DataTable>
  </Panel>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import Panel from "primevue/panel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { useStore } from "vuex";

interface Props {
  data: [];
}

const props = defineProps<Props>();

const route = useRoute();

const store = useStore();

const items = computed(() => {
  if (props.data) {
    const domain = route.params.domain || route.name;
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
</script>

<style scoped></style>
