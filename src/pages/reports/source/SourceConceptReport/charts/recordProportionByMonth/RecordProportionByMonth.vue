<template>
  <v-card
    v-if="!store.getErrors && store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <ChartHeader
      title="Record Proportion by Month"
      :notes-count="annotations.length"
      @mode-toggled="toggleMode"
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
    <NotesPanel :notes="notes" />
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex[route.params.domain.toUpperCase()]
            .PREVALENCE_BY_MONTH[0]
        )
      "
      :divider="true"
    ></info-panel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import InfoPanel from "@/widgets/infoPanel";
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

const store = useStore();
const route = useRoute();

const annotationsMode = ref(false);
function toggleMode(mode) {
  annotationsMode.value = mode;
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
