<template>
  <Panel
    header="Historical Data Quality by Category"
    elevation="2"
    class="ma-4"
  >
    <template #icons>
      <ChartHeader
        title="Historical Data Quality by Category"
        :notes-count="notes.length"
        :annotations-count="annotations.length"
        @annotations-mode-toggled="toggleAnnotationsMode"
        @notes-mode-toggled="toggleNotesMode"
        table-toggle
        @table-toggled="toggleTable"
      />
    </template>
    <Chart
      :id="reportId"
      :data="data"
      :chartSpec="specDataQualityResultsByCategory"
      :annotations="annotations"
      :annotation-mode="annotationsMode"
      :annotations-config="{
        chartSpec: specDataQualityResultsByCategoryAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
    />
    <div v-if="showTable" class="p-4">
      <DataTable
        size="small"
        :value="data"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column field="cdm_release_date" header="Release Date">
          <template #body="slotProps">
            <router-link
              class="text-blue-400 hover:underline"
              :to="{
                name: 'dataQuality',
                query: { tab: 'overview' },
                params: {
                  cdm: route.params.cdm,
                  release: slotProps.data.cdm_release_date.replaceAll('-', ''),
                },
              }"
              :title="slotProps.data.cdm_release_date"
              >{{ slotProps.data.cdm_release_date }}
            </router-link>
          </template>
        </Column>
        <Column field="category" header="Check Category"> </Column>
        <Column field="dqd_execution_date" header="DQD execution date">
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="Checks Failed"
          field="count_value"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.count_value
                  ? helpers.formatComma(slotProps.data.count_value)
                  : "No data"
              }}
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
    <NotesPanel v-if="notesMode" :notes="notes" />
  </Panel>
</template>

<script setup lang="ts">
import { QUALITY_INDEX } from "@/shared/config/files";
import { Chart } from "@/widgets/chart";
import { specDataQualityResultsByCategory } from "./specDataQualityResultsByCategory";
import { useStore } from "vuex";
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import { specDataQualityResultsByCategoryAnnotation } from "@/pages/reports/source/DataQualityHistory/charts/HistoricalDataQualityByCategory/specDataQualityResultsByCategoryAnnotation";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import Panel from "primevue/panel";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import { helpers } from "@/shared/lib/mixins";
import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useChartControls from "@/shared/lib/composables/useChartControls";
import { useRoute } from "vue-router";

const store = useStore();

const route = useRoute();

const reportId = "viz-sourcedataqualityresultsbycategory";

const {
  notesMode,
  annotationsMode,
  toggleNotesMode,
  toggleAnnotationsMode,
  showTable,
  toggleTable,
} = useChartControls();

const { annotations, notes } = useAnnotations(reportId);

const data = computed(() => {
  return store.getters.getData[QUALITY_INDEX].dataQualityRecordsStratified;
});
</script>

<style scoped></style>
