<template>
  <v-card elevation="10" class="mx-auto pb-6">
    <ChartHeader
      title="Population History"
      :notes-count="annotations.length"
      @mode-toggled="toggleMode"
    />
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
    <NotesPanel :notes="notes" />
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
import { specPopulationByRelease } from "./specPopulationByRelease";
import { specPopulationByReleaseAnnotation } from "./specPopulationByReleaseAnnotation";
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import _ from "lodash";
import { useRoute } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";

const store = useStore();
const route = useRoute();

const annotationsMode = ref(false);
function toggleMode(mode) {
  annotationsMode.value = mode;
}

const reportId = "population_releases";

const annotations = computed(() => {
  const { cdm } = route.params;
  const path = [cdm].filter(Boolean);
  const selections = _.get(store.getters.getNotes, path.join(".")) || [];

  return selections[reportId] || [];
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

const releases = computed(() => {
  return store.getters.getSelectedSource.releases.map((value) => ({
    ...value,
    dateU: new Date(value.dqd_execution_date),
  }));
});
</script>

<style scoped></style>
