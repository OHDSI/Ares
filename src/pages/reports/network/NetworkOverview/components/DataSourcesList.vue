<template>
  <v-card elevation="10" class="mx-auto pb-6" outlined>
    <v-card-title>Data Sources</v-card-title>
    <v-card-text>
      <v-data-table
        density="compact"
        :items="store.getters.getSources"
        :headers="dataSourceColumns"
        hide-default-footer
      >
        <template v-slot:item.cdm_source_name="{ item }">
          <v-row>
            <v-col cols="10">
              <router-link
                :to="getDataSourceRoute(item.raw)"
                :title="item.raw.cdm_source_name"
                >{{ item.raw.cdm_source_name }}
              </router-link>
            </v-col>
          </v-row>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { VDataTable } from "vuetify/labs/VDataTable";
import { ref, Ref } from "vue";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";
import { useStore } from "vuex";

const store = useStore();

const dataSourceColumns: Ref<DataTableHeader[]> = ref([
  {
    title: "Data Source",
    align: "start",
    sortable: true,
    key: "cdm_source_name",
  },
  {
    title: "Person Count",
    align: "end",
    sortable: true,
    key: "releases[0].count_person",
  },
  {
    title: "Start Observed",
    align: "end",
    key: "obs_period_start",
    sortable: false,
  },
  {
    title: "End Observed",
    align: "end",
    key: "obs_period_end",
    sortable: false,
  },
  {
    title: "Latest Release",
    align: "end",
    sortable: false,
    key: "releases[0].release_name",
  },
  {
    title: "Data Quality Issues",
    align: "end",
    sortable: true,
    key: "releases[0].count_data_quality_issues",
  },
  {
    title: "Data Source Releases",
    align: "end",
    sortable: true,
    key: "count_releases",
  },
  {
    title: "Vocabulary Version",
    align: "end",
    sortable: true,
    key: "releases[0].vocabulary_version",
  },
  {
    title: "Average Update Frequency (days)",
    align: "end",
    sortable: true,
    key: "average_update_interval_days",
  },
]);

function getDataSourceRoute(item: { cdm_source_key: string }) {
  return {
    name: "dataSourceOverview",
    params: { cdm: item.cdm_source_key },
  };
}
</script>

<style scoped></style>
