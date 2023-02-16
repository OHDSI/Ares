<template>
  <v-container fluid>
    <v-card class="elevation-10 pa-3">
      <v-card-actions class="flex justify-space-between">
        <v-card-title>Network Concept Dashboard</v-card-title>
        <v-dialog v-model="dialog" max-width="1000px">
          <template #activator="{ props }">
            <v-btn dark color="grey darken-4" class="mb-2" v-bind="props">
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
        <v-data-table
          v-if="conceptData.length"
          :group-by="[{ key: 'CONCEPT_NAME' }]"
          density="compact"
          :headers="headers"
          :items="conceptData"
        >
        </v-data-table>
        <v-card-text v-else class="placeholder table-placeholder"
          >Add at least one concept to display the results</v-card-text
        >
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ConceptSearchForm } from "@/widgets/conceptSearchForm";
import { FETCH_MULTIPLE_FILES_BY_SOURCE } from "@/processes/exploreReports/model/store/actions.type";
import { CONCEPT } from "@/shared/config/files";
import { VDataTable } from "vuetify/labs/VDataTable";
import webApiKeyMap from "@/shared/config/webApiKeyMap";
import "./index.css";

import { computed, Ref, ref } from "vue";
import { useStore } from "vuex";
const store = useStore();

const addedConcepts = ref({});
const conceptData = ref([]);
const successMessage: Ref<string[]> = ref([]);
const errors: Ref<string> = ref("");
const conceptsData = ref([]);
const dialog: Ref<boolean> = ref(false);

const getConceptsForRequest = function () {
  return conceptsData.value.map((value) => {
    return {
      concept_id: value?.data.CONCEPT_ID[0],
      concept_name: value?.data.CONCEPT_NAME[0],
      countPeople: value?.data.NUM_PERSONS[0],
      percentPeople: (value?.data.PERCENT_PERSONS[0] * 100).toFixed(2),
      cdm_name: value?.source.cdm_source_abbreviation,
    };
  });
};
const clearMessages = function () {
  errors.value = "";
  successMessage.value = [];
};

const addConceptToList = function (concepts) {
  conceptData.value = [
    ...conceptData.value,

    ...concepts.map((curr) => {
      return {
        CONCEPT_ID: curr.concept_id,
        CONCEPT_NAME: curr.concept_name,
        CDM_NAME: curr.cdm_name,
        PEOPLE_COUNT: curr.countPeople,
        PEOPLE_PERCENT: curr.percentPeople,
      };
    }, {}),
  ];
};

const save = function (item) {
  if (addedConcepts.value[item.CONCEPT_ID] === "Loaded") {
    errors.value = "This concept has already been loaded";
    return;
  }
  store
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
      conceptsData.value = store.getters.getData.concept;
      if (!conceptsData.value.length) {
        errors.value = "Requested concept is not found across data sources";
        addedConcepts.value = {
          ...addedConcepts.value,
          [item.CONCEPT_ID]: "Not found",
        };
        return;
      }

      addConceptToList(getConceptsForRequest());

      addedConcepts.value = {
        ...addedConcepts.value,
        [item.CONCEPT_ID]: "Loaded",
      };
      successMessage.value = ["Concept added"];
    });
};
const close = function () {
  dialog.value = false;
};
const headers = computed(function () {
  return [
    {
      key: "CDM_NAME",
      title: "Source",
    },
    {
      key: "CONCEPT_ID",
      title: "Concept ID",
      align: "center",
    },
    {
      key: `PEOPLE_COUNT`,
      title: "# People",
    },
    {
      key: "PEOPLE_PERCENT",
      title: "% People",
    },
  ];
});
</script>
<script lang="ts">
export default {
  name: "NetworkConceptDashboard",
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
