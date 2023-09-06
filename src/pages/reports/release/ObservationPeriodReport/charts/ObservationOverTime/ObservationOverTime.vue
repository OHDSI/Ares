<template>
  <v-card :loading="!store.getters.getData" elevation="10" class="ma-4">
    <ChartHeader
      title="Observation over Time"
      :notes-count="annotations.length"
      @mode-toggled="toggleMode"
    />
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-observationbymonth"
      width="95"
      :annotations-config="{
        chartSpec: specObservationByMonthAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
      :annotations="annotations"
      :signal-listener="listeners.setSelectionAreaSignal"
      :annotation-mode="annotationsMode"
      :chartSpec="specObservationByMonth"
      :data="store.getters.getData.observationPeriodData.OBSERVED_BY_MONTH"
    />
    <NotesPanel :notes="notes" />

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
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";

const store = useStore();

const annotationsMode = ref(false);
function toggleMode(mode) {
  annotationsMode.value = mode;
}

const reportId = "viz-observationbymonth";

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
