<template>
  <v-card elevation="10" class="mx-auto pb-6">
    <Chart
      id="issues_releases"
      title="Data Quality Issues History"
      width="95"
      :notes="notes"
      :signal-listener="listeners.setSelectionAreaSignal"
      :context-menu-listener="listeners.showNotesEditDialogRightClick"
      :click-listener="listeners.setRectangleLocationClick"
      annotations
      :config="specIssuesByRelease"
      :annotations-config="specIssuesByReleaseAnnotation"
      :data="store.getters.getSelectedSource.releases"
    />
    <NotesPanel report="issues_releases" />
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="links.getSqlQueryLink(store.getters.getQueryIndex.CDM_SOURCE[0])"
      :divider="true"
    ></info-panel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import InfoPanel from "@/widgets/infoPanel";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { specIssuesByRelease } from "./specIssuesByRelease";
import { specIssuesByReleaseAnnotation } from "./specIssuesByReleaseAnnotation";
import * as listeners from "@/pages/model/lib/listeners";
import { computed } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";

const store = useStore();

const notes = computed(() => {
  const sourceName = store.getters.getSelectedSource.cdm_source_key;
  const sourceContainer = store.getters.getNotes[sourceName] || {};
  return sourceContainer["issues_releases"] || [];
});
</script>

<style scoped></style>
