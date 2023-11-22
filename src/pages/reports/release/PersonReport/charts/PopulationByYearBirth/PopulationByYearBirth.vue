<template>
  <Panel header="Population by Year of Birth" :loading="!store.getters.getData">
    <template #icons>
      <ChartHeader
        title="Population by Year of Birth"
        :notes-count="notes.length"
        :annotations-count="annotations.length"
        @annotations-mode-toggled="toggleAnnotationMode"
        @notes-mode-toggled="toggleNoteMode"
      />
    </template>
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
    <NotesPanel v-if="notesMode" :notes="notes" />
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex.PERSON.BIRTH_YEAR_DATA
              )
            )
          "
        />
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { specBirthYear } from "./specBirthYear";
import { specBirthYearAnnotation } from "./specBirthYearAnnotation";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import Panel from "primevue/panel";
import { computed } from "vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { ref } from "vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import { mdiCodeBraces } from "@mdi/js";

const annotationsMode = ref(false);
const notesMode = ref(false);

function toggleAnnotationMode(mode) {
  annotationsMode.value = mode;
}

function toggleNoteMode(mode) {
  notesMode.value = mode;
}

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
