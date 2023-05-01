<template>
  <v-card :loading="!store.getters.getData" elevation="10" class="ma-4 pa-2">
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-observationbymonth"
      width="90"
      :annotations-config="specObservationByMonthAnnotation"
      :notes="notes"
      :signal-listener="listeners.setSelectionAreaSignal"
      :context-menu-listener="listeners.showNotesEditDialogRightClick"
      :click-listener="listeners.setRectangleLocationClick"
      annotations
      :config="specObservationByMonth"
      :data="store.getters.getData.observationPeriodData.OBSERVED_BY_MONTH"
      title="Observation over Time"
    />
    <NotesPanel report="viz-observationbymonth" />

    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex.OBSERVATION_PERIOD.OBSERVED_BY_MONTH[0]
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
import { specObservationByMonth } from "./specObservationByMonth";
import { specObservationByMonthAnnotation } from "./specObservationByMonthAnnotation";
import { useStore } from "vuex";
import * as listeners from "@/pages/model/lib/listeners";
import { computed } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";

const store = useStore();

const notes = computed(() => {
  const sourceName = store.getters.getSelectedSource.cdm_source_key;
  const releaseName = store.getters.getSelectedRelease.release_id;
  const sourceContainer = store.getters.getNotes[sourceName] || {};
  const releaseContainer = sourceContainer[releaseName] || {};
  return releaseContainer["viz-observationbymonth"] || [];
});
</script>

<style scoped></style>
