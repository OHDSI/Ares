<template>
  <Panel
    header="Measurement Value Distribution Table"
    v-if="store.getters.getData.table"
    elevation="10"
    class="ma-4"
  >
    <DataTable
      removable-sort
      size="small"
      paginator
      :value="props.data"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
    >
      <Column sortable header="Source" field="SOURCE"></Column>
      <Column sortable header="Unit" field="CATEGORY"></Column>
      <Column sortable header="Release" field="RELEASE"></Column>
      <Column sortable header="Count Value" field="UNIT_COUNT"></Column>
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
import { defineProps } from "vue";
import { DistributionType } from "@/processes/exploreReports/model/interfaces/reportTypes/DistributionType";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Panel from "primevue/panel";
const store = useStore();

interface Props {
  data: DistributionType[];
}

const props = defineProps<Props>();
</script>

<style scoped></style>
