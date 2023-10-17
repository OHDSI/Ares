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
      :id="reportId"
      width="98"
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
    <NotesPanel v-if="notesMode" :notes="notes" />
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        icon="mdi-help-circle"
        tooltip="Proportion of people with at least one record per 1000 people."
      />
      <ChartActionIcon
        v-if="store.getters.getData.isNotStationary"
        icon="mdi-clock-alert"
        tooltip="This time series has been deemed non-stationary by temporal characterization."
      />
      <ChartActionIcon
        v-if="store.getters.getData.isNotStationary"
        icon="mdi-clock-alert"
        :tooltip="store.getters.getData.seasonalityComment"
        @iconClicked="helpers.openNewTab(links.getCastorLink())"
      />
      <ChartActionIcon
        icon="mdi-database-clock"
        tooltip="Review this Time-Series across data source releases."
        @iconClicked="router.push(getSourceConceptReportLink())"
      />
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
import { specRecordProportionByMonth } from "./specRecordProportionByMonth";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import * as listeners from "@/pages/model/lib/listeners";
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import { specRecordProportionByMonthAnnotation } from "./specRecordProportionByMonthAnnotation";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import _ from "lodash";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";

const annotationsMode = ref(false);
const notesMode = ref(false);
function toggleAnnotationsMode(mode) {
  annotationsMode.value = mode;
}
function toggleNotesMode(mode) {
  notesMode.value = mode;
}

const store = useStore();
const route = useRoute();
const router = useRouter();

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
