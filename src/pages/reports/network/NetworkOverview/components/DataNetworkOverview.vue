<template>
  <v-card elevation="10" class="mx-auto pb-6" outlined>
    <v-card-title>Data Network Overview</v-card-title>
    <v-card-text>
      <v-container fluid>
        <v-row justify="space-around"
          ><v-col class="mx-4" cols="auto">
            <h3 class="mb-4 text--center">Data Sources</h3>
            <h1 class="text-center">
              {{ store.getters.getSources.length
              }}<v-icon large color="primary" class="mx-2">mdi-database</v-icon>
            </h1>
          </v-col>
          <v-col class="mx-4" cols="auto">
            <h3 class="mb-4 text-center">People</h3>
            <h1 class="text-center">
              {{ personCountFormatter(countPeople)
              }}<v-icon large color="primary" class="mx-2">mdi-account</v-icon>
            </h1>
          </v-col>
          <v-col class="mx-4" cols="auto">
            <h3 class="mb-4 text-center">Data Quality Issues</h3>
            <h1 class="text-center">
              {{ countDataQualityIssues
              }}<v-icon large color="primary" class="mx-2"
                >mdi-database-alert</v-icon
              >
            </h1>
          </v-col>
          <v-col class="mx-4" cols="auto">
            <h3 class="mb-4 text-center">Data Source Releases</h3>
            <h1 class="text-center">
              {{ countDataSourceReleases
              }}<v-icon large color="primary" class="mx-2">mdi-history</v-icon>
            </h1>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import { computed } from "vue";
import * as d3 from "d3-format";

const store = useStore();

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

const personCountFormatter = function (count: number) {
  return d3.format(".3s")(count);
};
</script>

<style scoped></style>
