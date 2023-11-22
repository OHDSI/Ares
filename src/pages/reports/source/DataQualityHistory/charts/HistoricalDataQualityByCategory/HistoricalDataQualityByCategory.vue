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
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import { specDataQualityResultsByCategoryAnnotation } from "@/pages/reports/source/DataQualityHistory/charts/HistoricalDataQualityByCategory/specDataQualityResultsByCategoryAnnotation";
import _ from "lodash";
import { useRoute } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import Panel from "primevue/panel";

const store = useStore();
const route = useRoute();
const annotationsMode = ref(false);
const notesMode = ref(false);
function toggleAnnotationsMode(mode) {
  annotationsMode.value = mode;
}
function toggleNotesMode(mode) {
  notesMode.value = mode;
}

const reportId = "viz-sourcedataqualityresultsbycategory";

const annotations = computed(() => {
  const { cdm, release } = route.params;
  const path = [cdm, release].filter(Boolean);
  const selections = _.get(store.getters.getNotes, path.join(".")) || {};
  return selections[reportId] || [];
});

const notes = computed(() => {
  if (annotations.value.length) {
    return annotations.value.reduce((acc, val) => {
      return [
        ...acc,
        ...val.notes.map((note) => ({
          ...note,
          report: reportId,
          selection: val.id,
        })),
      ];
    }, []);
  } else {
    return [];
  }
});
</script>

<style scoped></style>
