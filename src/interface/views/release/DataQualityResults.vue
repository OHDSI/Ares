<template>
  <v-responsive>
    <div v-if="!getErrors">
      <v-card :loading="!dataLoaded" elevation="10" class="ma-4">
        <v-tabs v-model="tab" dark>
          <v-tab href="#overview">Overview</v-tab>
          <v-tab href="#metadata">Metadata</v-tab>
          <v-tab href="#results">Results</v-tab>
          <v-tab href="#pivot">Pivot table</v-tab>
        </v-tabs>
        <v-tabs-items :value="tab">
          <v-tab-item v-if="dataLoaded" value="overview">
            <v-container fluid class="ma-2 pa-4">
              <table id="results">
                <thead>
                  <tr>
                    <td></td>
                    <td colspan="3" class="header text-center">Verification</td>
                    <td colspan="3" class="header text-center">Validation</td>
                    <td colspan="3" class="header text-center">Total</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td class="subheader text-center">Pass</td>
                    <td class="subheader text-center">Fail</td>
                    <td class="subheader text-center">Total</td>
                    <td class="subheader text-center">Pass</td>
                    <td class="subheader text-center">Fail</td>
                    <td class="subheader text-center">Total</td>
                    <td class="subheader text-center">Pass</td>
                    <td class="subheader text-center">Fail</td>
                    <td class="subheader text-center">Total</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="text-left header">Plausibility</td>
                    <td>{{ derivedResults.Verification.Plausibility.Pass }}</td>
                    <td>
                      {{ derivedResults.Verification.Plausibility.Fail }}
                    </td>
                    <td>
                      {{ derivedResults.Verification.Plausibility.Total }}
                    </td>
                    <td>{{ derivedResults.Validation.Plausibility.Pass }}</td>
                    <td>
                      {{ derivedResults.Validation.Plausibility.Fail }}
                    </td>
                    <td>{{ derivedResults.Validation.Plausibility.Total }}</td>
                    <td>{{ derivedResults.Total.Plausibility.Pass }}</td>
                    <td>
                      {{ derivedResults.Total.Plausibility.Fail }}
                    </td>
                    <td>{{ derivedResults.Total.Plausibility.Total }}</td>
                  </tr>
                  <tr>
                    <td class="text-left header">Conformance</td>
                    <td>{{ derivedResults.Verification.Conformance.Pass }}</td>
                    <td>
                      {{ derivedResults.Verification.Conformance.Fail }}
                    </td>
                    <td>{{ derivedResults.Verification.Conformance.Total }}</td>
                    <td>{{ derivedResults.Validation.Conformance.Pass }}</td>
                    <td>
                      {{ derivedResults.Validation.Conformance.Fail }}
                    </td>
                    <td>{{ derivedResults.Validation.Conformance.Total }}</td>
                    <td>{{ derivedResults.Total.Conformance.Pass }}</td>
                    <td>
                      {{ derivedResults.Total.Conformance.Fail }}
                    </td>
                    <td>{{ derivedResults.Total.Conformance.Total }}</td>
                  </tr>
                  <tr>
                    <td class="text-left header">Completeness</td>
                    <td>{{ derivedResults.Verification.Completeness.Pass }}</td>
                    <td>
                      {{ derivedResults.Verification.Completeness.Fail }}
                    </td>
                    <td>
                      {{ derivedResults.Verification.Completeness.Total }}
                    </td>
                    <td>{{ derivedResults.Validation.Completeness.Pass }}</td>
                    <td>
                      {{ derivedResults.Validation.Completeness.Fail }}
                    </td>
                    <td>{{ derivedResults.Validation.Completeness.Total }}</td>
                    <td>{{ derivedResults.Total.Completeness.Pass }}</td>
                    <td>
                      {{ derivedResults.Total.Completeness.Fail }}
                    </td>
                    <td>{{ derivedResults.Total.Completeness.Total }}</td>
                  </tr>
                  <tr>
                    <td class="text-left header">Total</td>
                    <td>{{ derivedResults.Verification.Total.Pass }}</td>
                    <td>
                      {{ derivedResults.Verification.Total.Fail }}
                    </td>
                    <td>{{ derivedResults.Verification.Total.Total }}</td>
                    <td>{{ derivedResults.Validation.Total.Pass }}</td>
                    <td>
                      {{ derivedResults.Validation.Total.Fail }}
                    </td>
                    <td>{{ derivedResults.Validation.Total.Total }}</td>
                    <td>{{ derivedResults.Total.Total.Pass }}</td>
                    <td>
                      {{ derivedResults.Total.Total.Fail }}
                    </td>
                    <td>{{ derivedResults.Total.Total.Total }}</td>
                  </tr>
                </tbody>
              </table>
              <infopanel
                details="The Data Quality Overview provides a summary
              of the results of the Data Quality assessment performed by the
              Data Quality Dashboard package."
                link="https://ohdsi.github.io/DataQualityDashboard/"
              ></infopanel>
            </v-container>
          </v-tab-item>
          <v-tab-item v-if="dataLoaded" value="metadata">
            <v-container fluid ma-2 pa-4>
              <v-row>
                <v-col cols="2">CDM Source Name</v-col>
                <v-col>{{ cdmSourceName }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">Description</v-col>
                <v-col>{{ sourceDescription }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">Licensee</v-col>
                <v-col>{{ cdmHolder }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">Source Released</v-col>
                <v-col>{{ sourceReleaseDate }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">CDM Released</v-col>
                <v-col>{{ cdmReleaseDate }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">CDM Version</v-col>
                <v-col>{{ cdmVersion }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">Vocabulary Version</v-col>
                <v-col>{{ vocabularyVersion }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">Source Documentation</v-col>
                <v-col>
                  {{ sourceDocumentationReference }}
                  <a :href="sourceDocumentationReference" target="_blank">
                    <v-icon right small color="primary">mdi-open-in-new</v-icon>
                  </a>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="2">ETL Reference</v-col>
                <v-col>
                  {{ cdmEtlReference }}
                  <a :href="cdmEtlReference" target="_blank">
                    <v-icon right small color="primary">mdi-open-in-new</v-icon>
                  </a>
                </v-col>
              </v-row>
            </v-container>
          </v-tab-item>
          <v-tab-item v-if="dataLoaded" value="results">
            <v-container fluid class="ma-2 pa-4">
              <v-row>
                <v-col cols="3">
                  <v-text-field
                    prepend-icon="mdi-magnify"
                    label="Search in Table"
                    single-line
                    hide-details
                    @input="delayedSearch"
                  ></v-text-field>
                </v-col>
                <v-col cols="auto">
                  <v-menu
                    v-model="chooseHeaderMenu"
                    bottom
                    :close-on-content-click="false"
                    :offset-y="getMenuOffset()"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn color="primary" v-bind="attrs" v-on="on">
                        <v-icon dark left>mdi-view-column-outline</v-icon>
                        Choose Columns to Display
                      </v-btn>
                    </template>
                    <v-list dense>
                      <v-list-item v-for="(h, i) in headers" :key="i">
                        <v-checkbox
                          v-model="selectedHeaders"
                          :label="h.text"
                          :value="h"
                          hide-details="auto"
                        ></v-checkbox>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-col>
                <v-col cols="auto">
                  <v-menu
                    v-model="chooseFilter"
                    bottom
                    :close-on-content-click="false"
                    :offset-y="getMenuOffset()"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn color="primary" v-bind="attrs" v-on="on">
                        <v-icon dark left>mdi-filter</v-icon>
                        Helpful Filters
                      </v-btn>
                    </template>
                    <v-list dense>
                      <v-list-item v-for="(f, i) in helpfulFilters" :key="i">
                        <v-checkbox
                          v-model="selectedFilter"
                          :label="f.text"
                          :value="f"
                          hide-details="auto"
                          :multiple="false"
                          @change="helpfulFilterUpdate(f.preset)"
                        ></v-checkbox>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-col>
              </v-row>
            </v-container>
            <v-data-table
              show-expand
              :headers="showHeaders"
              :items="filteredChecks"
              :footer-props="{
                'items-per-page-options': [5, 10, 25],
              }"
              item-key="checkId"
              :items-per-page="10"
              :search="search"
              dense
            >
              <template v-slot:body.prepend>
                <tr>
                  <th><v-icon>mdi-filter</v-icon></th>
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
              <template v-slot:expanded-item="{ headers, item }">
                <td class="text-left pa-4" :colspan="headers.length">
                  <v-row dense>
                    <v-col cols="2">Check Name</v-col>
                    <v-col>{{ item.CHECK_NAME }}</v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">Description</v-col>
                    <v-col
                      >{{ item.CHECK_DESCRIPTION }} (threshold
                      {{ item.THRESHOLD_VALUE }}%)</v-col
                    >
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">Threshold</v-col>
                    <v-col>{{ item.THRESHOLD_VALUE }}</v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">Notes</v-col>
                    <v-col>{{ item.NOTE_VALUE }}</v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">Level</v-col>
                    <v-col>{{ item.CHECK_LEVEL }}</v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">Table</v-col>
                    <v-col>
                      <a
                        :href="getDocumentationLink(item.CDM_TABLE_NAME)"
                        target="_blank"
                      >
                        {{ item.CDM_TABLE_NAME }}
                        <v-icon small>mdi-open-in-new</v-icon>
                      </a>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">Field</v-col>
                    <v-col>{{ item.CDM_FIELD_NAME }}</v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">Concept Id</v-col>
                    <v-col>
                      <router-link
                        v-if="item.CONCEPT_ID != undefined"
                        :to="getConceptDrilldown(item)"
                        color="primary"
                      >
                        {{ item.CONCEPT_ID }}
                        <v-icon small>mdi-open-in-new</v-icon>
                      </router-link>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">Unit Concept Id</v-col>
                    <v-col>{{ item.UNIT_CONCEPT_ID }}</v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2"># Rows Violated</v-col>
                    <v-col>{{ item.NUM_VIOLATED_ROWS }}</v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2"># Rows Total</v-col>
                    <v-col>{{ item.NUM_DENOMINATOR_ROWS }}</v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">% Rows Violated</v-col>
                    <v-col
                      >{{ (item.PCT_VIOLATED_ROWS * 100).toFixed(2) }} %</v-col
                    >
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">Execution Time</v-col>
                    <v-col>{{ item.EXECUTION_TIME }}</v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">SQL Query</v-col>
                    <v-col>
                      <codemirror
                        ref="myCm"
                        :value="item.QUERY_TEXT"
                        :options="cmOptions"
                        :events="['optionChange']"
                      ></codemirror>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">Errors</v-col>
                    <v-col>{{ item.ERROR }}</v-col>
                  </v-row>
                </td>
              </template>
              <template v-slot:item.FAILED="{ item }">{{
                item.FAILED
              }}</template>
              <template v-slot:item.checkId="{ item }">{{
                item.checkId
              }}</template>
              <template v-slot:item.SUBCATEGORY="{ item }">{{
                item.SUBCATEGORY == undefined ? d.SUBCATEGORY : "None"
              }}</template>
              <template v-slot:item.CHECK_DESCRIPTION="{ item }">{{
                renderDescription(item)
              }}</template>
              <template v-slot:item.PCT_VIOLATED_ROWS="{ item }">
                <div class="text-right">{{ renderPercentPassed(item) }} %</div>
              </template>
              <template v-slot:item.NUM_VIOLATED_ROWS="{ item }">
                <div class="text-right">
                  {{ formatThousands(item.NUM_VIOLATED_ROWS) }}
                </div>
              </template>
              <template v-slot:item.NUM_DENOMINATOR_ROWS="{ item }">
                <div class="text-right">
                  {{ formatThousands(item.NUM_DENOMINATOR_ROWS) }}
                </div>
              </template>
            </v-data-table>
          </v-tab-item>
          <v-tab-item v-if="dataLoaded" value="pivot">
            <v-container fluid>
              <Pivot
                :data="rawData.CheckResults"
                :event-listener="pivotRedirectToResultsTab"
                :attributes="[
                  'CATEGORY',
                  'CDM_FIELD_NAME',
                  'CHECK_LEVEL',
                  'CHECK_NAME',
                  'CONTEXT',
                  'NOTES_EXIST',
                  'SUBCATEGORY',
                  'CDM_TABLE_NAME',
                  'FAILED',
                ]"
              >
              </Pivot>
            </v-container>
          </v-tab-item>
        </v-tabs-items>
      </v-card>
    </div>
  </v-responsive>
</template>

<script>
import { codemirror } from "vue-codemirror";
import Pivot from "../../components/Pivot/Pivot";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/sql/sql";
import "codemirror/theme/neat.css";
import "codemirror/theme/base16-dark.css";
import infopanel from "../../components/InfoPanel.vue";
import * as d3 from "d3-format";
import { debounce } from "lodash";
import { FETCH_FILES } from "@/data/store/modules/view/actions.type";
import { QUALITY_RESULTS } from "@/data/services/getFilePath";
import { mapGetters } from "vuex";
import deriveResults from "@/services/derive-results";

export default {
  components: {
    codemirror,
    infopanel,
    Pivot,
  },
  data: function () {
    return {
      chooseHeaderMenu: false,
      chooseFilter: false,
      versions: [],
      currentTag: "",
      dataLoaded: false,
      dqResults: null,
      selection: [],
      rawData: [],
      defaultHeaders: [
        "FAILED",
        "PCT_VIOLATED_ROWS",
        "NUM_VIOLATED_ROWS",
        "CHECK_DESCRIPTION",
        "CDM_TABLE_NAME",
      ],
      derivedResults: {},
      helpfulFilters: [
        {
          text: "Failed Checks",
          key: "failed",
          preset: {
            FAILED: ["FAIL"],
            CDM_TABLE_NAME: [],
            CDM_FIELD_NAME: [],
            CHECK_NAME: [],
            NOTES_EXIST: [],
            CATEGORY: [],
            SUBCATEGORY: [],
            CONTEXT: [],
            CHECK_LEVEL: [],
          },
        },
        {
          text: "No Filters",
          key: "noFilters",
          preset: {
            FAILED: [],
            CDM_TABLE_NAME: [],
            CDM_FIELD_NAME: [],
            CHECK_NAME: [],
            NOTES_EXIST: [],
            CATEGORY: [],
            SUBCATEGORY: [],
            CONTEXT: [],
            CHECK_LEVEL: [],
          },
        },
      ],
      filters: {
        FAILED: [],
        CDM_TABLE_NAME: [],
        CDM_FIELD_NAME: [],
        CHECK_NAME: [],
        NOTES_EXIST: [],
        CATEGORY: [],
        SUBCATEGORY: [],
        CONTEXT: [],
        CHECK_LEVEL: [],
      },
      search: "",
      selectedHeaders: [],
      selectedFilter: null,
      headers: [
        {
          text: "Status",
          sortable: true,
          value: "FAILED",
        },
        {
          text: "Table",
          sortable: true,
          value: "CDM_TABLE_NAME",
        },
        {
          text: "Field",
          sortable: true,
          value: "CDM_FIELD_NAME",
        },
        {
          text: "Check",
          sortable: true,
          value: "CHECK_NAME",
        },
        {
          text: "Category",
          sortable: true,
          value: "CATEGORY",
        },
        {
          text: "Subcategory",
          sortable: true,
          value: "SUBCATEGORY",
        },
        {
          text: "Context",
          sortable: true,
          value: "CONTEXT",
        },
        {
          text: "Level",
          sortable: true,
          value: "CHECK_LEVEL",
        },
        {
          text: "Notes",
          sortable: true,
          value: "NOTES_EXIST",
        },
        {
          text: "Description",
          sortable: true,
          value: "CHECK_DESCRIPTION",
        },
        {
          text: "% Records Failed",
          sortable: true,
          value: "PCT_VIOLATED_ROWS",
        },
        {
          text: "# Records Failed",
          sortable: true,
          value: "NUM_VIOLATED_ROWS",
        },
        {
          text: "# Total Records",
          sortable: true,
          value: "NUM_DENOMINATOR_ROWS",
        },
        {
          text: "Execution Duration",
          sortable: true,
          value: "EXECUTION_TIME",
        },
      ],
    };
  },
  watch: {
    cdmParams() {
      this.load();
    },
    filterParams() {
      this.updateFiltersFromUrl();
      this.updateColumnsList();
    },
  },
  methods: {
    pivotRedirectToResultsTab: function (context) {
      const self = context;
      return {
        clickCallback: function (e, value, axisAttributes, pivotData) {
          if (value) {
            const params = Object.keys(self.getUniqueAttributeValues)
              .filter(
                (attribute) =>
                  Object.keys(axisAttributes).includes(attribute) ||
                  Object.keys(pivotData.props.valueFilter).includes(attribute)
              )
              .reduce(
                (acc, key) => ({
                  ...acc,
                  [key]: axisAttributes[key]
                    ? axisAttributes[key]
                    : Object.values(self.getUniqueAttributeValues[key]).filter(
                        (attrValue) =>
                          pivotData.props.valueFilter[key]
                            ? !Object.keys(
                                pivotData.props.valueFilter[key]
                              ).includes(attrValue)
                            : //empty strings are possible values, as such need additional checks for them, otherwise Object.keys returns an error
                              attrValue === ""
                      ),
                }),
                {}
              );
            self.$router.push({
              path:
                "/cdm/" +
                self.$route.params.cdm +
                "/" +
                self.$route.params.release +
                `/data_quality`,
              query: {
                tab: "results",
                ...params,
              },
            });
          }
        },
      };
    },
    updateFiltersFromUrl: function () {
      const parsedParams = JSON.parse(this.filterParams);
      this.helpfulFilterUpdate(
        Object.keys(parsedParams).reduce(
          (acc, key) => ({
            ...acc,
            [key]: Array.isArray(parsedParams[key])
              ? [...parsedParams[key]]
              : [parsedParams[key]],
          }),
          {}
        )
      );
    },
    updateColumnsList: function () {
      const parsedParams = JSON.parse(this.filterParams);
      this.selectedHeaders = this.headers.filter((h) =>
        [...this.defaultHeaders, ...Object.keys(parsedParams)].includes(h.value)
      );
    },
    delayedSearch: debounce(function (data) {
      this.search = data;
    }, 300),
    formatThousands: function (value) {
      return d3.format(",")(value);
    },
    helpfulFilterUpdate: function (filter) {
      this.filters = Object.keys(this.filters).reduce(
        (acc, key) => ({
          ...acc,
          [key]: filter[key] ? filter[key] : [],
        }),
        {}
      );
    },
    getMenuOffset: function () {
      return true;
    },
    //     path: "/_cdm/:cdm/:release/concept/:domain/:concept/summary",
    getConceptDrilldown: function (item) {
      return (
        "/cdm/" +
        this.$route.params.cdm +
        "/" +
        this.$route.params.release +
        "/concept/" +
        item.CDM_TABLE_NAME.toLowerCase() +
        "/" +
        item.CONCEPT_ID.toString().trim() +
        "/summary"
      );
    },
    getDocumentationLink: function (table) {
      return "https://ohdsi.github.io/CommonDataModel/cdm531.html#" + table;
    },
    load: function () {
      this.$store
        .dispatch(FETCH_FILES, {
          files: [{ name: QUALITY_RESULTS, required: true }],
        })
        .then(() => {
          if (!this.getErrors) {
            this.rawData = this.getData[QUALITY_RESULTS];
            this.derivedResults = deriveResults(this.getData[QUALITY_RESULTS]);
            if (this.$route.query.search) {
              this.search = this.$route.query.search;
            }
            this.dataLoaded = true;
          }
        });
    },
    columnValueList(val) {
      return this.checkResults.map((d) => d[val]);
    },
    renderDescription: function (d) {
      let thresholdMessage = "";
      if (d.THRESHOLD_VALUE != undefined) {
        thresholdMessage = " (Threshold=" + d.THRESHOLD_VALUE + "%).";
      }
      return d.CHECK_DESCRIPTION + thresholdMessage;
    },
    renderPercentPassed: function (d) {
      return d.PCT_VIOLATED_ROWS ? (d.PCT_VIOLATED_ROWS * 100).toFixed(2) : 0;
    },
  },
  created() {
    this.selectedHeaders = this.headers.filter((h) =>
      this.defaultHeaders.includes(h.value)
    );
    this.updateFiltersFromUrl();
    this.updateColumnsList();
    this.load();
  },
  computed: {
    ...mapGetters(["getData", "getErrors", "getSettings"]),
    cmOptions: function () {
      return {
        theme: this.getSettings.darkMode ? "base16-dark" : "neat",
        lineWrapping: true,
        tabSize: 2,
        mode: "text/x-sql",
        viewportMargin: Infinity,
        lineNumbers: true,
        autoRefresh: true,
      };
    },
    cdmParams: function () {
      return JSON.stringify(this.$route.params);
    },
    filterParams: function () {
      return JSON.stringify(
        Object.keys(this.$route.query)
          .filter((param) => param !== "tab")
          .reduce(
            (acc, key) => ({
              ...acc,
              [key]: this.$route.query[key],
            }),
            {}
          )
      );
    },
    tab: {
      set(tab) {
        this.$router.replace({ query: { ...this.$route.query, tab } });
      },
      get() {
        return this.$route.query.tab;
      },
    },
    filteredChecks() {
      return this.checkResults.filter((d) => {
        return Object.keys(this.filters).every((f) => {
          return this.filters[f].length < 1 || this.filters[f].includes(d[f]);
        });
      });
    },
    codemirror() {
      return this.$refs.myCm.codemirror;
    },
    showHeaders() {
      return this.headers.filter((s) => this.selectedHeaders.includes(s));
    },
    cdmSourceName() {
      return this.getData[QUALITY_RESULTS].Metadata[0].CDM_SOURCE_NAME;
    },
    sourceDescription() {
      return this.getData[QUALITY_RESULTS].Metadata[0].SOURCE_DESCRIPTION;
    },
    cdmHolder() {
      return this.getData[QUALITY_RESULTS].Metadata[0].CDM_HOLDER;
    },
    cdmEtlReference() {
      return this.getData[QUALITY_RESULTS].Metadata[0].CDM_ETL_REFERENCE;
    },
    sourceDocumentationReference() {
      return this.getData[QUALITY_RESULTS].Metadata[0]
        .SOURCE_DOCUMENTATION_REFERENCE;
    },
    cdmVersion() {
      return this.getData[QUALITY_RESULTS].Metadata[0].CDM_VERSION;
    },
    vocabularyVersion() {
      return this.getData[QUALITY_RESULTS].Metadata[0].VOCABULARY_VERSION;
    },
    sourceReleaseDate() {
      return this.getData[QUALITY_RESULTS].Metadata[0].SOURCE_RELEASE_DATE;
    },
    cdmReleaseDate() {
      return this.getData[QUALITY_RESULTS].Metadata[0].CDM_RELEASE_DATE;
    },
    checkResults() {
      return this.getData[QUALITY_RESULTS].CheckResults;
    },
  },
};
</script>

<style>
tr:hover {
  background-color: transparent !important;
}
.CodeMirror {
  height: auto;
}
.v-data-table-header th {
  white-space: nowrap;
}
.v-text-field {
  padding-top: 0px !important;
}
table#results {
  width: 100%;
}
table#results tr td.header {
  text-transform: uppercase;
  background-color: var(--v-accent-base);
}
table#results .subheader {
  text-transform: uppercase;
  background-color: var(--v-accent-base);
}
table#results {
  border-spacing: 2px;
}
table#results td {
  font-size: 14px;
  line-height: 30px;
  text-align: right;
}
table#results th {
  text-align: left;
}
table#results tbody td {
  padding: 0px 3px 0px 7px;
}
body {
  font-size: 14px;
}
a {
  text-decoration: none;
}
</style>
