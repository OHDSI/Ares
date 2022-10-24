<template>
  <v-container>
    <v-card
      v-if="Object.keys(getApiData).length"
      :loading="getApiData.loading"
      elevation="10"
      class="ma-4 pa-2"
    >
      <v-card-title>WebAPI details</v-card-title>
      <v-container v-if="getApiData.serviceDetails" fluid>
        <v-layout> </v-layout>
        <v-layout
          v-for="(value, propertyName) in getApiMetadata()"
          :key="propertyName"
          class="pl-8"
        >
          {{ propertyName }}: {{ value }}
        </v-layout>
      </v-container>
    </v-card>

    <v-card
      v-if="Object.keys(getApiData).length"
      elevation="10"
      class="ma-4 pa-2"
    >
      <v-data-table
        :loading="getApiData.loading"
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
  methods: {
    getApiMetadata: function () {
      const data = this.getApiData.serviceDetails;
      return {
        "WebAPI version": data.version,
        Timestamp: data.buildInfo.timestamp,
        Branch: data.buildInfo.branch,
        "Commit ID": data.buildInfo.commitId,
      };
    },
  },
  computed: {
    ...mapGetters(["getApiData"]),
  },
};
</script>

<style scoped></style>
