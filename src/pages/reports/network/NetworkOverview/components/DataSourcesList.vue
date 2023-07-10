<template>
  <v-card elevation="10" class="mx-auto pb-6" outlined>
    <v-card-title>Data Sources</v-card-title>
    <v-card-text>
      <v-container fluid>
        <v-row>
          <v-col>
            <v-text-field
              prepend-icon="mdi-magnify"
              label="Search in Table"
              single-line
              density="compact"
              variant="outlined"
              hide-details
              @update:modelValue="debouncedSearch"
            ></v-text-field>
          </v-col>
          <v-col>
            <SelectColumns :headers="dataSourceColumns" />
          </v-col>
        </v-row>
      </v-container>

      <v-data-table
        density="compact"
        :items="store.getters.getSources"
        :headers="showHeaders"
        :search="search"
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
        <template v-slot:item.releases[0].count_person="{ item }">
          {{ helpers.formatComma(item.raw.releases[0].count_person) }}
        </template>

        <template v-slot:item.releases[0].release_name="{ item }">
          {{ item.raw.releases[0].release_name }}
        </template>
        <template v-slot:item.releases[0].obs_period_start="{ item }">
          {{ item.raw.releases[0].obs_period_start }}
        </template>
        <template v-slot:item.releases[0].obs_period_end="{ item }">
          {{ item.raw.releases[0].obs_period_end }}
        </template>
        <template v-slot:item.releases[0].count_data_quality_issues="{ item }">
          {{ item.raw.releases[0].count_data_quality_issues }}
        </template>
        <template v-slot:item.releases[0].vocabulary_version="{ item }">
          {{ item.raw.releases[0].vocabulary_version }}
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { VDataTable } from "vuetify/labs/VDataTable";
import { computed, ref, Ref } from "vue";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";
import { useStore } from "vuex";
import SelectColumns from "@/features/selectColumns";
import { debounce } from "lodash";
import { helpers } from "@/shared/lib/mixins";

const store = useStore();

const search = ref("");

const dataSourceColumns: Ref<DataTableHeader[]> = ref([
  {
    title: "Data Source",
    align: "start",
    sortable: true,
    show: true,
    key: "cdm_source_name",
  },
  {
    title: "Person Count",
    align: "end",
    sortable: true,
    show: true,
    key: "releases[0].count_person",
  },
  {
    title: "Start Observed",
    align: "end",
    show: true,
    key: "releases[0].obs_period_start",
    sortable: false,
  },
  {
    title: "End Observed",
    align: "end",
    show: true,
    key: "releases[0].obs_period_end",
    sortable: false,
  },
  {
    title: "Latest Release",
    align: "end",
    show: true,
    sortable: false,
    key: "releases[0].release_name",
  },
  {
    title: "Data Quality Issues",
    align: "end",
    show: false,
    sortable: true,
    key: "releases[0].count_data_quality_issues",
  },
  {
    title: "Data Source Releases",
    align: "end",
    show: true,
    sortable: true,
    key: "count_releases",
  },
  {
    title: "Vocabulary Version",
    align: "end",
    show: false,
    sortable: true,
    key: "releases[0].vocabulary_version",
  },
  {
    title: "Average Update Frequency (days)",
    align: "end",
    show: true,
    sortable: true,
    key: "average_update_interval_days",
  },
]);

const showHeaders = computed(() => {
  return dataSourceColumns.value.filter((header) => header.show);
});

const debouncedSearch = debounce(function (data: string): void {
  search.value = data;
}, 300);

function getDataSourceRoute(item: { cdm_source_key: string }) {
  return {
    name: "dataSourceOverview",
    params: { cdm: item.cdm_source_key },
  };
}
</script>

<style scoped></style>
