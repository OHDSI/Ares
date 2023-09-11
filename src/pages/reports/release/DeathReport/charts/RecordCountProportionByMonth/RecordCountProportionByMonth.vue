<template>
  <v-card :loading="!store.getters.dataInStore" elevation="2" class="ma-4">
    <ChartHeader
      title="Record Count Proportion by Month"
      :notes-count="notes.length"
      :annotations-count="annotations.length"
      @annotations-mode-toggled="toggleAnnotationsMode"
      @notes-mode-toggled="toggleNotesMode"
    />
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-deathrecordproportionbymonth"
      width="90"
      :annotations="annotations"
      :signal-listener="listeners.setSelectionAreaSignal"
      :annotation-mode="annotationsMode"
      :annotations-config="{
        chartSpec: specRecordProportionByMonthAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
      :chartSpec="specRecordProportionByMonth"
      :data="store.getters.getData.PREVALENCE_BY_MONTH"
    />
    <NotesPanel v-if="notesMode" :notes="notes" />
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        icon="mdi-help-circle"
        tooltip="Proportion of people with at least one record per 1000 people."
      />
      <ChartActionIcon
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(
              store.getters.getQueryIndex[route.name.toUpperCase()]
                .PREVALENCE_BY_MONTH[0]
            )
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
import { useRoute } from "vue-router";
import { specRecordProportionByMonth } from "./specRecordProportionByMonth";
import * as listeners from "@/pages/model/lib/listeners";
import { specRecordProportionByMonthAnnotation } from "./specRecordProportionByMonthAnnotation";
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import _ from "lodash";
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

const reportId = "viz-deathrecordproportionbymonth";

const annotations = computed(() => {
  const { cdm, release, domain } = route.params;
  const path = [cdm, release, domain].filter(Boolean);
  const selections = _.get(store.getters.getNotes, path.join(".")) || {};
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
