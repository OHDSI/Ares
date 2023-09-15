<template>
  <v-card elevation="2" class="mx-auto pb-6">
    <ChartHeader
      title="Data Quality Issues History"
      :notes-count="notes.length"
      :annotations-count="annotations.length"
      @annotations-mode-toggled="toggleAnnotationsMode"
      @notes-mode-toggled="toggleNotesMode"
    />
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
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(store.getters.getQueryIndex.CDM_SOURCE[0])
          )
        "
      />
    </v-toolbar>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { specIssuesByRelease } from "./specIssuesByRelease";
import { specIssuesByReleaseAnnotation } from "./specIssuesByReleaseAnnotation";
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import _ from "lodash";
import { useRoute } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";

const store = useStore();
const route = useRoute();

const annotationsMode = ref(false);
const notesMode = ref(false);
function toggleAnnotationsMode(mode) {
  annotationsMode.value = mode;
}
function toggleNotesMode(mode) {
  notesMode.value = mode;
}

const reportId = "issues_releases";

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
</script>

<style scoped></style>
