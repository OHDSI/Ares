<template>
  <div>
    <div v-if="componentFailed">
      <error v-bind:text="errorText" v-bind:details="errorDetails"></error>
    </div>
    <v-card :loading="!dataLoaded" elevation="10" class="ma-4 pa-2">
      <v-card-title>Unmapped Source Codes</v-card-title>
      <v-row>
        <v-col cols="3">
          <v-text-field
            v-model="search"
            prepend-icon="mdi-magnify"
            label="Search in Table"
            single-line
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="9"> </v-col>
      </v-row>

      <v-data-table
        class="mt-4"
        dense
        :headers="showHeaders"
        :items="filteredRecords"
        :footer-props="{
          'items-per-page-options': [10, 50, 100],
        }"
        item-key="CONCEPT_ID"
        :items-per-page="10"
        :search="search"
        sort-by="RECORD_COUNT"
        :sort-desc="true"
      >
        <template v-slot:body.prepend>
          <tr>
            <th v-for="header in showHeaders" :key="header.text">
              <div v-if="filters.hasOwnProperty(header.value)">
                <v-select
                  small-chips
                  deletable-chips
                  hide-details
                  multiple
                  :items="columnValueList(header.value)"
                  v-model="filters[header.value]"
                ></v-select>
              </div>
            </th>
          </tr>
        </template>
        <template v-slot:item.CDM_TABLE_NAME="{ item }">
          {{ item.CDM_TABLE_NAME }}
        </template>
        <template v-slot:item.CDM_FIELD_NAME="{ item }">
          {{ item.CDM_FIELD_NAME }}
        </template>
        <template v-slot:item.SOURCE_VALUE="{ item }">
          {{ item.SOURCE_VALUE }}
        </template>
        <template v-slot:item.RECORD_COUNT="{ item }">
          <v-layout justify-end>{{ item.RECORD_COUNT }}</v-layout>
        </template>
      </v-data-table>
      <v-card-text>
        <v-icon small color="info" left>mdi-help-circle</v-icon>
        This report identifies columns in tables within the CDM where values are
        mapped to 0 (unknown concept). It provides a listing of all unmapped
        source values to be reviewed for potential inclusion or remediation.
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";
import * as d3 from "d3-dsv";
import error from "./Error.vue";

export default {
  data: function () {
    return {
      chooseHeaderMenu: false,
      componentFailed: false,
      errorText: "",
      errorDetails: "",
      dataLoaded: false,
      domainTable: [],
      search: "",
      selectedHeaders: [],
      headers: [],
      filters: {
        CDM_TABLE_NAME: [],
        CDM_FIELD_NAME: [],
      },
      headersMap: {
        CONCEPT_ID: {
          text: "CDM Table",
          sortable: true,
          value: "CDM_TABLE_NAME",
        },
        CONCEPT_NAME: {
          text: "CDM Field",
          sortable: true,
          value: "CDM_FIELD_NAME",
        },
        NUM_PERSONS: {
          text: "Source Value",
          sortable: true,
          value: "SOURCE_VALUE",
        },
        PERCENT_PERSONS: {
          text: "# Records",
          sortable: true,
          value: "RECORD_COUNT",
        },
      },
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
      return this.filteredRecords.map((d) => d[val]);
    },
    getReportRoute(id) {
      return (
        "/cdm/" +
        this.$route.params.cdm +
        "/" +
        this.$route.params.release +
        "/concept/" +
        id +
        "/summary"
      );
    },
    load() {
      var self = this;
      var dataUrl =
        "data/" +
        this.$route.params.cdm +
        "/" +
        this.$route.params.release +
        "/quality-completeness.csv";
      axios
        .get(dataUrl)
        .then((response) => {
          this.domainTable = d3.csvParse(response.data);
          this.dataLoaded = true;
          self.componentFailed = false;
        })
        .catch((err) => {
          self.componentFailed = true;
          self.errorText =
            "Failed to obtain unmapped source code table data file.";
          self.errorDetails = err + ". (" + dataUrl + ")";
        });
    },
  },
  created() {
    this.load();
    this.headers = Object.values(this.headersMap);
    this.selectedHeaders = this.headers.filter((h) =>
      [
        "CDM_TABLE_NAME",
        "CDM_FIELD_NAME",
        "SOURCE_VALUE",
        "RECORD_COUNT",
      ].includes(h.value)
    );
  },
  components: {
    error,
  },
  computed: {
    showHeaders() {
      return this.headers.filter((s) => this.selectedHeaders.includes(s));
    },
    filteredRecords() {
      return this.domainTable.filter((d) => {
        return Object.keys(this.filters).every((f) => {
          return this.filters[f].length < 1 || this.filters[f].includes(d[f]);
        });
      });
    },
  },
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