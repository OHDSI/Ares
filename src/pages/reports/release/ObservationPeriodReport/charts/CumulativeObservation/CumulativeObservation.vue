<template>
  <v-card
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-4"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-cumulativeobservation"
      :config="specCumulativeObservation"
      :annotations-config="specCumulativeObservationAnnotation"
      :data="store.getters.getData.observationPeriodData.CUMULATIVE_DURATION"
      :notes="notes"
      :signal-listener="listeners.setSelectionAreaSignal"
      :context-menu-listener="listeners.showNotesEditDialogRightClick"
      :click-listener="listeners.setRectangleLocationClick"
      title="Cumulative Observation"
      annotations
    />
    <NotesPanel report="viz-cumulativeobservation" />
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex.OBSERVATION_PERIOD.CUMULATIVE_DURATION[0]
        )
      "
      :divider="true"
    ></info-panel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import InfoPanel from "@/widgets/infoPanel";
import { links } from "@/shared/config/links";
import { specCumulativeObservation } from "./specCumulativeObservation";
import { specCumulativeObservationAnnotation } from "./specCumulativeObservationAnnotation";
import { useStore } from "vuex";
import { computed } from "vue";
import * as listeners from "@/pages/model/lib/listeners";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";

const store = useStore();

const notes = computed(() => {
  const sourceName = store.getters.getSelectedSource.cdm_source_key;
  const releaseName = store.getters.getSelectedRelease.release_id;
  const sourceContainer = store.getters.getNotes[sourceName] || {};
  const releaseContainer = sourceContainer[releaseName] || {};
  return releaseContainer["viz-cumulativeobservation"] || [];
});
</script>

<style scoped></style>
