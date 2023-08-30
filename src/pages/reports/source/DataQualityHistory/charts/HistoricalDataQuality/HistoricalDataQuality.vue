<template>
  <v-card
    v-if="!store.getters.getErrors"
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <ChartHeader
      title="Historical Data Quality"
      :notes-count="annotations.length"
      @mode-toggled="toggleMode"
    />
    <Chart
      v-if="store.getters.dataInStore"
      :id="reportId"
      :annotations="annotations"
      :annotation-mode="annotationsMode"
      :data="store.getters.getData[QUALITY_INDEX].dataQualityRecords"
      :chartSpec="specDataQualityResults"
      :annotations-config="{
        chartSpec: specDataQualityResultsAnnotation,
        annotationsParentElement: 'g',
        brushParentElement: 'g g',
      }"
    />
    <NotesPanel :notes="notes" />
    <v-data-table
      v-if="store.getters.dataInStore"
      class="viz-container"
      density="compact"
      :items="store.getters.getData[QUALITY_INDEX].dataQualityRecords"
      :headers="historyColumns"
    >
      <template #item.cdm_release_date="{ item }">
        <router-link
          :to="{
            name: 'dataQuality',
            query: { tab: 'overview' },
            params: {
              cdm: route.params.cdm,
              release: item.raw.cdm_release_date.replaceAll('-', ''),
            },
          }"
          :title="item.raw.cdm_release_date"
          >{{ item.raw.cdm_release_date }}
        </router-link>
      </template>
      <template #item.count_failed="{ item }">
        <router-link
          :to="{
            name: 'dataQuality',
            query: { tab: 'results', FAILED: 'FAIL' },
            params: {
              cdm: route.params.cdm,
              release: item.raw.cdm_release_date.replaceAll('-', ''),
            },
          }"
          :title="item.raw.count_failed"
          >{{ item.raw.count_failed }}
        </router-link>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { QUALITY_INDEX } from "@/shared/config/files";
import { Chart } from "@/widgets/chart";
import { VDataTable } from "vuetify/labs/VDataTable";
import { specDataQualityResults } from "./specDataQualityResults";
import { specDataQualityResultsAnnotation } from "./specDataQualityResultsAnnotation";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { computed, ref } from "vue";
import NotesPanel from "@/widgets/notesPanel/ui/NotesPanel.vue";
import _ from "lodash";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";

const store = useStore();
const route = useRoute();
const historyColumns = ref([
  {
    title: "CDM Release Date",
    align: "start",
    sortable: true,
    key: "cdm_release_date",
  },

  {
    title: "DQ Execution Date",
    align: "start",
    sortable: true,
    key: "end_timestamp",
  },
  {
    title: "# Passed",
    align: "end",
    sortable: true,
    key: "count_passed",
  },
  {
    title: "# Failed",
    align: "end",
    sortable: true,
    key: "count_failed",
  },
  {
    title: "# Total",
    align: "end",
    sortable: true,
    key: "count_total",
  },
  {
    title: "Vocabulary",
    align: "end",
    sortable: false,
    key: "vocabulary_version",
  },
]);

const annotationsMode = ref(false);
function toggleMode(mode) {
  annotationsMode.value = mode;
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
</script>

<style scoped></style>
