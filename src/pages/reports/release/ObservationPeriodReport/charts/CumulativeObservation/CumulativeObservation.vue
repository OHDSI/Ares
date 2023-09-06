<template>
  <v-card :loading="!store.getters.dataInStore" elevation="10" class="ma-4">
    <ChartHeader title="Cumulative Observation" :notes-count="annotations.length" @mode-toggled="toggleMode" />
    <Chart v-if="store.getters.dataInStore" :id="reportId" :chartSpec="specCumulativeObservation" :annotations-config="{
      chartSpec: specCumulativeObservationAnnotation,
      annotationsParentElement: 'g',
      brushParentElement: 'g g',
    }" :data="store.getters.getData.observationPeriodData.CUMULATIVE_DURATION" :annotations="annotations"
      :annotation-mode="annotationsMode" />
    <NotesPanel :notes="notes" />
    <info-panel v-if="store.getters.getQueryIndex" icon="mdi-code-braces" details="View export query."
      :link-details="true" :link="links.getSqlQueryLink(
        store.getters.getQueryIndex.OBSERVATION_PERIOD.CUMULATIVE_DURATION[0]
      )
        " :divider="true"></info-panel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import InfoPanel from "@/widgets/infoPanel";
import { links } from "@/shared/config/links";
import { specCumulativeObservation } from "./specCumulativeObservation";
import { specCumulativeObservationAnnotation } from "./specCumulativeObservationAnnotation";
import { useStore } from "vuex";
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";

const store = useStore();

const reportId = "viz-cumulativeobservation";

const annotationsMode = ref(false);
function toggleMode(mode) {
  annotationsMode.value = mode;
}

const annotations = computed(() => {
  const sourceName = store.getters.getSelectedSource?.cdm_source_key;
  const releaseName = store.getters.getSelectedRelease?.release_id;
  const sourceContainer = store.getters.getNotes[sourceName] || {};
  const releaseContainer = sourceContainer[releaseName] || {};
  return releaseContainer[reportId] || [];
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
