<template>
  <Panel header="Network Concept Dashboard">
    <template #icons>
      <Button @click="dialog = !dialog" plain>
        <span class="uppercase font-thin text-grey">Add concepts </span></Button
      >
    </template>
    <div class="table-container">
      <DataTable
        removable-sort
        rowGroupMode="subheader"
        groupRowsBy="CONCEPT_NAME"
        class="table"
        v-if="conceptData.length"
        size="small"
        paginator
        :value="conceptData"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column sortable header="Source" field="CDM_NAME"></Column>
        <Column sortable header="Concept Name" field="CONCEPT_NAME"></Column>

        <Column sortable header="Concept ID" field="CONCEPT_ID"></Column>
        <Column sortable header="# People" field="PEOPLE_COUNT">
          <template #body="slotProps">
            {{ helpers.formatComma(slotProps.data.PEOPLE_COUNT) }}
          </template>
        </Column>
        <Column sortable header="% People" field="PEOPLE_PERCENT">
          <template #body="slotProps">
            {{ slotProps.data.PEOPLE_PERCENT }}%
          </template>
        </Column>
      </DataTable>
      <div v-else class="placeholder table-placeholder">
        Add at least one concept to display the results
      </div>
    </div>
  </Panel>
  <ConceptSearchForm
    :added-concepts="addedConcepts"
    :success-message="successMessage"
    :errors="errors"
    @close="close"
    @save="(item) => save(item)"
    @inputChanged="clearMessages"
    :show="dialog"
  />
</template>

<script setup lang="ts">
import { ConceptSearchForm } from "@/widgets/conceptSearchForm";
import { FETCH_MULTIPLE_FILES_BY_SOURCE } from "@/processes/exploreReports/model/store/actions.type";
import { CONCEPT } from "@/shared/config/files";
import webApiKeyMap from "@/shared/config/webApiKeyMap";
import "./index.css";

import { computed, Ref, ref } from "vue";
import { useStore } from "vuex";
import Panel from "primevue/panel";
import Button from "primevue/button";
const store = useStore();

import { helpers } from "@/shared/lib/mixins";
import { links } from "@/shared/config/links";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import environment from "@/shared/api/environment";
import getDuckDBTables from "@/shared/api/duckdb/conceptTables";
import { CONCEPT_METADATA } from "@/shared/api/duckdb/files";


const addedConcepts = ref({});
const conceptData = ref([]);
const successMessage: Ref<string[]> = ref([]);
const errors: Ref<string> = ref("");
const conceptsData = ref([]);
const dialog: Ref<boolean> = ref(false);

function combineObjectsBySource(inputObject) {
  const resultArray = [];
  const sources = inputObject[CONCEPT_METADATA].map((data) => data.source);

  sources.forEach((source) => {
    const combinedData = {};

    for (const key in inputObject) {
      if (key !== "domainSummary") {
        const fieldArray = inputObject[key];
        const matchingItem = fieldArray.find(
          (item) => item.source.cdm_source_key === source.cdm_source_key
        );
        combinedData[key] = matchingItem ? matchingItem.data : null;
      } else {
        combinedData[key] = inputObject[key];
      }
    }

    resultArray.push({ source: source, data: combinedData });
  });

  return resultArray;
}

const getConceptsForRequest = function () {
  return conceptsData.value.map((value) => {
    if (environment.DUCKDB_ENABLED === "true") {
      return {
        concept_id: value?.data[CONCEPT_METADATA][0].CONCEPT_ID,
        concept_name: value?.data[CONCEPT_METADATA][0].CONCEPT_NAME,
        countPeople: value?.data[CONCEPT_METADATA][0].NUM_PERSONS,
        percentPeople: (
          value?.data[CONCEPT_METADATA][0].PERCENT_PERSONS * 100
        ).toFixed(2),
        cdm_name: value?.source.cdm_source_abbreviation,
      };
    }
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
      files:
        environment.DUCKDB_ENABLED === "true"
          ? getDuckDBTables({
              domain: webApiKeyMap.domains[item.DOMAIN_ID],
              concept: item.CONCEPT_ID,
            })[webApiKeyMap.domains[item.DOMAIN_ID]]
          : [
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
      duckdb_supported: true,
    })
    .then(() => {
      if (environment.DUCKDB_ENABLED === "true") {
        conceptsData.value = combineObjectsBySource(store.getters.getData);
      } else {
        conceptsData.value = store.getters.getData.concept;
      }

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
</script>
<script lang="ts">
export default {
  name: "NetworkConceptDashboard",
};
</script>

<style scoped>
.table {
  flex-grow: 1;
}
.table-card {
  padding: 10px;
  width: 100%;
  height: 100%;
}
.table-container {
  display: flex;
  flex-grow: 1;
  justify-content: center;
  padding: 10px;
  min-height: 60vh;
}
.placeholder {
  text-align: center;
  align-self: center;
}
.table-placeholder {
  font-size: 1.5rem !important;
}
</style>
