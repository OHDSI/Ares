<template>
  <v-responsive>
    <div v-if="!getErrors">
      <v-card :loading="!dataInStore" elevation="10" class="ma-4">
        <v-tabs v-model="tab" dark>
          <v-tab href="#overview">Overview</v-tab>
          <v-tab href="#metadata">Metadata</v-tab>
          <v-tab href="#results">Results</v-tab>
          <v-tab href="#pivot">Pivot table</v-tab>
        </v-tabs>
        <v-tabs-items :value="tab">
          <v-tab-item v-if="dataInStore" value="overview">
            <v-container fluid class="ma-2 pa-4">
              <table id="results">
                <thead>
                  <tr>
                    <td></td>
                    <td colspan="5" class="header text-center">Verification</td>
                    <td colspan="5" class="header text-center">Validation</td>
                    <td colspan="5" class="header text-center">Total</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td class="subheader text-center">Pass</td>
                    <td class="subheader text-center">Fail</td>
                    <td class="subheader text-center">Error</td>
                    <td class="subheader text-center">N/A</td>
                    <td class="subheader text-center">Total</td>
                    <td class="subheader text-center">Pass</td>
                    <td class="subheader text-center">Fail</td>
                    <td class="subheader text-center">Error</td>
                    <td class="subheader text-center">N/A</td>
                    <td class="subheader text-center">Total</td>
                    <td class="subheader text-center">Pass</td>
                    <td class="subheader text-center">Fail</td>
                    <td class="subheader text-center">Error</td>
                    <td class="subheader text-center">N/A</td>
                    <td class="subheader text-center">Total</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="text-left header">Plausibility</td>
                    <td>
                      {{
                        getData.derivedResults.Verification.Plausibility.Pass
                      }}
                    </td>
                    <td>
                      {{
                        getData.derivedResults.Verification.Plausibility.Fail
                      }}
                    </td>
                    <td>
                      {{
                        getData.derivedResults.Verification.Plausibility.Error
                      }}
                    </td>
                    <td>
                      {{
                        getData.derivedResults.Verification.Plausibility
                          .NotApplicable
                      }}
                    </td>
                    <td>
                      {{
                        getData.derivedResults.Verification.Plausibility.Total
                      }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Validation.Plausibility.Pass }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Validation.Plausibility.Fail }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Validation.Plausibility.Error }}
                    </td>
                    <td>
                      {{
                        getData.derivedResults.Validation.Plausibility
                          .NotApplicable
                      }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Validation.Plausibility.Total }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Total.Plausibility.Pass }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Total.Plausibility.Fail }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Total.Plausibility.Error }}
                    </td>
                    <td>
                      {{
                        getData.derivedResults.Total.Plausibility.NotApplicable
                      }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Total.Plausibility.Total }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-left header">Conformance</td>
                    <td>
                      {{ getData.derivedResults.Verification.Conformance.Pass }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Verification.Conformance.Fail }}
                    </td>
                    <td>
                      {{
                        getData.derivedResults.Verification.Conformance.Error
                      }}
                    </td>
                    <td>
                      {{
                        getData.derivedResults.Verification.Conformance
                          .NotApplicable
                      }}
                    </td>
                    <td>
                      {{
                        getData.derivedResults.Verification.Conformance.Total
                      }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Validation.Conformance.Pass }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Validation.Conformance.Fail }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Validation.Conformance.Error }}
                    </td>
                    <td>
                      {{
                        getData.derivedResults.Validation.Conformance
                          .NotApplicable
                      }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Validation.Conformance.Total }}
                    </td>
                    <td>{{ getData.derivedResults.Total.Conformance.Pass }}</td>
                    <td>
                      {{ getData.derivedResults.Total.Conformance.Fail }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Total.Conformance.Error }}
                    </td>
                    <td>
                      {{
                        getData.derivedResults.Total.Conformance.NotApplicable
                      }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Total.Conformance.Total }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-left header">Completeness</td>
                    <td>
                      {{
                        getData.derivedResults.Verification.Completeness.Pass
                      }}
                    </td>
                    <td>
                      {{
                        getData.derivedResults.Verification.Completeness.Fail
                      }}
                    </td>
                    <td>
                      {{
                        getData.derivedResults.Verification.Completeness.Error
                      }}
                    </td>
                    <td>
                      {{
                        getData.derivedResults.Verification.Completeness
                          .NotApplicable
                      }}
                    </td>
                    <td>
                      {{
                        getData.derivedResults.Verification.Completeness.Total
                      }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Validation.Completeness.Pass }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Validation.Completeness.Fail }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Validation.Completeness.Error }}
                    </td>
                    <td>
                      {{
                        getData.derivedResults.Validation.Completeness
                          .NotApplicable
                      }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Validation.Completeness.Total }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Total.Completeness.Pass }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Total.Completeness.Fail }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Total.Completeness.Error }}
                    </td>
                    <td>
                      {{
                        getData.derivedResults.Total.Completeness.NotApplicable
                      }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Total.Completeness.Total }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-left header">Total</td>
                    <td>
                      {{ getData.derivedResults.Verification.Total.Pass }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Verification.Total.Fail }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Verification.Total.Error }}
                    </td>
                    <td>
                      {{
                        getData.derivedResults.Verification.Total.NotApplicable
                      }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Verification.Total.Total }}
                    </td>
                    <td>{{ getData.derivedResults.Validation.Total.Pass }}</td>
                    <td>
                      {{ getData.derivedResults.Validation.Total.Fail }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Validation.Total.Error }}
                    </td>
                    <td>
                      {{
                        getData.derivedResults.Validation.Total.NotApplicable
                      }}
                    </td>
                    <td>{{ getData.derivedResults.Validation.Total.Total }}</td>
                    <td>{{ getData.derivedResults.Total.Total.Pass }}</td>
                    <td>
                      {{ getData.derivedResults.Total.Total.Fail }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Total.Total.Error }}
                    </td>
                    <td>
                      {{ getData.derivedResults.Total.Total.NotApplicable }}
                    </td>
                    <td>{{ getData.derivedResults.Total.Total.Total }}</td>
                  </tr>
                </tbody>
              </table>
              <infopanel
                details="The Data Quality Overview provides a summary
              of the results of the Data Quality assessment performed by the
              Data Quality Dashboard package."
                :link="getDataQualityDashboardLink()"
              ></infopanel>
            </v-container>
          </v-tab-item>
          <v-tab-item v-if="dataInStore" value="metadata">
            <v-container fluid ma-2 pa-4>
              <v-row>
                <v-col cols="2">CDM Source Name</v-col>
                <v-col>{{ getData.cdmSourceName }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">Description</v-col>
                <v-col>{{ getData.sourceDescription }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">Licensee</v-col>
                <v-col>{{ getData.cdmHolder }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">Source Released</v-col>
                <v-col>{{ getData.sourceReleaseDate }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">CDM Released</v-col>
                <v-col>{{ getData.cdmReleaseDate }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">CDM Version</v-col>
                <v-col>{{ getData.cdmVersion }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">Vocabulary Version</v-col>
                <v-col>{{ getData.vocabularyVersion }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">Source Documentation</v-col>
                <v-col>
                  {{ getData.sourceDocumentationReference }}
                  <a
                    :href="getData.sourceDocumentationReference"
                    target="_blank"
                  >
                    <v-icon right small color="primary">mdi-open-in-new</v-icon>
                  </a>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="2">ETL Reference</v-col>
                <v-col>
                  {{ getData.cdmEtlReference }}
                  <a :href="getData.cdmEtlReference" target="_blank">
                    <v-icon right small color="primary">mdi-open-in-new</v-icon>
                  </a>
                </v-col>
              </v-row>
            </v-container>
          </v-tab-item>
          <v-tab-item v-if="dataInStore" value="results">
            <v-container fluid class="ma-2 pa-4">
              <v-row>
                <v-col cols="3">
                  <v-text-field
                    prepend-icon="mdi-magnify"
                    label="Search in Table"
                    single-line
                    hide-details
                    @input="debouncedSearch"
                  ></v-text-field>
                </v-col>
                <v-col cols="auto">
                  <SelectColumns :headers="headers" />
                </v-col>
                <v-col cols="auto">
                  <v-menu
                    v-model="chooseFilter"
                    bottom
                    :close-on-content-click="false"
                    :offset-y="true"
                  >
                    <template #activator="{ on, attrs }">
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
              <template #body.prepend>
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
                        :items="
                          getValuesArray(getData.checkResults, header.value)
                        "
                      >
                      </v-select>
                    </div>
                  </th>
                </tr>
              </template>
              <template #expanded-item="{ headers, item }">
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
                        :href="getDocsLink(item.CDM_TABLE_NAME)"
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
              <template #item.SUBCATEGORY="{ item }">{{
                item.SUBCATEGORY == undefined ? d.SUBCATEGORY : "None"
              }}</template>
              <template #item.CHECK_DESCRIPTION="{ item }">{{
                renderDescription(item)
              }}</template>
              <template #item.PCT_VIOLATED_ROWS="{ item }">
                <div class="text-right">{{ renderPercentPassed(item) }} %</div>
              </template>
              <template #item.NUM_VIOLATED_ROWS="{ item }">
                <div class="text-right">
                  {{ formatComma(item.NUM_VIOLATED_ROWS) }}
                </div>
              </template>
              <template #item.NUM_DENOMINATOR_ROWS="{ item }">
                <div class="text-right">
                  {{ formatComma(item.NUM_DENOMINATOR_ROWS) }}
                </div>
              </template>
            </v-data-table>
          </v-tab-item>
          <v-tab-item v-if="dataInStore" value="pivot">
            <v-container fluid>
              <Pivot
                :data="getData.rawData.CheckResults"
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
                :aggregator-names-list="['Count']"
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
import Pivot from "../../../widgets/pivot";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/sql/sql";
import "codemirror/theme/neat.css";
import "codemirror/theme/base16-dark.css";
import infopanel from "../../../widgets/infoPanel";
import { mapGetters } from "vuex";
import { mixins } from "@/shared/lib/mixins";
import { getLinks } from "@/shared/config/links";
import SelectColumns from "@/features/selectColumns";

export default {
  components: {
    SelectColumns,
    codemirror,
    infopanel,
    Pivot,
  },
  mixins: [mixins, getLinks],
  data: function () {
    return {
      chooseFilter: false,
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
            NOT_APPLICABLE: [],
            IS_ERROR: [],
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
            NOT_APPLICABLE: [],
            IS_ERROR: [],
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
        NOT_APPLICABLE: [],
        IS_ERROR: [],
      },
      search: "",
      selectedFilter: null,
      headers: [
        {
          text: "Status",
          sortable: true,
          value: "FAILED",
          show: true,
          default: true,
        },
        {
          text: "N/A",
          sortable: true,
          value: "NOT_APPLICABLE",
          show: true,
          default: true,
        },
        {
          text: "Error",
          sortable: true,
          value: "IS_ERROR",
          show: true,
          default: true,
        },
        {
          text: "Table",
          sortable: true,
          value: "CDM_TABLE_NAME",
          show: true,
          default: true,
        },
        {
          text: "Field",
          sortable: true,
          value: "CDM_FIELD_NAME",
          show: false,
        },
        {
          text: "Check",
          sortable: true,
          value: "CHECK_NAME",
          show: false,
        },
        {
          text: "Category",
          sortable: true,
          value: "CATEGORY",
          show: false,
        },
        {
          text: "Subcategory",
          sortable: true,
          value: "SUBCATEGORY",
          show: false,
        },
        {
          text: "Context",
          sortable: true,
          value: "CONTEXT",
          show: false,
        },
        {
          text: "Level",
          sortable: true,
          value: "CHECK_LEVEL",
          show: false,
        },
        {
          text: "Notes",
          sortable: true,
          value: "NOTES_EXIST",
          show: false,
        },
        {
          text: "Description",
          sortable: true,
          value: "CHECK_DESCRIPTION",
          show: true,
          default: true,
        },
        {
          text: "% Records Failed",
          sortable: true,
          value: "PCT_VIOLATED_ROWS",
          show: true,
          default: true,
        },
        {
          text: "# Records Failed",
          sortable: true,
          value: "NUM_VIOLATED_ROWS",
          show: true,
          default: true,
        },
        {
          text: "# Total Records",
          sortable: true,
          value: "NUM_DENOMINATOR_ROWS",
          show: false,
        },
        {
          text: "Execution Duration",
          sortable: true,
          value: "EXECUTION_TIME",
          show: false,
        },
      ],
    };
  },
  watch: {
    filterParams() {
      this.updateFiltersFromUrl();
      this.updateColumnsList();
    },
  },
  created() {
    this.updateFiltersFromUrl();
    this.updateColumnsList();
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
      const parsedParams = Object.keys(JSON.parse(this.filterParams));
      this.headers = this.headers.map((header) => {
        if (parsedParams.includes(header.value)) {
          return { ...header, show: true };
        } else {
          if (header.default) {
            return header;
          } else {
            return { ...header, show: false };
          }
        }
      });
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
    getConceptDrilldown: function (item) {
      return {
        name: "networkConcept",
        params: {
          domain: item.CDM_TABLE_NAME.toLowerCase(),
          concept: item.CONCEPT_ID.toString().trim(),
        },
      };
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
  computed: {
    ...mapGetters(["getData", "getErrors", "getSettings", "dataInStore"]),
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
      return this.getData.checkResults.filter((d) => {
        return Object.keys(this.filters).every((f) => {
          return this.filters[f].length < 1 || this.filters[f].includes(d[f]);
        });
      });
    },
    showHeaders() {
      return this.headers.filter((header) => header.show);
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
