<template>
  <Panel header="Record Proportion by Month">
    <template #icons>
      <ChartHeader
        :notes-count="notes.length"
        :annotations-count="annotations.length"
        @annotations-mode-toggled="toggleAnnotationsMode"
        @notes-mode-toggled="toggleNotesMode"
      />
    </template>

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
      :signal-listener="listeners.setSelectionAreaSignal"
      :annotations="annotations"
      :annotation-mode="annotationsMode"
    />
    <NotesPanel v-if="notesMode" :notes="notes" />
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="helpers.openNewTab(sqlLink)"
        />
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { specRecordProportionByMonth } from "./specRecordProportionByMonth";
import { specRecordProportionByMonthAnnotation } from "./specRecordProportionByMonthAnnotation";
import * as listeners from "@/pages/model/lib/listeners";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import { mdiCodeBraces } from "@mdi/js";
import Panel from "primevue/panel";
import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useChartControls from "@/shared/lib/composables/useChartControls";

const store = useStore();

const reportId = "viz-sourcerecordproportionbymonth";

const sqlLink = links.getSqlQueryLink(
  store.getters.getQueryIndex.PREVALENCE_BY_MONTH[0]
);

const { notesMode, annotationsMode, toggleNotesMode, toggleAnnotationsMode } =
  useChartControls();

const { annotations, notes } = useAnnotations(reportId);
</script>

<style scoped></style>
