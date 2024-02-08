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
      v-if="store.getters.dataInStore"
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
        v-if="store.getters.dataInStore"
        :value="data"
        paginator
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
        <Column field="end_timestamp" header="DQ Execution Date"> </Column>
        <Column field="count_passed" header="# Passed"> </Column>

        <Column field="count_failed" header="# Failed">
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
              >{{ slotProps.data.count_failed }}
            </router-link>
          </template>
        </Column>
        <Column field="count_total" header="# Total"> </Column>
        <Column field="vocabulary_version" header="Vocabulary"> </Column>
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

const store = useStore();
const route = useRoute();

const annotationsMode = ref(false);
const notesMode = ref(false);
function toggleAnnotationsMode(mode) {
  annotationsMode.value = mode;
}
function toggleNotesMode(mode) {
  notesMode.value = mode;
}

const reportId = "viz-dataqualityresults";

const annotations = computed(() => {
  const { cdm, release } = route.params;
  const path = [cdm, release].filter(Boolean);
  const selections = _.get(store.getters.getNotes, path.join(".")) || {};
  return selections[reportId] || [];
});

const notes = computed(() => {
  if (annotations.value.length) {
    return annotations.value.reduce((acc, val) => {
      return [
        ...acc,
        ...val.notes.map((note) => ({
          ...note,
          report: reportId,
          selection: val.id,
        })),
      ];
    }, []);
  } else {
    return [];
  }
});

const showTable = ref(false);

function toggleTable(mode) {
  showTable.value = mode;
}

const data = computed(() => {
  return store.getters.getData[QUALITY_INDEX].dataQualityRecords;
});
</script>

<style scoped></style>
