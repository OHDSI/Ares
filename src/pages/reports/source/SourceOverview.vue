<template>
  <div
    v-if="store.getters.explorerLoaded"
    id="network-data-quality-overview"
    class="pa-4"
  >
    <v-row>
      <v-col>
        <v-card elevation="10" class="mx-auto pb-6" outlined>
          <v-card-title>Source Overview</v-card-title>
          <v-card-text>
            <v-container fluid>
              <v-row justify="space-around"
                ><v-col class="mx-4" cols="auto">
                  <h3 class="mb-4 text--center">Releases</h3>
                  <h1 class="text-center">
                    {{ getReleasesCount
                    }}<v-icon large color="info" class="mx-2"
                      >mdi-history</v-icon
                    >
                  </h1>
                </v-col>
                <v-col class="mx-4" cols="auto">
                  <h3 class="mb-4 text-center">
                    Average Days Between Releases
                  </h3>
                  <h1 class="text-center">
                    {{ getDaysBetweenReleases.toFixed(0)
                    }}<v-icon large color="info" class="mx-2"
                      >mdi-clock-outline</v-icon
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
        <v-card elevation="10" class="mx-auto pb-6">
          <Chart
            id="population_releases"
            title="Population History"
            width="95"
            :config="chartConfigs.specPopulationByRelease"
            :data="store.getters.getSelectedSource.releases"
          />
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              links.getSqlQueryLink(store.getters.getQueryIndex.CDM_SOURCE[0])
            "
            :divider="true"
          ></info-panel>
        </v-card>
      </v-col>
      <v-col>
        <v-card elevation="10" class="mx-auto pb-6">
          <Chart
            id="issues_releases"
            title="Data Quality Issues History"
            width="95"
            :config="chartConfigs.specIssuesByRelease"
            :data="store.getters.getSelectedSource.releases"
          />
          <info-panel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              links.getSqlQueryLink(store.getters.getQueryIndex.CDM_SOURCE[0])
            "
            :divider="true"
          ></info-panel>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card elevation="10" class="mx-auto pb-6" outlined>
          <v-card-title>Release Listing</v-card-title>
          <v-card-text>
            <v-data-table
              density="compact"
              :items="getTable"
              :headers="overviewTable"
              :items-per-page="-1"
              hide-default-footer
            >
              <template #item.count_person="{ item }">
                <router-link
                  :to="getPersonLink(item.raw)"
                  :title="item.raw.count_person"
                  >{{ helpers.formatComma(item.raw.count_person) }}</router-link
                >
              </template>
              <template #item.count_data_quality_issues="{ item }">
                <router-link :to="getQualityLink(item.raw)">{{
                  helpers.formatComma(item.raw.count_data_quality_issues)
                }}</router-link>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col> </v-row
    >'
  </div>
</template>

<script setup lang="ts">
import { chartConfigs, Chart } from "@/widgets/chart";
import InfoPanel from "@/widgets/infoPanel";
import { helpers } from "@/shared/lib/mixins";
import { VDataTable } from "vuetify/labs/VDataTable";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { computed, ref } from "vue";

const store = useStore();

const overviewTable = ref([
  {
    title: "Release date",
    align: "start",
    sortable: true,
    key: "release_name",
  },
  {
    title: "Number of people",
    align: "end",
    sortable: true,
    key: "count_person",
  },
  {
    title: "Data quality issues",
    align: "end",
    sortable: true,
    key: "count_data_quality_issues",
  },
]);

const getQualityLink = function (item) {
  return {
    name: "dataQuality",
    params: {
      cdm: store.getters.getSelectedSource.cdm_source_key,
      release: item.release_id,
    },
    query: { tab: "overview" },
  };
};
const getPersonLink = function (item) {
  return {
    name: "person",
    params: {
      cdm: store.getters.getSelectedSource.cdm_source_key,
      release: item.release_id,
    },
  };
};

const getReleasesCount = computed(function () {
  if (store.getters.explorerLoaded) {
    return store.getters.getSelectedSource.count_releases;
  } else {
    return [];
  }
});

const getDaysBetweenReleases = computed(function () {
  if (store.getters.explorerLoaded) {
    const dates = store.getters.getSelectedSource.releases.map(
      (value) => new Date(value.release_name)
    );
    //todo rewrite using array functional methods
    const numbers = [];

    for (let i = 0; i < dates.length - 1; i++) {
      numbers.push((dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24));
    }

    return numbers.length
      ? numbers.reduce((prevValue, current) => prevValue + current, 0) /
          numbers.length
      : 0;
  } else {
    return [];
  }
});

const getTable = computed(function () {
  if (store.getters.explorerLoaded) {
    return store.getters.getSelectedSource.releases;
  } else {
    return [];
  }
});
</script>

<style scoped></style>
