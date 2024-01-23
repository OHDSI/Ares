<template>
  <Panel header="Population by Year of Birth" :loading="!store.getters.getData">
    <template #icons>
      <ChartHeader
        title="Population by Year of Birth"
        :notes-count="notes.length"
        :annotations-count="annotations.length"
        @annotations-mode-toggled="toggleAnnotationsMode"
        @notes-mode-toggled="toggleNotesMode"
      />
    </template>
    <Chart
      v-if="store.getters.dataInStore"
      :id="reportId"
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
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import { mdiCodeBraces } from "@mdi/js";
import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useAnnotationControls from "@/shared/lib/composables/useAnnotationControls";

const store = useStore();

const reportId = "viz-birthyearnote";

const { notesMode, annotationsMode, toggleNotesMode, toggleAnnotationsMode } =
  useAnnotationControls();

const { annotations, notes } = useAnnotations(reportId);
</script>

<style scoped></style>
