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
            <v-form v-if="env.WEB_API_ENABLED === 'true'" ref="form">
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
                          <v-col cols="4">
                            <v-text-field
                              v-model="query"
                              label="Search concepts"
                              placeholder="Your query"
                              @keyup.enter="searchApi"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="4">
                            <v-autocomplete
                              v-model="vocabularySource"
                              :items="apiSources"
                              item-text="sourceKey"
                              item-value="sourceKey"
                              auto-select-first
                              label="Vocabulary source"
                            >
                            </v-autocomplete>
                          </v-col>
                          <v-col>
                            <v-btn
                              color="primary"
                              elevation="0"
                              rounded
                              class="search-btn"
                              @click="searchApi"
                              >Search</v-btn
                            >
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col>
                            <v-data-table
                              :loading="getApiData.loading"
                              no-data-text="No concepts found"
                              item-key="CONCEPT_ID"
                              :items-per-page="5"
                              dense
                              :items="getApiData.data"
                              :headers="webapiHeaders"
                              loading-text="Loading concepts"
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
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close">
                    Close
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
            <v-form v-else>
              <v-card>
                <v-card-title>
                  <span class="text=h5">Add concepts</span>
                </v-card-title>
                <v-card-text>
                  <v-container fluid>
                    <v-row justify="space-between">
                      <v-col>
                        <v-text-field
                          v-model.number="editedItem.CONCEPT_ID"
                          :rules="[rules.required, rules.concept]"
                          prepend-icon="mdi-chart-timeline-variant-shimmer"
                          label="Concept ID"
                          dense
                          :success-messages="successMessage"
                          :error-messages="errors"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col>
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
                      <v-col>
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
import { webApiActions } from "@/shared/api/webAPI";
import { mixins } from "@/shared/lib/mixins";
import webApiKeyMap from "@/shared/config/webApiKeyMap";
import { ADD_ALERT } from "@/widgets/snackbar/model/store/actions.type";

export default {
  name: "RequiredConcepts",
  mixins: [mixins],
  data: () => ({
    addedConcepts: {},
    query: "",
    env: environment,
    dialog: false,
    errors: "",
    successMessage: [],
    apiSources: [],
    vocabularySource: "",
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
        sortable: true,
        value: "CONCEPT_ID",
      },
      {
        text: "Concept Name",
        align: "start",
        sortable: true,
        value: "CONCEPT_NAME",
      },
      {
        text: "Domain",
        align: "start",
        sortable: true,
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
    filterSourcesWithData: function () {
      this.$emit("overlappingDataChanged", this.filterSourcesWithData);
    },
    editedItem: {
      handler() {
        this.errors = "";
        this.successMessage = [];
      },
      deep: true,
    },
  },
  created() {
    this.$store.dispatch(webApiActions.FETCH_WEBAPI_INFO).then(() => {
      this.apiSources = this.getApiData.apiSources.filter((source) =>
        source.daimons
          .reduce((array, current) => [...array, current.daimonType], [])
          .includes("Vocabulary")
      );
      this.vocabularySource = this.apiSources[0].sourceKey;
    });
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
            source: value.source,
          }));
        });
    },
    searchApi: function () {
      if (!this.query.length) {
        return;
      }
      this.$store
        .dispatch(webApiActions.FETCH_VOCABULARY_SEARCH_RESULTS, {
          search: this.query,
          source: this.vocabularySource,
        })
        .then(() => {
          if (this.getApiData?.error?.name === "AxiosError") {
            this.$store.dispatch(ADD_ALERT, {
              message: "WebAPI server replied with status code",
              status: this.getApiData.error.response.status,
            });
          }
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
      this.$store.dispatch(webApiActions.RESET_API_STORAGE);
    },
    save(item) {
      if (this.env.WEB_API_ENABLED === "true" && !this.query.length) {
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
            this.errors = "Requested concept is not found across data sources";
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
          this.successMessage = ["Concept added"];
        });
    },
  },
};
</script>

<style scoped></style>
