<template>
  <v-card elevation="10" class="ma-4" pa-2>
    <v-data-table
      show-expand
      item-key="concept_id"
      :expanded.sync="expanded"
      :headers="headers"
      :items="concepts"
      sort-by="calories"
      class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Required Concepts</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                Add concept
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="text-h5">New Concept</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="auto">
                      <v-text-field
                        v-model="editedItem.conceptID"
                        prepend-icon="mdi-chart-timeline-variant-shimmer"
                        label="Concept ID"
                        dense
                      >
                      </v-text-field>
                    </v-col>
                    <v-col cols="auto">
                      <v-autocomplete
                        v-model="editedItem.domain"
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
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <v-data-table
            :hide-default-footer="true"
            :disable-pagination="true"
            dense
            :headers="sourceHeaders"
            :items="item.data_source_list"
            class="elevation-1 grey lighten-3"
          >
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
  </v-card>
</template>

<script>
import { CONCEPT } from "@/data/services/getFilePath";
import { mapGetters } from "vuex";
import { FETCH_MULTIPLE_FILES_BY_SOURCE } from "@/data/store/modules/view/actions.type";

export default {
  name: "RequiredConcepts",
  data: () => ({
    dialog: false,
    dialogDelete: false,
    selectedDomain: [],
    headers: [
      {
        text: "Concept Name",
        align: "start",
        sortable: false,
        value: "concept_name",
      },
      { text: "Concept ID", value: "concept_id" },
      { text: "Domain", value: "domain" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    sourceHeaders: [
      { text: "Source", align: "start", sortable: false, value: "cdm_name" },
      { text: "Number of People", value: "population" },
      { text: "Percent", value: "percentage" },
      { text: "Issues", value: "issues" },
    ],
    concepts: [],
    expanded: [],
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
      conceptID: 0,
      domain: "",
    },
    defaultItem: {
      conceptID: "",
      domain: "",
    },
  }),

  computed: {
    ...mapGetters(["getData", "getSources"]),
    filterOverlappingSources: function () {
      const conceptArray = this.concepts.reduce(
        (array, value) => [
          ...array,
          ...value.data_source_list.map((data) => ({
            concept_id: value.concept_id[0],
            source: data,
          })),
        ],
        []
      );
      return conceptArray
        .filter(
          (concept) =>
            conceptArray.filter(
              (source) => concept.source.cdm_name === source.source.cdm_name
            ).length === this.concepts.length
        )
        .reduce(
          (prevValue, current) => ({
            ...prevValue,
            [current.source.cdm_name]: prevValue[current.source.cdm_name]
              ? [
                  ...prevValue[current.source.cdm_name],
                  {
                    concept: current.concept_id,
                    value: current.source.percentage,
                  },
                ]
              : [
                  {
                    concept: current.concept_id,
                    value: current.source.percentage,
                  },
                ],
          }),
          {}
        );
    },
  },
  props: {},

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
    filterOverlappingSources: function () {
      this.$emit("overlappingDataChanged", this.filterOverlappingSources);
    },
  },

  methods: {
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
      this.close();
      this.$store
        .dispatch(FETCH_MULTIPLE_FILES_BY_SOURCE, {
          files: [CONCEPT],
          params: {
            concept: this.editedItem.conceptID,
            domain: this.editedItem.domain.value,
          },
        })
        .then(() => {
          const conceptsData = this.getData[CONCEPT];
          const concept = {
            concept_id: conceptsData[0].data.CONCEPT_ID,
            concept_name: conceptsData[0].data.CONCEPT_NAME,
            domain: conceptsData[0].data.CDM_TABLE_NAME,
            data_source_list: conceptsData.map((value) => ({
              cdm_name: value.source.cdm_source_abbreviation,
              population: value.data.NUM_PERSONS[0],
              percentage: value.data.PERCENT_PERSONS[0],
              issues: value.data.IS_STATIONARY
                ? value.data.IS_STATIONARY[0]
                  ? "Non-stationary time series"
                  : "No"
                : "No data",
            })),
          };
          this.concepts = [...this.concepts, concept];
        });
    },
  },
};
</script>

<style scoped></style>
