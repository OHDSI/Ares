<template>
  <div>
    <v-card
      v-if="!store.getters.getErrors"
      :loading="!store.getters.dataInStore"
      elevation="10"
      class="ma-4 pa-2"
    >
      <Chart
        v-if="store.getters.dataInStore"
        id="viz-dataqualityresults"
        title="Historical Data Quality"
        :data="store.getters.getData[QUALITY_INDEX].dataQualityRecords"
        :config="chartConfigs.specDataQualityResults"
      />
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

    <v-card
      :loading="!store.getters.dataInStore"
      elevation="10"
      class="ma-4 pa-2"
    >
      <Chart
        v-if="store.getters.dataInStore"
        id="viz-dataqualityresultsbycategory"
        title="Historical Data Quality by Category"
        :data="
          store.getters.getData[QUALITY_INDEX].dataQualityRecordsStratified
        "
        :config="chartConfigs.specDataQualityResultsByCategory"
      />
    </v-card>

    <v-card
      :loading="!store.getters.dataInStore"
      elevation="10"
      class="ma-4 pa-2"
    >
      <Chart
        v-if="store.getters.dataInStore"
        id="viz-dataqualityresultsbydomain"
        title="Historical Data Quality by Domain"
        :config="chartConfigs.specDataQualityResultsByDomain"
        :data="
          store.getters.getData[QUALITY_INDEX].dataQualityRecordsStratified
        "
      />
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { chartConfigs, Chart } from "@/widgets/chart";
import { QUALITY_INDEX } from "@/shared/config/files";
import { useStore } from "vuex";
import { VDataTable } from "vuetify/labs/VDataTable";
import { ref } from "vue";
import { useRoute } from "vue-router";

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
</script>

<style scoped></style>
