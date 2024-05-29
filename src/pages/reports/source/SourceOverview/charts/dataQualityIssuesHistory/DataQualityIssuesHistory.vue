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
    <Chart
      :id="reportId"
      :annotations="annotations"
      :annotation-mode="annotationsMode"
      :chartSpec="specIssuesByRelease"
      :annotations-config="{
        chartSpec: specIssuesByReleaseAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
      :data="data"
    />
    <div v-if="showTable" class="p-4">
      <DataTable
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
                  ? helpers.formatComma(
                      slotProps.data.count_data_quality_issues
                    )
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
import { Chart } from "@/widgets/chart";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { specIssuesByRelease } from "./specIssuesByRelease";
import { specIssuesByReleaseAnnotation } from "./specIssuesByReleaseAnnotation";
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Panel from "primevue/panel";
import { mdiCodeBraces } from "@mdi/js";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useAnnotationControls from "@/shared/lib/composables/useAnnotationControls";

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
