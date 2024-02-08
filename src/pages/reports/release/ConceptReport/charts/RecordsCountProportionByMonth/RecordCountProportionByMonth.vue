<template>
  <Panel header="Record Count Proportion by Month">
    <template #icons>
      <ChartHeader
        title="Record Count Proportion by Month"
        :notes-count="notes.length"
        :annotations-count="annotations.length"
        @annotations-mode-toggled="toggleAnnotationsMode"
        @notes-mode-toggled="toggleNotesMode"
      />
    </template>

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
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          :icon="mdiHelpCircle"
          tooltip="Proportion of people with at least one record per 1000 people."
        />
        <ChartActionIcon
          v-if="store.getters.getData.isNotStationary"
          :icon="mdiClockAlert"
          tooltip="This time series has been deemed non-stationary by temporal characterization."
        />
        <ChartActionIcon
          v-if="store.getters.getData.isNotStationary"
          :icon="mdiClockAlert"
          :tooltip="store.getters.getData.seasonalityComment"
          @iconClicked="helpers.openNewTab(links.getCastorLink())"
        />
        <ChartActionIcon
          :icon="mdiDatabaseClock"
          tooltip="Review this Time-Series across data source releases."
          @iconClicked="router.push(getSourceConceptReportLink())"
        />
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
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
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import { specRecordProportionByMonth } from "./specRecordProportionByMonth";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import * as listeners from "@/pages/model/lib/listeners";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import { specRecordProportionByMonthAnnotation } from "./specRecordProportionByMonthAnnotation";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import Panel from "primevue/panel";
import {
  mdiClockAlert,
  mdiCodeBraces,
  mdiDatabaseClock,
  mdiHelpCircle,
} from "@mdi/js";
import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useAnnotationControls from "@/shared/lib/composables/useAnnotationControls";
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

const { notesMode, annotationsMode, toggleNotesMode, toggleAnnotationsMode } =
  useAnnotationControls();

const { annotations, notes } = useAnnotations(reportId);
</script>

<style scoped></style>
