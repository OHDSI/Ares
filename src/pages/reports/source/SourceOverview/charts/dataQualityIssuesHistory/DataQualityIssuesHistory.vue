<template>
  <Panel header="Data Quality Issues History">
    <template #icons>
      <ChartHeader
        title="Data Quality Issues History"
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
      :chartSpec="specIssuesByRelease"
      :annotations-config="{
        chartSpec: specIssuesByReleaseAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
      :data="store.getters.getSelectedSource.releases"
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
import { specIssuesByRelease } from "./specIssuesByRelease";
import { specIssuesByReleaseAnnotation } from "./specIssuesByReleaseAnnotation";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";
import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useAnnotationControls from "@/shared/lib/composables/useAnnotationControls";

const store = useStore();

const reportId = "issues_releases";

const { notesMode, annotationsMode, toggleNotesMode, toggleAnnotationsMode } =
  useAnnotationControls();

const { annotations, notes } = useAnnotations(reportId);
</script>

<style scoped></style>
