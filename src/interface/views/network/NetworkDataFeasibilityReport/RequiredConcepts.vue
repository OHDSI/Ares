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
      <template v-slot:top>
        <v-toolbar flat>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                dark
                color="grey darken-4"
                class="mb-2"
                v-bind="attrs"
                v-on="on"
              >
                Add concept
              </v-btn>
            </template>
            <v-form ref="form">
              <v-card>
                <v-card-title>
                  <span class="text-h5">New Concept</span>
                </v-card-title>

                <v-card-text>
                  <v-container fluid>
                    <v-row>
                      <v-col cols="auto">
                        <v-text-field
                          v-model.number="editedItem.conceptID"
                          :rules="[rules.required, rules.concept]"
                          prepend-icon="mdi-chart-timeline-variant-shimmer"
                          label="Concept ID"
                          dense
                          :error-messages="errors"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col cols="auto">
                        <v-autocomplete
                          v-model="editedItem.domain"
                          :rules="[rules.required]"
                          label="Domain"
                          return-object
                          prepend-icon="mdi-folder"
                          dense
                          :items="domains"
                        >
                        </v-autocomplete>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close">
                    Cancel
                  </v-btn>
                  <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5"
                >Are you sure you want to delete this item?</v-card-title
              >
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete"
                  >Cancel</v-btn
                >
                <v-btn color="blue darken-1" text @click="deleteItemConfirm"
                  >OK</v-btn
                >
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.min_population="{ item }">{{
        formatComma(item.min_population) || "No data"
      }}</template>
      <template v-slot:item.max_population="{ item }">{{
        formatComma(item.max_population) || "No data"
      }}</template>
      <template v-slot:item.concepts.length="{ item }">{{
        `${item.concepts.length}/${conceptsCount}`
      }}</template>
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <v-data-table
            :hide-default-footer="true"
            :disable-pagination="true"
            dense
            :headers="conceptHeaders"
            :items="item.concepts"
            class="elevation-1 accent"
          >
            <template v-slot:item.time_series="{ item }">{{
              item.time_series
                ? item.time_series[0] === false
                  ? "Non-stationary"
                  : "Stationary"
                : "No data"
            }}</template>
            <template v-slot:item.issues="{ item }">{{
              item.issues ? item.issues[0] : ""
            }}</template>
            <template v-slot:item.percentage="{ item }">{{
              (item.percentage * 100).toFixed(2) || "No data"
            }}</template>
            <template v-slot:item.population="{ item }">{{
              formatComma(item.population)
            }}</template>
            <template v-slot:item.measurement="{ item }">{{
              !item.measurement
                ? isNaN(item.measurement)
                  ? "No data"
                  : "N/A"
                : item.measurement
            }}</template>
          </v-data-table>
        </td>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
      </template>
      <template v-slot:no-data>
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
import { CONCEPT, DOMAIN_SUMMARY } from "@/data/services/getFilePath";
import { mapGetters } from "vuex";
import { FETCH_MULTIPLE_FILES_BY_SOURCE } from "@/data/store/modules/view/actions.type";
import * as d3Format from "d3-format";
import * as d3Import from "d3-dsv";

export default {
  name: "RequiredConcepts",
  data: () => ({
    dialog: false,
    dialogDelete: false,
    errors: "",
    conceptsCount: 0,
    conceptData: [],
    selectedDomain: [],
    domainSummary: [],
    selectedConcepts: [],
    rules: {
      required: value => !!value || "Required field",
      concept: value => {
        const pattern = /^\d+$/;
        return pattern.test(value) || "The field is digits only";
      }
    },
    headers: [
      {
        text: "Source",
        align: "start",
        sortable: false,
        value: "cdm_name"
      },
      { text: "Issues", value: "issues" },
      { text: "Time-series issues", value: "time_series_issues" },
      { text: "Available concepts", value: "concepts.length" },
      { text: "Min population", value: "min_population" },
      { text: "Max population", value: "max_population" }
    ],
    concepts: [],
    expanded: [],
    sources: [],
    domains: [
      { text: "Condition occurrence", value: "condition_occurrence" },
      { text: "Drug Exposure", value: "drug_exposure" },
      { text: "Device Exposure", value: "device_exposure" },
      { text: "Measurement", value: "measurement" },

      { text: "Death", value: "death" },

      { text: "Procedure Occurrence", value: "procedure_occurrence" },

      { text: "Observation", value: "observation" }
    ],
    editedItem: {
      conceptID: "",
      domain: ""
    },
    defaultItem: {
      conceptID: "",
      domain: ""
    }
  }),

  computed: {
    ...mapGetters(["getData", "getSources"]),
    filterSourcesWithData: function() {
      return this.sources.filter(data => data.concepts.length);
    },
    getSourcesOverview: function() {
      return this.filterSourcesWithData.map(value => ({
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
        issues: value.concepts.filter(value => value.issues === false).length,
        time_series_issues: value.concepts.filter(value =>
          value.time_series ? value.time_series[0] === false : false
        ).length
      }));
    },
    conceptHeaders: function() {
      return [
        {
          text: "Concept ID",
          align: "start",
          sortable: false,
          value: "concept_id",
          show: true
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
            ...this.getSourcesOverview.map(value =>
              value.concepts.filter(concept => concept.domain === "MEASUREMENT")
            )
          ].filter(value => value.length).length
        }
      ].filter(header => header.show);
    }
  },
  watch: {
    dialog(val) {
      val || this.close();
      if (this.$refs?.form) {
        this.$refs.form.resetValidation();
      }
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
    filterSourcesWithData: function() {
      this.$emit("overlappingDataChanged", this.filterSourcesWithData);
    },
    editedItem: {
      handler() {
        this.errors = "";
      },
      deep: true
    }
  },
  created() {
    this.sources = this.getSources.map(value => ({
      cdm_name: value.cdm_source_abbreviation,
      concepts: []
    }));
  },

  methods: {
    getDomainSummary: function() {
      return this.$store
        .dispatch(FETCH_MULTIPLE_FILES_BY_SOURCE, {
          files: [DOMAIN_SUMMARY],
          params: {
            concept: this.conceptsData[0].data.CONCEPT_ID[0],
            domain: "measurement"
          },
          criticalError: false
        })
        .then(() => {
          return this.getData[DOMAIN_SUMMARY].map(value => ({
            parsedData: d3Import.csvParse(value.data),
            source: value.source.cdm_source_abbreviation
          }));
        });
    },

    addConceptToList: function(concepts) {
      if (concepts[0]?.concept_id && !this.isLoaded()) {
        this.conceptsCount += 1;
        this.sources.forEach(source => {
          const sourceConcept = concepts.filter(
            concept => source.cdm_name === concept.cdm_name
          )[0];

          if (sourceConcept) {
            source.concepts.push(sourceConcept);
          }
        });
        this.close();
      } else {
        this.errors = "Entered concept is not found across data sources";
      }
    },
    getConceptsForRequest: function(measurement = []) {
      return this.conceptsData.map(value => {
        const missingData = measurement.length
          ? measurement
              .filter(
                source =>
                  source.source === value.source?.cdm_source_abbreviation
              )[0]
              ?.parsedData.filter(
                summaryReport =>
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
            : null
        };
      });
    },
    isLoaded: function() {
      return [
        ...this.sources.reduce(
          (prevValue, value) => [
            ...prevValue,
            ...value.concepts.filter(
              concept => concept.concept_id === this.editedItem.conceptID
            )
          ],
          []
        )
      ].length;
    },
    formatComma: function(value) {
      return d3Format.format(",")(value);
    },
    deleteItem(item) {
      this.editedIndex = this.concepts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      this.concepts.splice(this.editedIndex, 1);
      this.closeDelete();
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    save() {
      if (this.editedItem.conceptID === "" || this.editedItem.domain === "") {
        return;
      }
      if (this.isLoaded()) {
        this.errors = "Entered concept is already on the list";
        return;
      }

      this.$store
        .dispatch(FETCH_MULTIPLE_FILES_BY_SOURCE, {
          files: [CONCEPT],
          params: {
            concept: this.editedItem.conceptID,
            domain: this.editedItem.domain.value
          },
          criticalError: false
        })
        .then(() => {
          this.conceptsData = this.getData[CONCEPT];
          if (this.conceptsData[0]?.data?.CDM_TABLE_NAME[0] === "MEASUREMENT") {
            this.getDomainSummary().then(value => {
              this.addConceptToList(this.getConceptsForRequest(value));
            });
          } else {
            this.addConceptToList(this.getConceptsForRequest());
          }
        });
    }
  }
};
</script>

<style scoped></style>
