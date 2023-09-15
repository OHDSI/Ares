<template>
  <v-card :loading="!store.getters.getData" elevation="2" class="ma-4">
    <ChartHeader
      title="Population by Age &amp; Sex"
      :notes-count="notesMaleFemale.length"
      :annotations-count="notesFemale.length + notesMale.length"
      @annotations-mode-toggled="toggleAnnotationMode"
      @notes-mode-toggled="toggleNoteMode"
    />
    <Chart
      v-if="store.getters.dataInStore"
      :id="maleReportId"
      title="Male"
      :annotations-config="{
        chartSpec: specAgeSex,

        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
      :data="store.getters.getData.maleAgeSex"
      :chartSpec="specAgeSex"
      :annotations="notesMale"
      :annotation-mode="annotationsMode"
    />
    <Chart
      v-if="store.getters.dataInStore"
      :id="femaleReportId"
      title="Female"
      :annotations-config="{
        chartSpec: specAgeSex,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
      :data="store.getters.getData.femaleAgeSex"
      :chartSpec="specAgeSex"
      :annotations="notesFemale"
      :annotation-mode="annotationsMode"
    />
    <NotesPanel v-if="notesMode" :notes="notesMaleFemale" />
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(
              store.getters.getQueryIndex.PERSON.AGE_GENDER_DATA
            )
          )
        "
      />
    </v-toolbar>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { specAgeSex } from "./specAgeSex";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import { helpers } from "@/shared/lib/mixins";

const annotationsMode = ref(false);
const notesMode = ref(false);

function toggleAnnotationMode(mode) {
  annotationsMode.value = mode;
}
function toggleNoteMode(mode) {
  notesMode.value = mode;
}

const store = useStore();
const releaseContainer = computed(() => {
  const sourceName = store.getters.getSelectedSource.cdm_source_key;
  const releaseName = store.getters.getSelectedRelease.release_id;
  const sourceContainer = store.getters.getNotes[sourceName] || {};
  return sourceContainer[releaseName] || {};
});

const femaleReportId = "viz-populationbyageandsexFemale";
const maleReportId = "viz-populationbyageandsexMale";

const notesFemale = computed(() => {
  return releaseContainer.value[femaleReportId] || [];
});
const notesMale = computed(() => {
  return releaseContainer.value[maleReportId] || [];
});

const notesMaleFemale = computed(() => {
  return [
    ...notesFemale.value.reduce((acc, val) => {
      return [
        ...acc,
        ...val.notes.map((note) => ({
          ...note,
          report: femaleReportId,
          selection: val.id,
        })),
      ];
    }, []),
    ...notesMale.value.reduce((acc, val) => {
      return [
        ...acc,
        ...val.notes.map((note) => ({
          ...note,
          report: maleReportId,
          selection: val.id,
        })),
      ];
    }, []),
  ];
});
</script>

<style scoped></style>
