<template>
  <v-card
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <ChartHeader
      title="Record Count Proportion by Month"
      :notes-count="annotations.length"
      @mode-toggled="toggleMode"
    />
    <Chart
      v-if="store.getters.dataInStore"
      :id="reportId"
      width="99"
      :chartSpec="specRecordProportionByMonth"
      :annotations-config="{
        chartSpec: specRecordProportionByMonthAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g ',
      }"
      :data="store.getters.getData.conceptData.PREVALENCE_BY_MONTH"
      :signal-listener="listeners.setSelectionAreaSignal"
      :annotations="annotations"
      :annotation-mode="annotationsMode"
    />
    <NotesPanel :notes="notes" />
    <info-panel
      details="Proportion of people with at least one record per 1000 people."
    ></info-panel>
    <info-panel
      v-if="store.getters.getData.isNotStationary"
      icon="mdi-clock-alert"
      details="This time series has been deemed non-stationary by temporal characterization."
      divider
    ></info-panel>
    <info-panel
      v-if="store.getters.getData.seasonalityScore"
      icon="mdi-clock-alert"
      :details="store.getters.getData.seasonalityComment"
      divider
      :link="links.getCastorLink()"
    ></info-panel>
    <info-panel
      icon="mdi-database-clock"
      divider
      link-details
      :route-link="getSourceConceptReportLink()"
      details="Review this Time-Series across data source releases."
    ></info-panel>
    <info-panel
      v-if="store.getters.getQueryIndex"
      icon="mdi-code-braces"
      details="View export query."
      link-details
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex[route.params.domain.toUpperCase()]
            .PREVALENCE_BY_MONTH[0]
        )
      "
      divider
    ></info-panel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import InfoPanel from "@/widgets/infoPanel";
import { specRecordProportionByMonth } from "./specRecordProportionByMonth";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import * as listeners from "@/pages/model/lib/listeners";
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import { specRecordProportionByMonthAnnotation } from "./specRecordProportionByMonthAnnotation";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import _ from "lodash";

const annotationsMode = ref(false);
function toggleMode(mode) {
  annotationsMode.value = mode;
}

const store = useStore();
const route = useRoute();

const reportId = "viz-recordproportionbymonth";

const getSourceConceptReportLink = function () {
  return {
    name: "sourceConceptOverlay",
    params: {
      domain: route.params.domain,
      concept: route.params.concept,
    },
  };
};

const annotations = computed(() => {
  const { cdm, release, domain, concept } = route.params;
  const path = [cdm, release, domain, concept].filter(Boolean);
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
