<template>
  <v-container fluid>
    <v-data-table
      class="mb-4"
      show-expand
      item-key="cdm_name"
      :expanded.sync="expanded"
      :headers="headers"
      :items="getSourcesOverview"
      sort-by="calories"
    >
      <template #top>
        <v-toolbar flat>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="1000px">
            <template #activator="{ on, attrs }">
              <v-btn
                dark
                color="grey darken-4"
                class="mb-2"
                v-bind="attrs"
                v-on="on"
              >
                Add concepts
              </v-btn>
            </template>
            <v-form ref="form">
              <v-card>
                <v-card-title>
                  <span v-if="env.WEB_API_ENABLED === 'true'" class="text-h5"
                    >Vocabulary search</span
                  >
                  <span v-else class="text=h5">Add concepts</span>
                </v-card-title>

                <v-card-text>
                  <v-container fluid>
                    <v-row>
                      <v-col>
                        <v-row>
                          <v-col v-if="env.WEB_API_ENABLED === 'true'" cols="4">
                            <v-text-field
                              v-if="env.WEB_API_ENABLED === 'true'"
                              :value="$route.query.search"
                              label="Search concepts"
                              placeholder="Your query"
                              @input="debouncedSearch"
                            ></v-text-field>
                          </v-col>
                          <v-col v-else>
                            <v-text-field
                              v-model.number="editedItem.CONCEPT_ID"
                              :rules="[rules.required, rules.concept]"
                              prepend-icon="mdi-chart-timeline-variant-shimmer"
                              label="Concept ID"
                              dense
                              :error-messages="errors"
                            >
                            </v-text-field>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col v-if="env.WEB_API_ENABLED === 'true'">
                            <v-data-table
                              no-data-text="No concepts found"
                              item-key="CONCEPT_ID"
                              :items-per-page="5"
                              :items="getApiData.data"
                              :headers="webapiHeaders"
                            >
                              <template #item.actions="{ item }">
                                <v-icon
                                  v-if="!addedConcepts[item.CONCEPT_ID]"
                                  @click="save(item)"
                                  >mdi-plus</v-icon
                                >
                                <v-icon
                                  v-if="
                                    addedConcepts[item.CONCEPT_ID] ===
                                    'Not found'
                                  "
                                  >mdi-close-octagon</v-icon
                                >
                                <v-icon
                                  v-if="
                                    addedConcepts[item.CONCEPT_ID] === 'Loaded'
                                  "
                                  >mdi-check</v-icon
                                >
                              </template>
                            </v-data-table>
                          </v-col>
                          <v-col v-else>
                            <v-autocomplete
                              v-model="editedItem.DOMAIN_ID"
                              :rules="[rules.required]"
                              label="Domain"
                              prepend-icon="mdi-folder"
                              dense
                              :items="domains"
                            >
                            </v-autocomplete>
                          </v-col>
                        </v-row>
                      </v-col>
                      <v-col v-if="env.WEB_API_ENABLED === 'false'">
                        <v-btn
                          color="blue darken-1"
                          text
                          @click="save(editedItem)"
                        >
                          Add
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close">
                    Close
                  </v-btn>
                  <!--                  <v-btn color="blue darken-1" text @click="save"> Add </v-btn>-->
                </v-card-actions>
              </v-card>
            </v-form>
          </v-dialog>
        </v-toolbar>
      </template>
      <template #item.min_population="{ item }">{{
        formatComma(item.min_population) || "No data"
      }}</template>
      <template #item.max_population="{ item }">{{
        formatComma(item.max_population) || "No data"
      }}</template>
      <template #item.concepts.length="{ item }">{{
        `${item.concepts.length}/${addedConceptsCount}`
      }}</template>
      <template #expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <v-data-table
            :hide-default-footer="true"
            :disable-pagination="true"
            dense
            :headers="conceptHeaders"
            :items="item.concepts"
            class="elevation-1 accent"
          >
            <template #item.time_series="{ item }">{{
              item.time_series
                ? item.time_series[0] === false
                  ? "Non-stationary"
                  : "Stationary"
                : "No data"
            }}</template>
            <template #item.issues="{ item }">{{
              item.issues ? item.issues[0] : ""
            }}</template>
            <template #item.percentage="{ item }">{{
              (item.percentage * 100).toFixed(2) || "No data"
            }}</template>
            <template #item.population="{ item }">{{
              formatComma(item.population)
            }}</template>
            <template #item.measurement="{ item }">{{
              !item.measurement
                ? isNaN(item.measurement)
                  ? "No data"
                  : "N/A"
                : item.measurement
            }}</template>
          </v-data-table>
        </td>
      </template>
      <template #no-data>
        <div>No concepts selected</div>
      </template>
    </v-data-table>
    <v-divider></v-divider>
    <v-alert color="grey darken-3" dark dense icon="mdi-help-rhombus" prominent>
      The overview section uses the smallest population count of all added
      concepts in estimations.
    </v-alert>
  </v-container>
</template>

<script>
import { CONCEPT, DOMAIN_SUMMARY } from "@/shared/config/files";
import environment from "@/shared/api/environment";
import { mapGetters } from "vuex";
import { FETCH_MULTIPLE_FILES_BY_SOURCE } from "@/processes/exploreReports/model/store/actions.type";
import {
  FETCH_VOCABULARY_SEARCH_RESULTS,
  FETCH_WEBAPI,
  RESET_API_STORAGE,
} from "@/shared/api/webAPI/store/actions.type";
import { mixins } from "@/shared/lib/mixins";
import webApiKeyMap from "@/shared/config/webApiKeyMap";

export default {
  name: "RequiredConcepts",
  mixins: [mixins],
  data: () => ({
    addedConcepts: {},
    env: environment,
    dialog: false,
    errors: "",
    conceptData: [],
    rules: {
      required: (value) => !!value || "Required field",
      concept: (value) => {
        const pattern = /^\d+$/;
        return pattern.test(value) || "The field is digits only";
      },
    },
    webapiHeaders: [
      {
        text: "Concept ID",
        align: "start",
        sortable: false,
        value: "CONCEPT_ID",
      },
      {
        text: "Concept Name",
        align: "start",
        sortable: false,
        value: "CONCEPT_NAME",
      },
      {
        text: "Domain",
        align: "start",
        sortable: false,
        value: "DOMAIN_ID",
      },
      { text: "", value: "actions", sortable: false },
    ],
    headers: [
      {
        text: "Source",
        align: "start",
        sortable: false,
        value: "cdm_name",
      },
      { text: "Issues", value: "issues" },
      { text: "Time-series issues", value: "time_series_issues" },
      { text: "Available concepts", value: "concepts.length" },
      { text: "Min population", value: "min_population" },
      { text: "Max population", value: "max_population" },
    ],
    expanded: [],
    sources: [],
    domains: [
      { text: "Condition occurrence", value: "Condition" },
      { text: "Drug Exposure", value: "Drug" },
      { text: "Device Exposure", value: "Device" },
      { text: "Measurement", value: "Measurement" },
      { text: "Procedure Occurrence", value: "Procedure" },
      { text: "Observation", value: "Observation" },
    ],
    editedItem: {
      CONCEPT_ID: "",
      DOMAIN_ID: "",
    },
    defaultItem: {
      CONCEPT_ID: "",
      DOMAIN_ID: "",
    },
  }),

  computed: {
    query: function () {
      return this.$route.query.search;
    },
    addedConceptsCount: function () {
      return Object.keys(this.addedConcepts).filter(
        (key) => this.addedConcepts[key] === "Loaded"
      ).length;
    },
    ...mapGetters(["getData", "getSources", "getApiData"]),
    filterSourcesWithData: function () {
      return this.sources.filter((data) => data.concepts.length);
    },
    getSourcesOverview: function () {
      return this.filterSourcesWithData.map((value) => ({
        ...value,
        min_population: Math.min(
          ...value.concepts.reduce(
            (prev, current) => [...prev, current.population],
            []
          )
        ),
        max_population: Math.max(
          ...value.concepts.reduce(
            (prev, current) => [...prev, current.population],
            []
          )
        ),
        issues: value.concepts.filter((value) => value.issues === false).length,
        time_series_issues: value.concepts.filter((value) =>
          value.time_series ? value.time_series[0] === false : false
        ).length,
      }));
    },
    conceptHeaders: function () {
      return [
        {
          text: "Concept ID",
          align: "start",
          sortable: false,
          value: "concept_id",
          show: true,
        },
        { text: "Concept Name", value: "concept_name", show: true },
        { text: "Domain", value: "domain", show: true },
        { text: "Population", value: "population", show: true },
        { text: "%", value: "percentage", show: true },
        { text: "Time series", value: "time_series", show: true },
        { text: "Issues", value: "issues", show: true },
        {
          text: "% with values",
          value: "measurement",
          show: [
            ...this.getSourcesOverview.map((value) =>
              value.concepts.filter(
                (concept) => concept.domain === "MEASUREMENT"
              )
            ),
          ].filter((value) => value.length).length,
        },
      ].filter((header) => header.show);
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
      if (this.$refs?.form) {
        this.$refs.form.resetValidation();
      }
    },
    query() {
      if (this.query && this.query !== "") {
        this.searchApi();
      }
    },
    filterSourcesWithData: function () {
      this.$emit("overlappingDataChanged", this.filterSourcesWithData);
    },
    editedItem: {
      handler() {
        this.errors = "";
      },
      deep: true,
    },
  },
  created() {
    this.sources = this.getSources.map((value) => ({
      cdm_name: value.cdm_source_abbreviation,
      concepts: [],
    }));
  },

  methods: {
    getDomainSummary: function () {
      return this.$store
        .dispatch(FETCH_MULTIPLE_FILES_BY_SOURCE, {
          files: [
            {
              name: DOMAIN_SUMMARY,
              instanceParams: [{ domain: "measurement", concept: "" }],
            },
          ],
          criticalError: false,
        })
        .then(() => {
          return this.getData.domainSummary.map((value) => ({
            parsedData: value.data,
            source: value.source.cdm_source_abbreviation,
          }));
        });
    },
    searchApi: function () {
      this.$store.dispatch(FETCH_VOCABULARY_SEARCH_RESULTS, {
        search: this.$route.query.search,
      });
    },
    addConceptToList: function (concepts) {
      this.sources.forEach((source) => {
        const sourceConcept = concepts.filter(
          (concept) => source.cdm_name === concept.cdm_name
        );
        if (sourceConcept.length) {
          source.concepts.push(...sourceConcept);
        }
      });
    },
    getConceptsForRequest: function (measurement = []) {
      return this.conceptsData.map((value) => {
        const missingData = measurement.length
          ? measurement
              .filter(
                (source) =>
                  source.source === value.source?.cdm_source_abbreviation
              )[0]
              ?.parsedData.filter(
                (summaryReport) =>
                  summaryReport.CONCEPT_ID == value?.data.CONCEPT_ID[0]
              )[0].PERCENT_MISSING_VALUES
          : [];
        return {
          concept_id: value?.data.CONCEPT_ID[0],
          concept_name: value?.data.CONCEPT_NAME[0],
          domain: value?.data.CDM_TABLE_NAME[0],
          population: value?.data.NUM_PERSONS[0],
          percentage: value?.data.PERCENT_PERSONS[0],
          cdm_name: value?.source.cdm_source_abbreviation,
          time_series: value?.data.IS_STATIONARY,
          issues: value?.data.COUNT_FAILED,
          measurement: measurement.length
            ? (1 - missingData) * (100).toFixed(2)
            : null,
        };
      });
    },
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
      });
      this.$router.replace({
        ...this.$router.currentRoute,
        query: {},
      });
      this.$store.dispatch(RESET_API_STORAGE);
    },
    save(item) {
      if (
        this.env.WEB_API_ENABLED === "true" &&
        !this.$route.query?.search?.length
      ) {
        return;
      } else if (
        this.editedItem.CONCEPT_ID === "" &&
        this.editedItem.domain === ""
      ) {
        return;
      } else if (this.addedConcepts[item.CONCEPT_ID] === "Loaded") {
        this.errors = "This concept has already been loaded";
        return;
      }
      this.$store
        .dispatch(FETCH_MULTIPLE_FILES_BY_SOURCE, {
          files: [
            {
              name: CONCEPT,
              instanceParams: [
                {
                  domain: webApiKeyMap.domains[item.DOMAIN_ID],
                  concept: item.CONCEPT_ID,
                },
              ],
            },
          ],
          criticalError: false,
        })
        .then(() => {
          this.conceptsData = this.getData.concept;
          if (!this.conceptsData.length) {
            this.errors = "Requested concept is not found across data bases";
            this.addedConcepts = {
              ...this.addedConcepts,
              [item.CONCEPT_ID]: "Not found",
            };
            return;
          }
          const withMeasurement = this.conceptsData.filter(
            (value) => value.data.CDM_TABLE_NAME[0] === "MEASUREMENT"
          );
          if (withMeasurement.length) {
            this.getDomainSummary().then((value) => {
              this.addConceptToList(this.getConceptsForRequest(value));
            });
          } else {
            this.addConceptToList(this.getConceptsForRequest());
          }
          this.addedConcepts = {
            ...this.addedConcepts,
            [item.CONCEPT_ID]: "Loaded",
          };
        });
    },
  },
};
</script>

<style scoped></style>
