<template>
  <v-container>
    <v-card :loading="!getApiData" elevation="10" class="ma-4 pa-2">
      <v-card-title>WebAPI details</v-card-title>
      <v-container v-if="getApiData.serviceDetails" fluid>
        <v-layout
          v-for="(d, i) in getApiData.serviceDetails"
          :key="i"
          class="pl-8"
        >
          {{ d }}: {{ getApiData.serviceDetails[d] }}
        </v-layout>
      </v-container>
    </v-card>

    <v-card
      v-if="Object.keys(getApiData).length"
      elevation="10"
      class="ma-4 pa-2"
    >
      <v-data-table
        :items="getApiData.apiSources"
        :headers="sourceHeaders"
      ></v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "WebApiInfo",
  data() {
    return {
      sourceHeaders: [
        {
          text: "Source",
          align: "start",
          sortable: false,
          value: "sourceKey",
        },
        {
          text: "Source dialect",
          align: "start",
          sortable: false,
          value: "sourceDialect",
        },
        {
          text: "Source name",
          align: "start",
          sortable: false,
          value: "sourceName",
        },
        {
          text: "Source ID",
          align: "start",
          sortable: false,
          value: "sourceId",
        },
      ],
    };
  },
  computed: {
    ...mapGetters(["getApiData"]),
  },
};
</script>

<style scoped></style>
