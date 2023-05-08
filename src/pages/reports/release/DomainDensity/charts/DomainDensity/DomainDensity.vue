<template>
  <v-card
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-overview"
      width="80"
      title="Domain
      Density"
      :config="defOverview"
      :annotations-config="defOverviewAnnotation"
      :data="store.getters.getData.domainDensity"
      :click-listener="listeners.setRectangleLocationClick"
      :signal-listener="listeners.setSelectionAreaSignal"
      :context-menu-listener="listeners.showNotesEditDialogRightClick"
      :notes="notes"
      annotations
    />
    <NotesPanel report="viz-overview" />

    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex.DATA_DENSITY
            .DATADENSITY_RECORDS_PER_PERSON[0]
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
import { useStore } from "vuex";
import { defOverview } from "./defOverview";
import { defOverviewAnnotation } from "./defOverviewAnnotation";
import * as listeners from "@/pages/model/lib/listeners";
import { computed } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";

const store = useStore();
const notes = computed(() => {
  const sourceName = store.getters.getSelectedSource.cdm_source_key;
  const releaseName = store.getters.getSelectedRelease.release_id;
  const sourceContainer = store.getters.getNotes[sourceName] || {};
  const releaseContainer = sourceContainer[releaseName] || {};
  return releaseContainer["viz-overview"] || [];
});
</script>

<style scoped></style>
