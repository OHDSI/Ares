<template>
  <v-card :loading="!store.getters.getData" elevation="2" class="ma-4">
    <ChartHeader
      title="Age at First Observation"
      :notes-count="notes.length"
      :annotations-count="annotations.length"
      @annotations-mode-toggled="toggleAnnotationsMode"
      @notes-mode-toggled="toggleNotesMode"
    />
    <Chart
      v-if="store.getters.dataInStore"
      :id="reportId"
      :chartSpec="specAgeAtFirstObservation"
      :annotations-config="{
        chartSpec: specAgeAtFirstObservationAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
      :annotations="annotations"
      :annotation-mode="annotationsMode"
      :data="
        store.getters.getData.observationPeriodData.AGE_AT_FIRST_OBSERVATION
      "
    />
    <NotesPanel v-if="notesMode" :notes="notes" />
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(
              store.getters.getQueryIndex.OBSERVATION_PERIOD
                .AGE_AT_FIRST_OBSERVATION[0]
            )
          )
        "
      />
    </v-toolbar>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import { specAgeAtFirstObservation } from "./specAgeAtFirstObservation";
import { specAgeAtFirstObservationAnnotation } from "./specAgeAtFirstObservationAnnotation";
import { useStore } from "vuex";
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";

const store = useStore();

const reportId = "viz-ageatfirstobservation";

const annotationsMode = ref(false);
const notesMode = ref(false);
function toggleAnnotationsMode(mode) {
  annotationsMode.value = mode;
}
function toggleNotesMode(mode) {
  notesMode.value = mode;
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
