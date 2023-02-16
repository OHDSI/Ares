<template>
  <v-container fluid>
    <v-data-table
      class="mb-4"
      show-expand
      density="compact"
      item-key="cdm_name"
      v-model:expanded="expanded"
      :headers="headers"
      :items="getSourcesOverview"
    >
      <template v-slot:top>
        <v-toolbar color="transparent" density="compact" flat>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="1000px">
            <template v-slot:activator="{ props }">
              <v-btn variant="flat" color="primary" class="mb-2" v-bind="props">
                Add concept
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
        </v-toolbar>
      </template>
      <template v-slot:item.min_population="{ item }">{{
        helpers.formatComma(item.raw.min_population) || "No data"
      }}</template>
      <template v-slot:item.max_population="{ item }">{{
        helpers.formatComma(item.raw.max_population) || "No data"
      }}</template>
      <template v-slot:item.concepts.length="{ item }">{{
        `${item.raw.concepts.length}/${addedConceptsCount}`
      }}</template>
      <template v-slot:expanded-row="{ columns, item }">
        <td :colspan="columns.length">
          <v-data-table
            :hide-default-footer="true"
            :disable-pagination="true"
            density="compact"
            :headers="conceptHeaders"
            :items="item.raw.concepts"
            class="elevation-1 accent"
          >
            <template v-slot:item.time_series="{ item }">{{
              item.raw.time_series
                ? item.raw.time_series[0] === false
                  ? "Non-stationary"
                  : "Stationary"
                : "No data"
            }}</template>
            <template v-slot:item.issues="{ item }">{{
              item.issues ? item.raw.issues[0] : ""
            }}</template>
            <template v-slot:item.percentage="{ item }">{{
              (item.raw.percentage * 100).toFixed(2) || "No data"
            }}</template>
            <template v-slot:item.population="{ item }">{{
              helpers.formatComma(item.raw.population)
            }}</template>
            <template v-slot:item.measurement="{ item }">{{
              !item.raw.measurement
                ? isNaN(item.raw.measurement)
                  ? "No data"
                  : "N/A"
                : item.raw.measurement
            }}</template>
          </v-data-table>
        </td>
      </template>
      <template v-slot:no-data><div>No concepts selected</div></template>
    </v-data-table>
    <v-divider></v-divider>
    <v-alert
      color="message"
      dark
      density="compact"
      icon="mdi-help-rhombus"
      prominent
    >
      The overview section uses the smallest population count of all added
      concepts in estimations.
    </v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { CONCEPT, DOMAIN_SUMMARY } from "@/shared/config/files";
import { useStore } from "vuex";
import { FETCH_MULTIPLE_FILES_BY_SOURCE } from "@/processes/exploreReports/model/store/actions.type";
import * as d3Format from "d3-format";
import { helpers } from "@/shared/lib/mixins";
import { computed, ref, watch, defineEmits, Ref, onBeforeMount } from "vue";
import { VDataTable } from "vuetify/labs/VDataTable";
import webApiKeyMap from "@/shared/config/webApiKeyMap";
import { ConceptSearchForm } from "@/widgets/conceptSearchForm";
import { webApiActions } from "@/shared/api/webAPI";

const store = useStore();

const addedConcepts = ref({});
const dialog = ref(false);
const errors = ref("");
const conceptsData = ref([]);
const successMessage = ref([]);
const headers = ref([
  {
    title: "Source",
    align: "start",
    sortable: false,
    key: "cdm_name",
  },
  { title: "Issues", key: "issues" },
  { title: "Time-series issues", key: "time_series_issues" },
  { title: "Available concepts", key: "concepts.length" },
  { title: "Min population", key: "min_population" },
  { title: "Max population", key: "max_population" },
]);
const expanded = ref([]);
const sources = ref([]);

const addedConceptsCount = computed(function () {
  return Object.keys(addedConcepts.value).filter(
    (key) => addedConcepts.value[key] === "Loaded"
  ).length;
});

const emit = defineEmits(["overlappingDataChanged"]);
/*
watch(dialog, (val) => {
  val || close();
  if (this.$refs?.form) {
    this.$refs.form.resetValidation();
  }
});*/

const filterSourcesWithData = computed(function () {
  return sources.value.filter((data) => data.concepts.length);
});
watch(filterSourcesWithData, () => {
  emit("overlappingDataChanged", filterSourcesWithData);
});

const getSourcesOverview = computed(function () {
  return filterSourcesWithData.value.map((value) => ({
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
});
const conceptHeaders = computed(function () {
  return [
    {
      title: "Concept ID",
      align: "start",
      sortable: false,
      key: "concept_id",
      show: true,
    },
    { title: "Concept Name", key: "concept_name", show: true },
    { title: "Domain", key: "domain", show: true },
    { title: "Population", key: "population", show: true },
    { title: "%", key: "percentage", show: true },
    { title: "Time series", key: "time_series", show: true },
    { title: "Issues", key: "issues", show: true },
    {
      title: "% with values",
      key: "measurement",
      show: [
        ...getSourcesOverview.value.map((value) =>
          value.concepts.filter((concept) => concept.domain === "MEASUREMENT")
        ),
      ].filter((value) => value.length).length,
    },
  ].filter((header) => header.show);
});

const clearMessages = function () {
  errors.value = "";
  successMessage.value = [];
};
const getDomainSummary = function () {
  return store
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
      return store.getters.getData.domainSummary.map((value) => ({
        parsedData: value.data,
        source: value.source,
      }));
    });
};
const addConceptToList = function (concepts) {
  sources.value.forEach((source) => {
    const sourceConcept = concepts.filter(
      (concept) => source.cdm_name === concept.cdm_name
    );
    if (sourceConcept.length) {
      source.concepts.push(...sourceConcept);
    }
  });
};
const getConceptsForRequest = function (measurement = []) {
  return conceptsData.value.map((value) => {
    const missingData = measurement.length
      ? measurement
          .filter(
            (source) => source.source === value.source?.cdm_source_abbreviation
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
};
const close = function () {
  dialog.value = false;
  store.dispatch(webApiActions.RESET_API_STORAGE);
  successMessage.value = [];
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
      const withMeasurement = conceptsData.value.filter(
        (value) => value.data.CDM_TABLE_NAME[0] === "MEASUREMENT"
      );
      if (withMeasurement.length) {
        getDomainSummary().then((value) => {
          addConceptToList(getConceptsForRequest(value));
        });
      } else {
        addConceptToList(getConceptsForRequest());
      }
      addedConcepts.value = {
        ...addedConcepts.value,
        [item.CONCEPT_ID]: "Loaded",
      };
      successMessage.value = ["Concept loaded"];
    });
};

onBeforeMount(() => {
  sources.value = store.getters.getSources.map((value) => ({
    cdm_name: value.cdm_source_abbreviation,
    concepts: [],
  }));
});
</script>

<script lang="ts">
export default {
  name: "RequiredConcepts",
};
</script>

<style scoped></style>
