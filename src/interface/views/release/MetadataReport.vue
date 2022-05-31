<template>
  <div v-if="!getErrors">
    <v-card :loading="!getData.cdmsourceData" elevation="10" class="ma-4 pa-2">
      <v-card-title>CDM Source Details</v-card-title>
      <v-container v-if="getData.cdmsourceData" fluid>
        <v-layout
          v-for="(d, i) in getData.cdmsourceData.columns"
          :key="i"
          class="pl-8"
        >
          {{ d }}: {{ getData.cdmsourceData[0][d] }}
        </v-layout>
      </v-container>
      <v-card-text>
        <v-icon left color="info" small>mdi-help-circle</v-icon>CDM Source
        Details are derived from the CDM_SOURCE table.
      </v-card-text>
    </v-card>
    <v-card :loading="!getData.metadataData" elevation="10" class="ma-4 pa-2">
      <v-card-title>Metadata</v-card-title>
      <v-container v-if="getData.metadataData" fluid>
        <v-data-table
          v-if="getData"
          class="mt-4"
          dense
          :headers="headers"
          :items="getData.metadataData"
        >
        </v-data-table>
      </v-container>
      <v-card-text>
        <v-icon left color="info" small>mdi-help-circle</v-icon>Metadata is
        derived from the METADATA table.
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import * as d3 from "d3-dsv";
import { FETCH_FILES } from "@/data/store/modules/view/actions.type";
import { CDM_SOURCE, METADATA } from "@/data/services/getFilePath";
import { mapGetters } from "vuex";

export default {
  components: {},
  props: {
    resultFile: String,
  },
  data: function () {
    return {
      cdmsourceData: null,
      metadataData: null,
      cdmsourcegetData: false,
      metadatagetData: false,
      domainTable: [],
      search: "",
      headers: [
        {
          text: "METADATA_CONCEPT_ID",
          sortable: true,
          value: "METADATA_CONCEPT_ID",
          align: "start",
        },
        {
          text: "NAME",
          sortable: true,
          value: "NAME",
          align: "start",
        },
        {
          text: "VALUE_AS_STRING",
          sortable: true,
          value: "VALUE_AS_STRING",
          align: "start",
        },
        {
          text: "VALUE_AS_CONCEPT_ID",
          sortable: true,
          value: "VALUE_AS_CONCEPT_ID",
          align: "start",
        },
        {
          text: "METADATA_DATE",
          sortable: true,
          value: "METADATA_DATE",
          align: "start",
        },
        {
          text: "METADATA_DATETIME",
          sortable: true,
          value: "METADATA_DATETIME",
          align: "start",
        },
      ],
    };
  },
  computed: {
    ...mapGetters(["getData", "getErrors"]),
  },
  methods: {
    columnValueList(val) {
      return this.domainTable.map((d) => d[val]);
    },
  },
};
</script>

<style scoped>
td {
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
