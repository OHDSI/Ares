<template>
  <Panel header="Cumulative Observation">
    <template #icons>
      <ChartHeader
        title="Cumulative Observation"
        :notes-count="notes.length"
        :annotations-count="annotations.length"
        @annotations-mode-toggled="toggleAnnotationsMode"
        @notes-mode-toggled="toggleNotesMode"
      />
    </template>
    <Chart
      v-if="store.getters.dataInStore"
      :id="reportId"
      :chartSpec="specCumulativeObservation"
      :annotations-config="{
        chartSpec: specCumulativeObservationAnnotation,
        annotationsParentElement: 'g',

        brushParentElement: 'g g',
      }"
      :data="store.getters.getData.observationPeriodData.CUMULATIVE_DURATION"
      :annotations="annotations"
      :annotation-mode="annotationsMode"
    />
    <NotesPanel v-if="notesMode" :notes="notes" />
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex.OBSERVATION_PERIOD
                  .CUMULATIVE_DURATION[0]
              )
            )
          "
        />
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";

import { links } from "@/shared/config/links";
import { specCumulativeObservation } from "./specCumulativeObservation";
import { specCumulativeObservationAnnotation } from "./specCumulativeObservationAnnotation";
import { useStore } from "vuex";
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";

const store = useStore();

const reportId = "viz-cumulativeobservation";

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
