<template>
  <Panel header="Time Distribution" v-if="props.data">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <div>
      <h3 class="font-light">{{ priorToIndex[0]?.covariate_name }}</h3>
      <Echarts
        id="viz-beforeIndex"
        height="150px"
        :data="priorToIndex"
        :chart-spec="getEChartsCohortTimeDistribution"
      />
      <h3 class="font-light">{{ afterIndex[0]?.covariate_name }}</h3>
      <Echarts
        id="viz-afterIndex"
        height="150px"
        :data="afterIndex"
        :chart-spec="getEChartsCohortTimeDistribution"
      />
      <h3 class="font-light">{{ betweenStartEnd[0]?.covariate_name }}</h3>
      <Echarts
        id="viz-between"
        height="150px"
        :data="betweenStartEnd"
        :chart-spec="getEChartsCohortTimeDistribution"
      />
    </div>

    <div v-if="showTable" class="p-4">
      <DataTable
        :striped-rows="store.getters.getSettings.strippedRows"
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

import { useStore } from "vuex";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import Panel from "primevue/panel";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import { computed, ref } from "vue";
import getEChartsCohortTimeDistribution from "@/pages/reports/release/CohortsTable/components/CohortDrilldownReport/reports/timeDistribution/timeDistribution";
import Echarts from "@/widgets/echarts/Echarts.vue";

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
