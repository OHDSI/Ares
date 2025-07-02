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
    <Echarts
      :id="reportId"
      :data="releases"
      :chart-spec="getEChartsPopulationByRelease"
      :annotations="annotations"
      :annotation-mode="annotationsMode"
    />
    <div v-if="showTable" class="p-4">
      <DataTable
        :striped-rows="store.getters.getSettings.strippedRows"
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
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(store.getters.getQueryIndex.CDM_SOURCE[0])
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
import Panel from "primevue/panel";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import { mdiCodeBraces } from "@mdi/js";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useAnnotationControls from "@/shared/lib/composables/useAnnotationControls";
import Echarts from "@/widgets/echarts/Echarts.vue";
import getEChartsPopulationByRelease from "@/pages/reports/source/SourceOverview/charts/populationHistory/populationHistory";

const store = useStore();

const reportId = "population_releases";

const { notesMode, annotationsMode, toggleNotesMode, toggleAnnotationsMode } =
  useAnnotationControls();

const { annotations, notes } = useAnnotations(reportId);

const releases = computed(() => {
  return store.getters.getSelectedSource.releases.map((value) => ({
    ...value,
    dateU: new Date(value.dqd_execution_date),
  }));
});

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}
</script>

<style scoped></style>
