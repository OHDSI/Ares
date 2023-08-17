<template>
  <v-card
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-sourcedataqualityresultsbydomain"
      title="Historical Data Quality by Domain"
      :chartSpec="specDataQualityResultsByDomain"
      :data="store.getters.getData[QUALITY_INDEX].dataQualityRecordsStratified"
      show-annotations
      :notes="notes"
      :annotations-config="{
        chartSpec: specDataQualityResultsByDomainAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
    />
    <NotesPanel report="viz-sourcedataqualityresultsbydomain" />
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { specDataQualityResultsByDomain } from "./specDataQualityResultsByDomain";
import { QUALITY_INDEX } from "@/shared/config/files";
import { useStore } from "vuex";
import { specDataQualityResultsByDomainAnnotation } from "@/pages/reports/source/DataQualityHistory/charts/HistoricalDataQualityByDomain/specDataQualityResultsByDomainAnnotation";
import { computed } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";

const store = useStore();
const notes = computed(() => {
  const sourceName = store.getters.getSelectedSource.cdm_source_key;
  const sourceContainer = store.getters.getNotes[sourceName] || {};
  return sourceContainer["viz-sourcedataqualityresultsbydomain"] || [];
});
</script>

<style scoped></style>
