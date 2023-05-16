<template>
  <v-card
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-recordsperperson"
      width="80"
      title="Domain Records per Person"
      :config="defRecordsPerPerson"
      :annotations-config="defRecordsPerPersonAnnotation"
      :data="store.getters.getData.domainRecords"
      :click-listener="listeners.setRectangleLocationClick"
      :signal-listener="listeners.setSelectionAreaSignal"
      :context-menu-listener="listeners.showNotesEditDialogRightClick"
      :notes="notes"
      annotations
    />
    <NotesPanel report="viz-recordsperperson" />

    <InfoPanel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex.DATA_DENSITY.DATADENSITY_TOTAL[0]
        )
      "
      :divider="true"
    ></InfoPanel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import InfoPanel from "@/widgets/infoPanel";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { defRecordsPerPerson } from "./defRecordsPerPerson";
import { defRecordsPerPersonAnnotation } from "./defRecordsPerPersonAnnotation";
import { computed } from "vue";
import * as listeners from "@/pages/model/lib/listeners";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";

const store = useStore();

const notes = computed(() => {
  const sourceName = store.getters.getSelectedSource.cdm_source_key;
  const releaseName = store.getters.getSelectedRelease.release_id;
  const sourceContainer = store.getters.getNotes[sourceName] || {};
  const releaseContainer = sourceContainer[releaseName] || {};
  return releaseContainer["viz-recordsperperson"] || [];
});
</script>

<style scoped></style>
