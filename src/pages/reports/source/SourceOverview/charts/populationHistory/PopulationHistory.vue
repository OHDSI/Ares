<template>
  <Panel header="Population History">
    <template #icons>
      <ChartHeader
        title="Population History"
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
      :annotations="annotations"
      :annotation-mode="annotationsMode"
      :chartSpec="specPopulationByRelease"
      :annotations-config="{
        chartSpec: specPopulationByReleaseAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
      :data="releases"
    />
    <div v-if="showTable" class="p-4">
      <DataTable
        size="small"
        :value="releases"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column field="dqd_execution_date" header="Date"> </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="Population"
          field="count_person"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.count_person
                  ? helpers.formatComma(slotProps.data.count_person)
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
import { useStore } from "vuex";
import { specPopulationByRelease } from "./specPopulationByRelease";
import { specPopulationByReleaseAnnotation } from "./specPopulationByReleaseAnnotation";
import { computed } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import Panel from "primevue/panel";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import { mdiCodeBraces } from "@mdi/js";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useChartControls from "@/shared/lib/composables/useChartControls";

const store = useStore();

const reportId = "population_releases";

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
  store.getters.getQueryIndex.CDM_SOURCE[0]
);

const releases = computed(() => {
  return store.getters.getSelectedSource.releases.map((value) => ({
    ...value,
    dateU: new Date(value.dqd_execution_date),
  }));
});
</script>

<style scoped></style>
