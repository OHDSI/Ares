<template>
  <v-card
    v-if="!store.getErrors && store.getters.dataInStore"
    elevation="2"
    class="ma-4"
  >
    <ChartHeader
      title="Record Proportion by Month"
      :notes-count="notes.length"
      :annotations-count="annotations.length"
      @annotations-mode-toggled="toggleAnnotationsMode"
      @notes-mode-toggled="toggleNotesMode"
    />
    <Chart
      v-if="store.getters.getData"
      :id="reportId"
      :chartSpec="specRecordProportionByMonth"
      :data="store.getters.getData.conceptData"
      :annotations-config="{
        chartSpec: specRecordProportionByMonthAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
      width="95"
      :signal-listener="listeners.setSelectionAreaSignal"
      :annotations="annotations"
      :annotation-mode="annotationsMode"
    />
    <NotesPanel v-if="notesMode" :notes="notes" />
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(
              store.getters.getQueryIndex[route.params.domain.toUpperCase()]
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
import { specRecordProportionByMonthAnnotation } from "./specRecordProportionByMonthAnnotation";
import * as listeners from "@/pages/model/lib/listeners";
import { computed, ref } from "vue";
import _ from "lodash";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import { specDataQualityResultsAnnotation } from "@/pages/reports/source/DataQualityHistory/charts/HistoricalDataQuality/specDataQualityResultsAnnotation";
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

const reportId = "viz-sourcerecordproportionbymonth";

const annotations = computed(() => {
  const { cdm, domain, concept } = route.params;
  const path = [cdm, domain, concept].filter(Boolean);
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
