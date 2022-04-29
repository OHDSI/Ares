<template>
  <div>
    <v-container v-if="dataLoaded && !getErrors" fluid class="pa-1">
      <v-card elevation="10" class="ma-4 pa-2">
        <v-card-title>Performance</v-card-title>
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
            'items-per-page-options': [10, 50, 100]
          }"
          item-key="CONCEPT_ID"
          :items-per-page="10"
          :search="search"
        >
          <template v-slot:body.prepend>
            <tr>
              <th v-for="header in showHeaders" :key="header.text">
                <div v-if="filters.hasOwnProperty(header.value)">
                  <v-select
                    v-model="filters[header.value]"
                    small-chips
                    deletable-chips
                    hide-details
                    multiple
                    :items="columnValueList(header.value)"
                  ></v-select>
                </div>
              </th>
            </tr>
          </template>
          <template v-slot:item.analysis_id="{ item }">
            <v-layout justify-end
              ><a target="_new" :href="getAnalysisLink(item.analysis_id)">{{
                item.analysis_id
              }}</a></v-layout
            >
          </template>
          <template v-slot:item.elapsed_seconds="{ item }">
            <v-layout justify-end>{{ item.elapsed_seconds }}</v-layout>
          </template>
        </v-data-table>

        <v-card-text>
          <v-icon left color="primary">mdi-help-circle</v-icon>This report
          describes how long each analysis executed during
          <a target="_new" href="https://github.com/ohdsi/achilles">Achilles</a>
          characterization took to run in seconds.
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import * as d3 from "d3-dsv";
import { FETCH_FILES } from "@/data/store/modules/view/actions.type";
import { ACHILLES_PERFORMANCE } from "@/data/services/getFilePath";
import { mapGetters } from "vuex";

export default {
  components: {},
  props: {
    resultFile: String
  },
  data: function() {
    return {
      chooseHeaderMenu: false,
      dataLoaded: false,
      domainTable: [],
      search: "",
      selectedHeaders: [],
      headers: [],
      filters: {
        /*
        CDM_TABLE_NAME: [],
        CDM_FIELD_NAME: [],
        */
      },
      headersMap: {
        analysis_id: {
          text: "Analysis Id",
          sortable: true,
          value: "analysis_id"
        },
        CONCEPT_NAME: {
          text: "Analysis Name",
          sortable: true,
          value: "analysis_name"
        },
        NUM_PERSONS: {
          text: "Duration (seconds)",
          sortable: true,
          value: "elapsed_seconds"
        }
      }
    };
  },
  computed: {
    ...mapGetters(["getData", "getErrors"]),
    showHeaders() {
      return this.headers.filter(s => this.selectedHeaders.includes(s));
    },
    filteredRecords() {
      return this.domainTable.filter(d => {
        return Object.keys(this.filters).every(f => {
          return this.filters[f].length < 1 || this.filters[f].includes(d[f]);
        });
      });
    }
  },
  watch: {
    $route() {
      this.load();
    }
  },
  created() {
    this.load();
    this.headers = Object.values(this.headersMap);
    this.selectedHeaders = this.headers.filter(h =>
      ["analysis_id", "analysis_name", "elapsed_seconds"].includes(h.value)
    );
  },
  methods: {
    getAnalysisLink: function(id) {
      return (
        "https://github.com/OHDSI/Achilles/blob/master/inst/sql/sql_server/analyses/" +
        id +
        ".sql"
      );
    },
    getMenuOffset: function() {
      return true;
    },
    columnValueList(val) {
      return this.domainTable.map(d => d[val]);
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
      this.dataLoaded = false;
      this.$store
        .dispatch(FETCH_FILES, {
          files: [{ name: ACHILLES_PERFORMANCE, required: true }]
        })
        .then(() => {
          if (!this.getErrors) {
            this.domainTable = d3.csvParse(this.getData[ACHILLES_PERFORMANCE]);
            this.dataLoaded = true;
          }
        });
    }
  }
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
