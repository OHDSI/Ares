<template>
  <v-card
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <ChartHeader
      title="Historical Data Quality by Domain"
      :notes-count="annotations.length"
      @mode-toggled="toggleMode"
    />
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
    <NotesPanel :notes="notes" />
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { specDataQualityResultsByDomain } from "./specDataQualityResultsByDomain";
import { QUALITY_INDEX } from "@/shared/config/files";
import { useStore } from "vuex";
import { specDataQualityResultsByDomainAnnotation } from "@/pages/reports/source/DataQualityHistory/charts/HistoricalDataQualityByDomain/specDataQualityResultsByDomainAnnotation";
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import _ from "lodash";
import { useRoute } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";

const store = useStore();
const route = useRoute();

const annotationsMode = ref(false);
function toggleMode(mode) {
  annotationsMode.value = mode;
}

const reportId = "viz-sourcedataqualityresultsbydomain";

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
