<template>
  <Panel
    header="Historical Data Quality by Domain"
    :loading="!store.getters.dataInStore"
    elevation="2"
    class="ma-4"
  >
    <template #icons>
      <ChartHeader
        title="Historical Data Quality by Domain"
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
      :chartSpec="specDataQualityResultsByDomain"
      :data="store.getters.getData[QUALITY_INDEX].dataQualityRecordsStratified"
      :annotation-mode="annotationsMode"
      :annotations="annotations"
      :annotations-config="{
        chartSpec: specDataQualityResultsByDomainAnnotation,
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
        <Column field="cdm_table_name" header="Check Domain"> </Column>
        <Column field="dqd_execution_date" header="DQD execution date">
        </Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="Checks Failed"
          field="count_value"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              {{
                slotProps.data.count_value
                  ? helpers.formatComma(slotProps.data.count_value)
                  : "No data"
              }}
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <NotesPanel v-if="notesMode" :notes="notes" />
  </Panel>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { specDataQualityResultsByDomain } from "./specDataQualityResultsByDomain";
import { QUALITY_INDEX } from "@/shared/config/files";
import { useStore } from "vuex";
import { specDataQualityResultsByDomainAnnotation } from "@/pages/reports/source/DataQualityHistory/charts/HistoricalDataQualityByDomain/specDataQualityResultsByDomainAnnotation";
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import _ from "lodash";
import { useRoute } from "vue-router";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import Panel from "primevue/panel";
import { helpers } from "@/shared/lib/mixins";
import Column from "primevue/column";
import DataTable from "primevue/datatable";

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

const reportId = "viz-sourcedataqualityresultsbydomain";

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
  return store.getters.getData[QUALITY_INDEX].dataQualityRecordsStratified;
});
</script>

<style scoped></style>
