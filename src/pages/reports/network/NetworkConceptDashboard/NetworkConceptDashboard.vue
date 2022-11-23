<template>
  <v-container fluid>
    <v-card class="elevation-10 pa-3 table-card">
      <v-card-actions class="flex justify-space-between">
        <v-card-title>Network Concept Dashboard</v-card-title>

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
          <ConceptSearchForm
            :added-concepts="addedConcepts"
            :success-message="successMessage"
            :errors="errors"
            @close="close"
            @save="(item) => save(item)"
            @inputChanged="clearMessages"
          />
        </v-dialog>
      </v-card-actions>
      <v-row class="table-container">
        <ve-table
          v-if="conceptData.length"
          :columns="headers"
          :table-data="conceptData"
        />
        <v-card-text v-else class="placeholder table-placeholder"
          >Add at least one concept to display the results</v-card-text
        >
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import { ConceptSearchForm } from "@/widgets/conceptSearchForm";
import { FETCH_MULTIPLE_FILES_BY_SOURCE } from "@/processes/exploreReports/model/store/actions.type";
import { CONCEPT } from "@/shared/config/files";
import webApiKeyMap from "@/shared/config/webApiKeyMap";
import environment from "@/shared/api/environment";
import Vue from "vue";
import { VeTable } from "vue-easytable";
import "./index.css";

Vue.use(VeTable);

export default {
  name: "NetworkConceptDashboard",
  components: { ConceptSearchForm, VeTable },
  data() {
    return {
      addedConcepts: {},
      conceptData: [],
      successMessage: [],
      errors: "",
      conceptsData: [],
      dialog: false,
      env: environment,
    };
  },
  methods: {
    getConceptsForRequest: function () {
      return this.conceptsData.map((value) => {
        return {
          concept_id: value?.data.CONCEPT_ID[0],
          concept_name: value?.data.CONCEPT_NAME[0],
          countPeople: value?.data.NUM_PERSONS[0],
          percentPeople: (value?.data.PERCENT_PERSONS[0] * 100).toFixed(2),
          cdm_name: value?.source.cdm_source_abbreviation,
        };
      });
    },
    clearMessages: function () {
      this.errors = "";
      this.successMessage = [];
    },
    addConceptToList: function (concepts) {
      this.conceptData = [
        ...this.conceptData,
        {
          ...concepts.reduce((acc, curr) => {
            return {
              ...acc,
              CONCEPT_ID: curr.concept_id,
              CONCEPT_NAME: curr.concept_name,
              [curr.cdm_name + "_count"]: curr.countPeople,
              [curr.cdm_name + "_percent"]: curr.percentPeople,
            };
          }, {}),
        },
      ];
    },
    save(item) {
      if (this.addedConcepts[item.CONCEPT_ID] === "Loaded") {
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

          this.addConceptToList(this.getConceptsForRequest());

          this.addedConcepts = {
            ...this.addedConcepts,
            [item.CONCEPT_ID]: "Loaded",
          };
          this.successMessage = ["Concept added"];
        });
    },
    close() {
      this.dialog = false;
    },
  },
  computed: {
    ...mapGetters(["getApiData", "getData"]),
    sources: function () {
      if (this.conceptData.length) {
        return this.conceptData.reduce((acc, curr) => {
          return [
            ...new Set([
              ...acc,
              ...Object.keys(curr)
                .filter(
                  (value) => value !== "CONCEPT_ID" && value !== "CONCEPT_NAME"
                )
                .map((value) => value.split("_")[0]),
            ]),
          ];
        }, []);
      } else {
        return [];
      }
    },
    headers: function () {
      return [
        {
          field: "CONCEPT_ID",
          key: "a",
          title: "Concept ID",
          align: "center",
          fixed: "left",
        },
        {
          field: "CONCEPT_NAME",
          key: "b",
          title: "Concept Name",
          align: "center",
          fixed: "left",
        },
        ...this.sources.map((value, index) => {
          return {
            title: value,
            children: [
              {
                field: `${value}_count`,
                key: index + "c",
                title: "# People",
                width: 100,
              },
              {
                field: `${value}_percent`,
                key: index + "d",
                title: "% People",
                width: 110,
              },
            ],
          };
        }),
      ];
    },
  },
};
</script>

<style scoped>
.table-card {
  padding: 10px;
  width: 100%;
  height: 100%;
}
.table-container {
  display: flex;
  justify-content: center;
  padding: 10px;
  min-height: 70vh;
}
.placeholder {
  text-align: center;
  align-self: center;
}
.table-placeholder {
  font-size: 1.5rem !important;
}
</style>
