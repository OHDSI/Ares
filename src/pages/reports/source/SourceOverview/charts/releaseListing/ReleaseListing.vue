<template>
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
</template>

<script setup lang="ts">
import { VDataTable } from "vuetify/labs/VDataTable";
import { helpers } from "@/shared/lib/mixins";
import { computed, ref } from "vue";
import { useStore } from "vuex";

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

const getTable = computed(function () {
  if (store.getters.explorerLoaded) {
    return store.getters.getSelectedSource.releases;
  } else {
    return [];
  }
});

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
</script>

<style scoped></style>
