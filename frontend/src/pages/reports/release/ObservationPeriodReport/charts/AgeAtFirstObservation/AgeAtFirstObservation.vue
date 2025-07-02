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
    <Echarts
      :id="reportId"
      :data="data"
      :annotations="annotations"
      :annotation-mode="annotationsMode"
      :chart-spec="getEChartsOptionAgeAtFirstObservation"
    />
    <div v-if="showTable" class="p-4">
      <DataTable
        :striped-rows="store.getters.getSettings.strippedRows"
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
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex.OBSERVATION_PERIOD
                  .AGE_AT_FIRST_OBSERVATION[0]
              )
            )
          "
        />
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";
import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useAnnotationControls from "@/shared/lib/composables/useAnnotationControls";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Echarts from "@/widgets/echarts/Echarts.vue";
import getEChartsOptionAgeAtFirstObservation from "@/pages/reports/release/ObservationPeriodReport/charts/AgeAtFirstObservation/ageAtFirstObservation";

const store = useStore();

const reportId = "viz-ageatfirstobservation";

const { notesMode, annotationsMode, toggleNotesMode, toggleAnnotationsMode } =
  useAnnotationControls();

const { annotations, notes } = useAnnotations(reportId);

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}

const data = computed(() => {
  return store.getters.getData.observationPeriodData.AGE_AT_FIRST_OBSERVATION;
});
</script>

<style scoped></style>
