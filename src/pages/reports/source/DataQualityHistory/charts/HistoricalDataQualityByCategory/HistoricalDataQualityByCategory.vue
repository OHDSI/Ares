<template>
  <v-card
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-sourcedataqualityresultsbycategory"
      title="Historical Data Quality by Category"
      :data="store.getters.getData[QUALITY_INDEX].dataQualityRecordsStratified"
      :chartSpec="specDataQualityResultsByCategory"
      :notes="notes"
      show-annotations
      :annotations-config="{
        chartSpec: specDataQualityResultsByCategoryAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
    />
    <NotesPanel report="viz-sourcedataqualityresultsbycategory" />
  </v-card>
</template>

<script setup lang="ts">
import { QUALITY_INDEX } from "@/shared/config/files";
import { Chart } from "@/widgets/chart";
import { specDataQualityResultsByCategory } from "./specDataQualityResultsByCategory";
import { useStore } from "vuex";
import { computed } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import { specDataQualityResultsByCategoryAnnotation } from "@/pages/reports/source/DataQualityHistory/charts/HistoricalDataQualityByCategory/specDataQualityResultsByCategoryAnnotation";

const store = useStore();
const notes = computed(() => {
  const sourceName = store.getters.getSelectedSource.cdm_source_key;
  const sourceContainer = store.getters.getNotes[sourceName] || {};
  return sourceContainer["viz-sourcedataqualityresultsbycategory"] || [];
});
</script>

<style scoped></style>
