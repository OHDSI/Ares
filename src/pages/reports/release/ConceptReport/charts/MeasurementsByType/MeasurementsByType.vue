<template>
  <Panel header="Measurements by Type">
    <template #icons>
      <ChartHeader table-toggle @table-toggled="toggleTable" />
    </template>
    <Chart
      id="viz-measurementsbytype"
      :chartSpec="specMeasurementsByType"
      :data="data"
    />
    <div v-if="showTable" class="p-4">
      <DataTable
        removable-sort
        size="small"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :value="data"
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column sortable header="Measurement type" field="CONCEPT_NAME">
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="Number of Records"
          field="COUNT_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.COUNT_VALUE
                  ? helpers.formatComma(slotProps.data.COUNT_VALUE)
                  : 0
              }}
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          :icon="mdiHelpCircle"
          tooltip="Learn about Measurement types."
          @iconClicked="helpers.openNewTab(links.getDocsLink('MEASUREMENT'))"
        />
        <ChartActionIcon
          v-if="sqlLink"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="helpers.openNewTab(sqlLink)"
        /></div
    ></template>
  </Panel>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import { specMeasurementsByType } from "./specMeasurementsByType";
import { useStore } from "vuex";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import { computed } from "vue";
import useChartControls from "@/shared/lib/composables/useChartControls";

const store = useStore();

const { showTable, toggleTable } = useChartControls();

const sqlLink = links.getSqlQueryLink(
  store.getters.getQueryIndex.MEASUREMENTS_BY_TYPE?.[0]
);

const data = computed(() => {
  return store.getters.getData.conceptData.MEASUREMENTS_BY_TYPE;
});
</script>

<style scoped></style>
