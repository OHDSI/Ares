<template>
  <v-card
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-recordproportionbymonth"
      width="99"
      :chartSpec="specRecordProportionByMonth"
      :annotations-config="{
        chartSpec: specRecordProportionByMonthAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g ',
      }"
      :data="store.getters.getData.conceptData.PREVALENCE_BY_MONTH"
      title="Record Count Proportion by Month"
      :click-listener="listeners.setRectangleLocationClick"
      :signal-listener="listeners.setSelectionAreaSignal"
      :notes="notes"
      showAnnotations
    />
    <NotesPanel report="viz-recordproportionbymonth" />
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
import { computed } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import { specRecordProportionByMonthAnnotation } from "./specRecordProportionByMonthAnnotation";
import _ from "lodash";

const store = useStore();
const route = useRoute();

const getSourceConceptReportLink = function () {
  return {
    name: "sourceConceptOverlay",
    params: {
      domain: route.params.domain,
      concept: route.params.concept,
    },
  };
};
const notes = computed(() => {
  const { cdm, release, domain, concept } = route.params;
  const path = [cdm, release, domain, concept].filter(Boolean);
  const selections = _.get(store.getters.getNotes, path.join(".")) || {};
  return selections["viz-recordproportionbymonth"] || [];
});
</script>

<style scoped></style>
