<template>
  <Panel header="Time Distribution" v-if="props.data">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Chart
      id="viz-beforeIndex"
      :chartSpec="specCohortTimeDistribution"
      :data="priorToIndex"
      title="observation time (days) prior to index"
    />
    <Chart
      id="viz-afterIndex"
      :chartSpec="specCohortTimeDistribution"
      :data="afterIndex"
      title="observation time (days) after index"
    />
    <Chart
      id="viz-between"
      :chartSpec="specCohortTimeDistribution"
      :data="betweenStartEnd"
      title="time (days) between cohort start and end"
    />
    <div v-if="showTable" class="p-4">
      <DataTable
        removable-sort
        size="small"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :value="props.data"
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column sortable header="Time Measure" field="covariate_name"> </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="Average"
          field="mean"
        >
          <template #body="slotProps">
            {{
              slotProps.data.mean
                ? parseFloat(slotProps.data.mean).toFixed(2)
                : "No data"
            }}
          </template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="Sd"
          field="sd"
        >
          <template #body="slotProps">
            {{
              slotProps.data.sd
                ? parseFloat(slotProps.data.sd).toFixed(2)
                : "No data"
            }}
          </template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="MIN_VALUE"
          field="min_value"
        >
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="P10_VALUE"
          field="p_10_value"
        >
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="P25_VALUE"
          field="p_25_value"
        >
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="MEDIAN_VALUE"
          field="median_value"
        >
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="P75_VALUE"
          field="p_75_value"
        >
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="P90_VALUE"
          field="p_90_value"
        >
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="MAX_VALUE"
          field="max_value"
        >
        </Column>
      </DataTable>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";

import { specCohortTimeDistribution } from "./specCohortTimeDistribution";
import { useStore } from "vuex";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import Panel from "primevue/panel";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import { computed, ref, defineProps } from "vue";

interface Props {
  data: [];
}

const priorToIndex = computed(() => {
  return props.data.filter(
    (val) => val.covariate_name === "observation time (days) prior to index"
  );
});

const afterIndex = computed(() => {
  return props.data.filter(
    (val) => val.covariate_name === "observation time (days) after index"
  );
});

const betweenStartEnd = computed(() => {
  return props.data.filter(
    (val) => val.covariate_name === "time (days) between cohort start and end"
  );
});

const props = defineProps<Props>();

const store = useStore();

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}
</script>

<style scoped></style>
