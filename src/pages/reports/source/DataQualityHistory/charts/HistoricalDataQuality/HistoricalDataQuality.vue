<template>
  <Panel
    header="Historical Data Quality"
    v-if="store.getters.explorerLoaded"
    id="network-data-quality-overview"
  >
    <template #icons>
      <ChartHeader
        title="Historical Data Quality"
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
      :data="data"
      :chartSpec="specDataQualityResults"
      :annotations-config="{
        chartSpec: specDataQualityResultsAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
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
        <Column field="cdm_release_date" header="Release Date">
          <template #body="slotProps">
            <router-link
              class="text-blue-400 hover:underline"
              :to="{
                name: 'dataQuality',
                query: { tab: 'overview' },
                params: {
                  cdm: route.params.cdm,
                  release: slotProps.data.cdm_release_date.replaceAll('-', ''),
                },
              }"
              :title="slotProps.data.cdm_release_date"
              >{{ slotProps.data.cdm_release_date }}
            </router-link>
          </template>
        </Column>
        <Column field="vocabulary_version" header="Vocabulary"> </Column>
        <Column field="end_timestamp" header="DQ Execution Date"> </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          field="count_passed"
          header="# Passed"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              <span> {{ slotProps.data.count_passed }}</span>
            </div>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          field="count_failed"
          header="# Failed"
        >
          <template #body="slotProps">
            <router-link
              class="text-blue-400 hover:underline"
              :to="{
                name: 'dataQuality',
                query: { tab: 'results', FAILED: 'FAIL' },
                params: {
                  cdm: route.params.cdm,
                  release: slotProps.data.cdm_release_date.replaceAll('-', ''),
                },
              }"
              :title="slotProps.data.count_failed"
              ><span class="flex justify-end">{{
                slotProps.data.count_failed
              }}</span>
            </router-link>
          </template>
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          field="count_total"
          header="# Total"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              <span> {{ slotProps.data.count_total }}</span>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <NotesPanel v-if="notesMode" :notes="notes" />
  </Panel>
</template>

<script setup lang="ts">
import { QUALITY_INDEX } from "@/shared/config/files";
import { Chart } from "@/widgets/chart";
import { specDataQualityResults } from "./specDataQualityResults";
import { specDataQualityResultsAnnotation } from "./specDataQualityResultsAnnotation";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import _ from "lodash";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import Panel from "primevue/panel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import useAnnotations from "@/shared/lib/composables/useAnnotations";
import useAnnotationControls from "@/shared/lib/composables/useAnnotationControls";

const store = useStore();
const route = useRoute();
const reportId = "viz-dataqualityresults";

const { notesMode, annotationsMode, toggleNotesMode, toggleAnnotationsMode } =
  useAnnotationControls();

const { annotations, notes } = useAnnotations(reportId);

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}

const data = computed(() => {
  return store.getters.getData[QUALITY_INDEX].dataQualityRecords;
});
</script>

<style scoped></style>
