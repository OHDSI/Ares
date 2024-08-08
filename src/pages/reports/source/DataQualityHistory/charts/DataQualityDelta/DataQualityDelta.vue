<template>
  <Panel header="Data Quality Delta" elevation="2" class="ma-4">
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
      :chartSpec="specDataQualityDelta"
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
        <Column field="Release" header="Release"> </Column>
        <Column field="NEW" header="New"> </Column>
        <Column field="EXISTING" header="Existing"> </Column>
        <Column field="RESOLVED" header="Resolved"> </Column>
        <Column field="STABLE" header="Stable"> </Column>
      </DataTable>
    </div>
    <NotesPanel v-if="notesMode" :notes="notes" />
  </Panel>
</template>

<script setup lang="ts">
import { QUALITY_DELTA } from "@/shared/config/files";
import { Chart } from "@/widgets/chart";
import { specDataQualityDelta } from "./specDataQualityDelta";
import { useStore } from "vuex";
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import { specDataQualityResultsByCategoryAnnotation } from "@/pages/reports/source/DataQualityHistory/charts/HistoricalDataQualityByCategory/specDataQualityResultsByCategoryAnnotation";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import Panel from "primevue/panel";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useAnnotationControls from "@/shared/lib/composables/useAnnotationControls";

const store = useStore();

const reportId = "viz-sourcedataqualitydelta";

const { notesMode, annotationsMode, toggleNotesMode, toggleAnnotationsMode } =
  useAnnotationControls();

const { annotations, notes } = useAnnotations(reportId);

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}

const data = computed(() => {
  return store.getters.getData[QUALITY_DELTA] || [];
});
</script>

<style scoped></style>
