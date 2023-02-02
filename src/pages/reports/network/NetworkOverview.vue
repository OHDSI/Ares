<template>
  <div
    v-if="store.getters.explorerLoaded"
    id="network-data-quality-overview"
    class="pa-4"
  >
    <v-row>
      <v-col>
        <v-card elevation="10" class="mx-auto pb-6" outlined>
          <v-card-title>Data Network Overview</v-card-title>
          <v-card-text>
            <v-container fluid>
              <v-row justify="space-around"
                ><v-col class="mx-4" cols="auto">
                  <h3 class="mb-4 text--center">Data Sources</h3>
                  <h1 class="text-center">
                    {{ store.getters.getSources.length
                    }}<v-icon large color="info" class="mx-2"
                      >mdi-database</v-icon
                    >
                  </h1>
                </v-col>
                <v-col class="mx-4" cols="auto">
                  <h3 class="mb-4 text-center">People</h3>
                  <h1 class="text-center">
                    {{ personCountFormatter(countPeople)
                    }}<v-icon large color="info" class="mx-2"
                      >mdi-account</v-icon
                    >
                  </h1>
                </v-col>
                <v-col class="mx-4" cols="auto">
                  <h3 class="mb-4 text-center">Data Quality Issues</h3>
                  <h1 class="text-center">
                    {{ countDataQualityIssues
                    }}<v-icon large color="info" class="mx-2"
                      >mdi-database-alert</v-icon
                    >
                  </h1>
                </v-col>
                <v-col class="mx-4" cols="auto">
                  <h3 class="mb-4 text-center">Data Source Releases</h3>
                  <h1 class="text-center">
                    {{ countDataSourceReleases
                    }}<v-icon large color="info" class="mx-2"
                      >mdi-history</v-icon
                    >
                  </h1>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card elevation="10" class="mx-auto pb-6" outlined>
          <v-card-title>Data Sources</v-card-title>
          <v-card-text>
            <v-data-table
              density="compact"
              :items="store.getters.getSources"
              :headers="dataSourceColumns"
              hide-default-footer
            >
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import * as d3 from "d3-format";
import { VDataTable } from "vuetify/labs/VDataTable";
import { computed, ref, Ref } from "vue";
import { useStore } from "vuex";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";
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
const personCountFormatter = function (count: number) {
  return d3.format(".3s")(count);
};

const countPeople = computed(function () {
  if (store.getters.explorerLoaded) {
    return store.getters.getSources.reduce(
      (prev, current) => (prev += current.releases[0].count_person),
      0
    );
  } else {
    return [];
  }
});
const countDataQualityIssues = computed(function () {
  if (store.getters.explorerLoaded) {
    return store.getters.getSources.reduce(
      (prev, current) =>
        (prev += current.releases[0].count_data_quality_issues),
      0
    );
  } else {
    return [];
  }
});

const countDataSourceReleases = computed(function () {
  if (store.getters.explorerLoaded) {
    return store.getters.getSources.reduce(
      (prev, current) => (prev += current.releases.length),
      0
    );
  } else {
    return [];
  }
});
</script>

<script lang="ts">
export default {
  name: "NetworkOverview",
};
</script>

<style scoped>
.v-card__title {
  word-break: normal;
}
.v-card__subtitle {
  padding-bottom: 0px;
  padding-top: 4px;
}
.row {
  margin-top: -5px;
}
</style>
