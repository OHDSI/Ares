<template>
  <Panel header="Age at First Observation">
    <template #icons>
      <ChartHeader
        title="Age at First Observation"
        :notes-count="notes.length"
        :annotations-count="annotations.length"
        @annotations-mode-toggled="toggleAnnotationsMode"
        @notes-mode-toggled="toggleNotesMode"
        table-toggle
        @table-toggled="toggleTable"
      />
    </template>

    <Chart
      :id="reportId"
      :chartSpec="specAgeAtFirstObservation"
      :annotations-config="{
        chartSpec: specAgeAtFirstObservationAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
      :annotations="annotations"
      :annotation-mode="annotationsMode"
      :data="data"
    />
    <div v-if="showTable" class="p-4">
      <DataTable
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        removable-sort
        size="small"
        paginator
        :value="data"
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column sortable header="Age" field="INTERVAL_INDEX"> </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="# Persons"
          field="COUNT_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.COUNT_VALUE
                  ? helpers.formatComma(slotProps.data.COUNT_VALUE)
                  : "No data"
              }}
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="% of Population"
          field="PERCENT_VALUE"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.PERCENT_VALUE
                  ? helpers.formatPercent(slotProps.data.PERCENT_VALUE)
                  : "No data"
              }}
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
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
import { specAgeAtFirstObservation } from "./specAgeAtFirstObservation";
import { specAgeAtFirstObservationAnnotation } from "./specAgeAtFirstObservationAnnotation";
import { useStore } from "vuex";
import { computed } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";
import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useChartControls from "@/shared/lib/composables/useChartControls";
import Column from "primevue/column";
import DataTable from "primevue/datatable";

const store = useStore();

const reportId = "viz-ageatfirstobservation";

const sqlLink = links.getSqlQueryLink(
  store.getters.getQueryIndex.OBSERVATION_PERIOD.AGE_AT_FIRST_OBSERVATION[0]
);

const {
  notesMode,
  annotationsMode,
  toggleNotesMode,
  toggleAnnotationsMode,
  showTable,
  toggleTable,
} = useChartControls();

const { annotations, notes } = useAnnotations(reportId);

const data = computed(() => {
  return store.getters.getData.observationPeriodData.AGE_AT_FIRST_OBSERVATION;
});
</script>

<style scoped></style>
