<template>
  <Panel header="Record Count Proportion by Month">
    <template #icons>
      <ChartHeader
        title="Record Count Proportion by Month"
        :notes-count="notes.length"
        :annotations-count="annotations.length"
        @annotations-mode-toggled="toggleAnnotationsMode"
        @notes-mode-toggled="toggleNotesMode"
        table-toggle
        @table-toggled="toggleTable"
      />
    </template>

    <Chart
      id="viz-deathrecordproportionbymonth"
      :annotations="annotations"
      :signal-listener="listeners.setSelectionAreaSignal"
      :annotation-mode="annotationsMode"
      :annotations-config="{
        chartSpec: specRecordProportionByMonthAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
      :chartSpec="specRecordProportionByMonth"
      :data="data"
    />
    <div v-if="showTable" class="p-4">
      <DataTable
        removable-sort
        size="small"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :value="data"
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column sortable header="Month" field="X_CALENDAR_MONTH"> </Column>

        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="Record Proportion Per 1000"
          field="Y_PREVALENCE_1000PP"
        >
        </Column>
      </DataTable>
    </div>
    <NotesPanel v-if="notesMode" :notes="notes" />
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          :icon="mdiHelpCircle"
          tooltip="Proportion of people with at least one record per 1000 people."
        />
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
import * as listeners from "@/pages/model/lib/listeners";
import { specRecordProportionByMonthAnnotation } from "./specRecordProportionByMonthAnnotation";
import { computed } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces, mdiHelpCircle } from "@mdi/js";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useChartControls from "@/shared/lib/composables/useChartControls";

const store = useStore();

const reportId = "viz-deathrecordproportionbymonth";

const {
  notesMode,
  annotationsMode,
  toggleNotesMode,
  toggleAnnotationsMode,
  showTable,
  toggleTable,
} = useChartControls();

const { annotations, notes } = useAnnotations(reportId);

const sqlLink = links.getSqlQueryLink(
  store.getters.getQueryIndex.DEATH.PREVALENCE_BY_MONTH[0]
);

const data = computed(() => {
  return store.getters.getData.PREVALENCE_BY_MONTH;
});
</script>

<style scoped></style>
