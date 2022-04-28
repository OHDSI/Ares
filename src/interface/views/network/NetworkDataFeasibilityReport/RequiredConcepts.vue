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
import { CONCEPT } from "@/data/services/getFilePath";
import { mapGetters } from "vuex";
import { FETCH_MULTIPLE_FILES_BY_SOURCE } from "@/data/store/modules/view/actions.type";
import * as d3Format from "d3-format";

export default {
  name: "RequiredConcepts",
  data: () => ({
    dialog: false,
    dialogDelete: false,
    errors: "",
    conceptsCount: 0,
    selectedDomain: [],
    selectedConcepts: [],
    rules: {
      required: (value) => !!value || "Required field",
      concept: (value) => {
        const pattern = /^\d+$/;
        return pattern.test(value) || "The field is digits only";
      },
    },
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
    conceptHeaders: [
      {
        text: "Concept ID",
        align: "start",
        sortable: false,
        value: "concept_id",
      },
      { text: "Concept Name", value: "concept_name" },
      { text: "Population", value: "population" },
      { text: "%", value: "percentage" },
      { text: "Time series", value: "time_series" },
      { text: "Issues", value: "issues" },
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

      { text: "Observation Period", value: "observation_period" },
    ],
    editedItem: {
      conceptID: "",
      domain: "",
    },
    defaultItem: {
      conceptID: "",
      domain: "",
    },
  }),

  computed: {
    ...mapGetters(["getData", "getSources"]),
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
    formatComma: function (value) {
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
      const inTheList = [
        ...this.sources.reduce(
          (prevValue, value) => [
            ...prevValue,
            ...value.concepts.filter(
              (concept) => concept.concept_id === this.editedItem.conceptID
            ),
          ],
          []
        ),
      ].length;
      if (inTheList) {
        this.errors = "Entered concept is already on the list";
        return;
      }

      this.$store
        .dispatch(FETCH_MULTIPLE_FILES_BY_SOURCE, {
          files: [CONCEPT],
          params: {
            concept: this.editedItem.conceptID,
            domain: this.editedItem.domain.value,
          },
          criticalError: false,
        })
        .then(() => {
          const conceptsData = this.getData[CONCEPT];
          const concepts = conceptsData.map((value) => ({
            concept_id: value?.data.CONCEPT_ID[0],
            concept_name: value?.data.CONCEPT_NAME[0],
            domain: value?.data.CDM_TABLE_NAME[0],
            population: value?.data.NUM_PERSONS[0],
            percentage: value?.data.PERCENT_PERSONS[0],
            cdm_name: value?.source.cdm_source_abbreviation,
            time_series: value?.data.IS_STATIONARY,
            issues: value?.data.COUNT_FAILED,
          }));

          if (concepts[0]?.concept_id && !inTheList) {
            this.conceptsCount += 1;
            this.sources.forEach((source) => {
              const sourceConcept = concepts.filter(
                (concept) => source.cdm_name === concept.cdm_name
              )[0];

              if (sourceConcept) {
                source.concepts.push(sourceConcept);
              }
            });
            this.close();
          } else {
            this.errors = "Entered concept is not found across data sources";
          }
        });
    },
  },
};
</script>

<style scoped></style>
