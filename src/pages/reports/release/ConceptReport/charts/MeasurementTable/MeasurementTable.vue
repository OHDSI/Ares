<template>
  <Panel
    header="Measurement Value Distributions by Unit"
    v-if="store.getters.getData.measurementTable"
  >
    <DataTable
      removable-sort
      size="small"
      paginator
      :value="store.getters.getData.measurementTable"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
    >
      <template #empty> No concepts found </template>
      <Column sortable header="Unit ID" field="CATEGORY"></Column>
      <Column sortable header="Count value" field="UNIT_COUNT"></Column>
      <Column sortable header="Min Value" field="MIN_VALUE"></Column>
      <Column sortable header="P10 Value" field="P10_VALUE"></Column>
      <Column sortable header="P25 Value" field="P25_VALUE"></Column>
      <Column sortable header="Median Value" field="MEDIAN_VALUE"></Column>
      <Column sortable header="P75 Value" field="P75_VALUE"></Column>
      <Column sortable header="P90 Value" field="P90_VALUE"></Column>
      <Column sortable header="Max Value" field="MAX_VALUE"></Column>
    </DataTable>
  </Panel>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import Panel from "primevue/panel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

const store = useStore();
</script>

<style scoped></style>
