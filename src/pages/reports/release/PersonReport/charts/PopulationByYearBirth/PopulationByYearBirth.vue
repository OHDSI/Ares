<template>
  <v-card :loading="!store.getters.getData" elevation="2" class="ma-4 pa-2">
    <ChartHeader
      title="Population by Year of Birth"
      :notes-count="annotations.length"
      @mode-toggled="toggleMode"
    />
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-birthyearnote"
      :chartSpec="specBirthYear"
      :annotations-config="{
        chartSpec: specBirthYearAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
      :data="store.getters.getData.personData.BIRTH_YEAR_DATA"
      :annotations="annotations"
      :annotation-mode="annotationsMode"
    >
    </Chart>
    <NotesPanel :notes="notes" />
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

const annotationsMode = ref(false);
function toggleMode(mode) {
  annotationsMode.value = mode;
}

import { computed } from "vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { ref } from "vue";

const store = useStore();

const annotations = computed(() => {
  const sourceName = store.getters.getSelectedSource.cdm_source_key;
  const releaseName = store.getters.getSelectedRelease.release_id;
  const sourceContainer = store.getters.getNotes[sourceName] || {};
  const releaseContainer = sourceContainer[releaseName] || {};
  return releaseContainer["viz-birthyearnote"] || [];
});

const notes = computed(() => {
  if (annotations.value.length) {
    return annotations.value.reduce((acc, val) => {
      return [
        ...acc,
        ...val.notes.map((note) => ({
          ...note,
          report: "viz-birthyearnote",
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
