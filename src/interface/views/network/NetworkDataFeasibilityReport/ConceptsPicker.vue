<template>
  <v-data-table
    show-expand
    item-key="conceptID[0]"
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
                      label="Domain"
                      return-object
                      prepend-icon="mdi-folder"
                      auto-select-first
                      dense
                      :items="switchDomains"
                      @input="
                        (data) => {
                          editedItem.domain = data;
                        }
                      "
                    >
                    </v-autocomplete>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
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
          :items="item.dataSources"
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
</template>

<script>
import { CONCEPT, QUALITY_RESULTS } from "@/data/services/getFilePath";
import { mapGetters } from "vuex";
import {
  FETCH_FILES,
  FETCH_MULTIPLE_FILES_BY_SOURCE,
} from "@/data/store/modules/view/actions.type";
import { CLEAR_DATA } from "@/data/store/modules/view/mutations.type";

export default {
  name: "Table",
  data: () => ({
    dialog: false,
    dialogDelete: false,
    headers: [
      {
        text: "Concept Name",
        align: "start",
        sortable: false,
        value: "name",
      },
      { text: "Concept ID", value: "conceptID" },
      { text: "Domain", value: "domain" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    sourceHeaders: [
      { text: "Source", align: "start", sortable: false, value: "source" },
      { text: "Number of People", value: "people" },
      { text: "Percent", value: "percentPeople" },
      { text: "Issues", value: "issues" },
    ],
    concepts: [],
    expanded: [],
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
          ...value.dataSources.map((data) => ({
            conceptID: value.conceptID[0],
            source: data,
          })),
        ],
        []
      );
      return conceptArray.filter(
        (concept) =>
          conceptArray.filter(
            (source) => concept.source.source === source.source.source
          ).length === this.concepts.length
      );
    },

    getPercentageBySource: function () {
      return this.filterOverlappingSources.map((concept) => {});
    },
  },
  props: {
    switchDomains: { type: Array, required: true, default: () => [] },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  created() {
    this.initialize();
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
            domain: this.editedItem.domain,
          },
        })
        .then(() => {
          const conceptsData = this.getData[CONCEPT];
          const concept = {
            conceptID: conceptsData[0].data.CONCEPT_ID,
            name: conceptsData[0].data.CONCEPT_NAME,
            domain: conceptsData[0].data.CDM_TABLE_NAME,
            dataSources: [],
          };
          conceptsData.forEach((file) => {
            this.$store
              .dispatch(FETCH_FILES, {
                files: [{ name: QUALITY_RESULTS, required: false }],
                params: {
                  cdm: file.source.cdm_source_key,
                  release: file.source.releases[0].release_id,
                },
              })
              .then(() => {
                concept["dataSources"].push({
                  source: file.source.cdm_source_abbreviation,
                  people: file.data.NUM_PERSONS[0],
                  percentPeople: file.data.PERCENT_PERSONS[0],
                  issues: this.getData[QUALITY_RESULTS].CheckResults.filter(
                    (data) => {
                      return (
                        data.CONCEPT_ID?.trim() ==
                          conceptsData[0].data.CONCEPT_ID && data.FAILED == 1
                      );
                    }
                  )[0]?.CHECK_DESCRIPTION,
                });
                this.$store.dispatch(CLEAR_DATA);
              });
          });
          return new Promise((resolve) => {
            resolve(concept);
          });
        })
        .then((res) => {
          this.concepts = [...this.concepts, res];
        });
    },
  },
};
</script>

<style scoped></style>
