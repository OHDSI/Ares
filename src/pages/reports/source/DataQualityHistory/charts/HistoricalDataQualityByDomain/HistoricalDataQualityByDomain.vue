<template>
  <Panel
    header="Historical Data Quality by Domain"
    :loading="!store.getters.dataInStore"
    elevation="2"
    class="ma-4"
  >
    <template #icons>
      <ChartHeader
        title="Historical Data Quality by Domain"
        :notes-count="notes.length"
        :annotations-count="annotations.length"
        @annotations-mode-toggled="toggleAnnotationsMode"
        @notes-mode-toggled="toggleNotesMode"
      />
    </template>
    <Chart
      v-if="store.getters.dataInStore"
      :id="reportId"
      :chartSpec="specDataQualityResultsByDomain"
      :data="store.getters.getData[QUALITY_INDEX].dataQualityRecordsStratified"
      :annotation-mode="annotationsMode"
      :annotations="annotations"
      :annotations-config="{
        chartSpec: specDataQualityResultsByDomainAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
    />
    <NotesPanel v-if="notesMode" :notes="notes" />
  </Panel>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { specDataQualityResultsByDomain } from "./specDataQualityResultsByDomain";
import { QUALITY_INDEX } from "@/shared/config/files";
import { useStore } from "vuex";
import { specDataQualityResultsByDomainAnnotation } from "@/pages/reports/source/DataQualityHistory/charts/HistoricalDataQualityByDomain/specDataQualityResultsByDomainAnnotation";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import Panel from "primevue/panel";
import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useAnnotationControls from "@/shared/lib/composables/useAnnotationControls";

const store = useStore();

const reportId = "viz-sourcedataqualityresultsbydomain";

const { notesMode, annotationsMode, toggleNotesMode, toggleAnnotationsMode } =
  useAnnotationControls();

const { annotations, notes } = useAnnotations(reportId);
</script>

<style scoped></style>
