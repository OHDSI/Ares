<template>
  <Panel header="Population History">
    <template #icons>
      <ChartHeader
        title="Population History"
        :notes-count="notes.length"
        :annotations-count="annotations.length"
        @annotations-mode-toggled="toggleAnnotationsMode"
        @notes-mode-toggled="toggleNotesMode"
      />
    </template>
    <Chart
      :id="reportId"
      width="95"
      :annotations="annotations"
      :annotation-mode="annotationsMode"
      :chartSpec="specPopulationByRelease"
      :annotations-config="{
        chartSpec: specPopulationByReleaseAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
      :data="releases"
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
              links.getSqlQueryLink(store.getters.getQueryIndex.CDM_SOURCE[0])
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
import { useStore } from "vuex";
import { specPopulationByRelease } from "./specPopulationByRelease";
import { specPopulationByReleaseAnnotation } from "./specPopulationByReleaseAnnotation";
import { computed } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import Panel from "primevue/panel";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import { mdiCodeBraces } from "@mdi/js";
import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useAnnotationControls from "@/shared/lib/composables/useAnnotationControls";

const store = useStore();

const reportId = "population_releases";

const { notesMode, annotationsMode, toggleNotesMode, toggleAnnotationsMode } =
  useAnnotationControls();

const { annotations, notes } = useAnnotations(reportId);

const releases = computed(() => {
  return store.getters.getSelectedSource.releases.map((value) => ({
    ...value,
    dateU: new Date(value.dqd_execution_date),
  }));
});
</script>

<style scoped></style>
