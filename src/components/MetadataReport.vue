<template>
  <div>
    <div v-if="componentFailed">
      <error v-bind:text="errorText" v-bind:details="errorDetails"></error>
      <ReturnButton block />
    </div>
    <v-card :loading="!cdmsourceDataLoaded" elevation="10" class="ma-4 pa-2">
      <v-card-title>CDM Source Details</v-card-title>
      <v-container v-if="cdmsourceDataLoaded">
        <v-layout v-for="(d, i) in cdmsourceData.columns" :key="i" class="pl-8">
          {{ d }}: {{ cdmsourceData[0][d] }}
        </v-layout>
      </v-container>
      <v-card-text>
        <v-icon left color="info" small>mdi-help-circle</v-icon>CDM Source
        Details are derived from the CDM_SOURCE table.
      </v-card-text>
    </v-card>

    <v-card :loading="!metadataDataLoaded" elevation="10" class="ma-4 pa-2">
      <v-card-title>Metadata</v-card-title>
      <v-container v-if="metadataDataLoaded">
        <v-layout v-for="(m, mi) in metadataData" :key="mi">
          <v-layout
            v-for="(mc, mci) in metadataData.columns"
            :key="mci"
            class="pl-8"
          >
            {{ mc }}: {{ metadataData[mi][mc] }}
          </v-layout>
        </v-layout>
      </v-container>
      <v-card-text>
        <v-icon left color="info" small>mdi-help-circle</v-icon>Metadata is
        derived from the METADATA table.
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";
import * as d3 from "d3-dsv";
import error from "./Error.vue";
import ReturnButton from "@/components/ReturnButton";

export default {
  data: function () {
    return {
      cdmsourceData: null,
      metadataData: null,
      cdmsourceDataLoaded: false,
      metadataDataLoaded: false,
      componentFailed: false,
      errorText: "",
      errorDetails: "",
      dataLoaded: false,
      domainTable: [],
      search: "",
    };
  },
  watch: {
    $route() {
      this.load();
    },
  },
  methods: {
    getMenuOffset: function () {
      return true;
    },
    columnValueList(val) {
      return this.domainTable.map((d) => d[val]);
    },
    load() {
      var self = this;
      var metadataUrl =
        "data/" +
        this.$route.params.cdm +
        "/" +
        this.$route.params.release +
        "/metadata.csv";
      var cdmsourceUrl =
        "data/" +
        this.$route.params.cdm +
        "/" +
        this.$route.params.release +
        "/cdmsource.csv";

      axios
        .get(metadataUrl)
        .then((response) => {
          self.metadataData = d3.csvParse(response.data);
          self.metadataDataLoaded = true;
          self.componentFailed = false;
        })
        .catch((err) => {
          self.componentFailed = true;
          self.errorText = "Failed to obtain metadata table data file.";
          self.errorDetails = err + ". (" + metadataUrl + ")";
        });

      axios
        .get(cdmsourceUrl)
        .then((response) => {
          self.cdmsourceData = d3.csvParse(response.data);
          self.cdmsourceDataLoaded = true;
          self.componentFailed = false;
        })
        .catch((err) => {
          self.componentFailed = true;
          self.errorText = "Failed to obtain cdmsource table data file.";
          self.errorDetails = err + ". (" + cdmsourceUrl + ")";
        });
    },
  },
  created() {
    this.load();
  },
  components: {
    error,
    ReturnButton
  },
  computed: {},
  props: {
    resultFile: String,
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
