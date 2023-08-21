<template>
  <v-card :loading="!store.getters.getData" elevation="10" class="ma-4 pa-2">
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-ageatfirstobservation"
      :chartSpec="specAgeAtFirstObservation"
      :annotations-config="{
        chartSpec: specAgeAtFirstObservationAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
      :notes="notes"
      :click-listener="listeners.setRectangleLocationClick"
      showAnnotations
      :data="
        store.getters.getData.observationPeriodData.AGE_AT_FIRST_OBSERVATION
      "
      title="Age at First Observation"
    />
    <NotesPanel report="viz-ageatfirstobservation" />
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex.OBSERVATION_PERIOD
            .AGE_AT_FIRST_OBSERVATION[0]
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
import { specAgeAtFirstObservation } from "./specAgeAtFirstObservation";
import { specAgeAtFirstObservationAnnotation } from "./specAgeAtFirstObservationAnnotation";
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
  return releaseContainer["viz-ageatfirstobservation"] || [];
});
</script>

<style scoped></style>
