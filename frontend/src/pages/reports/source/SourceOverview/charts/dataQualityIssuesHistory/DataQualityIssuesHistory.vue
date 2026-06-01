<template>
  <Panel header="Data Quality Issues History">
    <template #icons>
      <ChartHeader
        title="Data Quality Issues History"
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
      :chart-spec="getEChartsIssuesHistory"
      :annotations="annotations"
      :annotation-mode="annotationsMode"
    />
    <CollapseTransition>
      <div v-if="showTable" class="p-4">
        <DataTable
          :striped-rows="store.getters.getSettings.strippedRows"
          size="small"
          :value="data"
          paginator
          currentPageReportTemplate="{first} to {last} of {totalRecords}"
          paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
          :rows="5"
          :rowsPerPageOptions="[5, 10, 20, 50]"
        >
          <Column field="release_name" header="Release"> </Column>
          <Column
            :pt="{ headerContent: 'justify-end' }"
            sortable
            header="Issues"
            field="count_data_quality_issues"
          >
            <template #body="slotProps">
              <div class="flex justify-end">
                {{
                  slotProps.data.count_data_quality_issues
                    ? formatComma(slotProps.data.count_data_quality_issues)
                    : "No data"
                }}
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </CollapseTransition>

    <NotesPanel v-if="notesMode" :notes="notes" />
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            openNewTab(
              links.getSqlQueryLink(store.getters.getQueryIndex.CDM_SOURCE[0]),
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
import ChartHeader from "@/widgets/echarts/chartHeader";
import ChartActionIcon from "@/shared/ui/toggleIcon";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useAnnotationControls from "@/shared/lib/composables/useAnnotationControls";
import Echarts from "@/widgets/echarts/echarts";
import getEChartsIssuesHistory from "@/pages/reports/source/SourceOverview/charts/dataQualityIssuesHistory/dataQualityIssuesHistory";
import { formatComma } from "@/shared/lib/formatters";
import { openNewTab } from "@/shared/lib/utils";

const store = useStore();

const reportId = "issues_releases";

const { notesMode, annotationsMode, toggleNotesMode, toggleAnnotationsMode } =
  useAnnotationControls();

const { annotations, notes } = useAnnotations(reportId);

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}

const data = computed(() => {
  return store.getters.getSelectedSource.releases;
});
</script>

<style scoped></style>
