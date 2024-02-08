<template>
  <Panel header="Age at First Observation">
    <template #icons>
      <ChartHeader
        title="Age at First Observation"
        :notes-count="notes.length"
        :annotations-count="annotations.length"
        @annotations-mode-toggled="toggleAnnotationsMode"
        @notes-mode-toggled="toggleNotesMode"
      />
    </template>

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
                  .AGE_AT_FIRST_OBSERVATION[0]
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
import { specAgeAtFirstObservation } from "./specAgeAtFirstObservation";
import { specAgeAtFirstObservationAnnotation } from "./specAgeAtFirstObservationAnnotation";
import { useStore } from "vuex";
import { ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";
import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useAnnotationControls from "@/shared/lib/composables/useAnnotationControls";

const store = useStore();

const reportId = "viz-ageatfirstobservation";

const { notesMode, annotationsMode, toggleNotesMode, toggleAnnotationsMode } =
  useAnnotationControls();

const { annotations, notes } = useAnnotations(reportId);
</script>

<style scoped></style>
