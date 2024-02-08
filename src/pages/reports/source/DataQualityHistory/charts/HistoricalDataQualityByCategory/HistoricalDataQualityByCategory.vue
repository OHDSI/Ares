<template>
  <Panel
    header="Historical Data Quality by Category"
    :loading="!store.getters.dataInStore"
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
      />
    </template>
    <Chart
      v-if="store.getters.dataInStore"
      :id="reportId"
      :data="store.getters.getData[QUALITY_INDEX].dataQualityRecordsStratified"
      :chartSpec="specDataQualityResultsByCategory"
      :annotations="annotations"
      :annotation-mode="annotationsMode"
      :annotations-config="{
        chartSpec: specDataQualityResultsByCategoryAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
    />
    <NotesPanel v-if="notesMode" :notes="notes" />
  </Panel>
</template>

<script setup lang="ts">
import { QUALITY_INDEX } from "@/shared/config/files";
import { Chart } from "@/widgets/chart";
import { specDataQualityResultsByCategory } from "./specDataQualityResultsByCategory";
import { useStore } from "vuex";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import { specDataQualityResultsByCategoryAnnotation } from "@/pages/reports/source/DataQualityHistory/charts/HistoricalDataQualityByCategory/specDataQualityResultsByCategoryAnnotation";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import Panel from "primevue/panel";
import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useAnnotationControls from "@/shared/lib/composables/useAnnotationControls";

const store = useStore();

const reportId = "viz-sourcedataqualityresultsbycategory";

const { notesMode, annotationsMode, toggleNotesMode, toggleAnnotationsMode } =
  useAnnotationControls();

const { annotations, notes } = useAnnotations(reportId);
</script>

<style scoped></style>
