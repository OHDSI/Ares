<template>
  <v-container>
    <v-card
      v-if="store.getters.getApiData.serviceDetails"
      :loading="store.getters.getApiData.loading"
      elevation="10"
      class="ma-4 pa-2"
    >
      <v-card-title>WebAPI details</v-card-title>
      <v-container v-if="store.getters.getApiData.serviceDetails" fluid>
        <v-layout> </v-layout>
        <v-layout
          v-for="(value, propertyName) in getApiMetadata()"
          :key="propertyName"
          class="pl-8"
        >
          {{ propertyName }}: {{ value }}
        </v-layout>
      </v-container>
      <v-card v-else
        ><v-card-title
          >WebAPI server is unavailable at the time</v-card-title
        ></v-card
      >
    </v-card>

    <v-card
      v-if="store.getters.getApiData.apiSources"
      elevation="10"
      class="ma-4 pa-2"
    >
      <v-data-table
        :loading="store.getters.getApiData.loading"
        :items="store.getters.getApiData.apiSources"
        :headers="sourceHeaders"
      ></v-data-table>
    </v-card>
    <h1 v-else class="text-center">No data available</h1>
  </v-container>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import { VDataTable } from "vuetify/labs/VDataTable";

const store = useStore();
const sourceHeaders = [
  {
    title: "Source",
    align: "start",
    sortable: false,
    key: "sourceKey",
  },
  {
    title: "Source dialect",
    align: "start",
    sortable: false,
    key: "sourceDialect",
  },
  {
    title: "Source name",
    align: "start",
    sortable: false,
    key: "sourceName",
  },
  {
    title: "Source ID",
    align: "start",
    sortable: false,
    key: "sourceId",
  },
];

const getApiMetadata = function () {
  const data = store.getters.getApiData.serviceDetails;
  return {
    "WebAPI version": data.version,
    Timestamp: data.buildInfo.timestamp,
    Branch: data.buildInfo.branch,
    "Commit ID": data.buildInfo.commitId,
  };
};
</script>

<script lang="ts">
export default {
  name: "WebApiInfo",
};
</script>

<style scoped></style>
