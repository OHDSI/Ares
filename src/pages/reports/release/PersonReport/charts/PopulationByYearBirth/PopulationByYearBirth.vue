<template>
  <v-card :loading="!store.getters.getData" elevation="2" class="ma-4 pa-2">
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-birthyearnote"
      title="Population by Year of Birth"
      :config="specBirthYear"
      :annotations-config="specBirthYearAnnotation"
      :data="store.getters.getData.personData.BIRTH_YEAR_DATA"
      :signal-listener="listeners.setSelectionAreaSignal"
      :context-menu-listener="listeners.showNotesEditDialogRightClick"
      :click-listener="listeners.setRectangleLocationClick"
      :notes="notes"
      annotations
    >
    </Chart>
    <NotesPanel report="viz-birthyearnote" />
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex.PERSON.BIRTH_YEAR_DATA
        )
      "
      :divider="true"
    ></info-panel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { specBirthYear } from "./specBirthYear";
import { specBirthYearAnnotation } from "./specBirthYearAnnotation";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import InfoPanel from "@/widgets/infoPanel";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import * as listeners from "@/pages/model/lib/listeners";

import { computed } from "vue";

const store = useStore();

const notes = computed(() => {
  const sourceName = store.getters.getSelectedSource.cdm_source_key;
  const releaseName = store.getters.getSelectedRelease.release_id;
  const sourceContainer = store.getters.getNotes[sourceName] || {};
  const releaseContainer = sourceContainer[releaseName] || {};
  return releaseContainer["viz-birthyearnote"] || [];
});
</script>

<style scoped></style>
