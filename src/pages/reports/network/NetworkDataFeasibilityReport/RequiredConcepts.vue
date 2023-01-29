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
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ props }">
              <v-btn variant="flat" color="primary" class="mb-2" v-bind="props">
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
                    <v-row class="flex-column">
                      <v-col cols="auto">
                        <v-text-field
                          v-model.number="editedItem.conceptID"
                          :rules="[rules.required, rules.concept]"
                          prepend-icon="mdi-chart-timeline-variant-shimmer"
                          label="Concept ID"
                          variant="outlined"
                          density="compact"
                          :error-messages="errors"
                        >
                        </v-text-field>
                      </v-col>
                      <v-col cols="auto">
                        <v-autocomplete
                          v-model="editedItem.domain"
                          :rules="[rules.required]"
                          label="Domain"
                          variant="outlined"
                          item-title="title"
                          return-object
                          prepend-icon="mdi-folder"
                          density="compact"
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
        formatComma(item.raw.min_population) || "No data"
      }}</template>
      <template v-slot:item.max_population="{ item }">{{
        formatComma(item.raw.max_population) || "No data"
      }}</template>
      <template v-slot:item.concepts.length="{ item }">{{
        `${item.raw.concepts.length}/${conceptsCount}`
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
              formatComma(item.raw.population)
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
      <template v-slot:item.actions="{ item }">
        <v-icon small @click="deleteItem(item.raw)"> mdi-delete </v-icon>
      </template>
      <template v-slot:no-data> </template>
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
import {
  computed,
  ref,
  watch,
  defineEmits,
  Ref,
  onBeforeMount,
  nextTick,
} from "vue";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";
import { VDataTable } from "vuetify/labs/VDataTable";

const store = useStore();

const concepts = ref([]);
const sources = ref([]);
const filterSourcesWithData = computed(function () {
  return sources.value.filter((data) => data.concepts.length);
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

const conceptsCount: Ref<number> = ref(0);

const conceptsData = ref([]);
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

const addConceptToList = function (concepts) {
  if (concepts[0]?.concept_id && !isLoaded()) {
    conceptsCount.value += 1;
    sources.value.forEach((source) => {
      const sourceConcept = concepts.filter(
        (concept) => source.cdm_name === concept.cdm_name
      )[0];

      if (sourceConcept) {
        source.concepts.push(sourceConcept);
      }
    });
    close();
  } else {
    errors.value = "Entered concept is not found across data sources";
  }
};

const errors: Ref<string> = ref("");
const dialog: Ref<boolean> = ref(false);

const form = ref(null);
watch(dialog, (val) => {
  val || close();
  if (form.value) {
    form.value.resetValidation();
  }
});

const defaultItem = ref({
  conceptID: "",
  domain: "",
});
const editedItem = ref({
  conceptID: "",
  domain: "",
});
const isLoaded = function () {
  return [
    ...sources.value.reduce(
      (prevValue, value) => [
        ...prevValue,
        ...value.concepts.filter(
          (concept) => concept.concept_id === editedItem.value.conceptID
        ),
      ],
      []
    ),
  ].length;
};

const editedIndex = ref(null);

function save() {
  if (editedItem.value.conceptID === "" || editedItem.value.domain === "") {
    return;
  }
  if (isLoaded()) {
    errors.value = "Entered concept is already on the list";
    return;
  }

  store
    .dispatch(FETCH_MULTIPLE_FILES_BY_SOURCE, {
      files: [CONCEPT],
      params: {
        concept: editedItem.value.conceptID,
        domain: editedItem.value.domain.key,
      },
      criticalError: false,
    })
    .then(() => {
      conceptsData.value = store.getters.getData[CONCEPT];
      if (conceptsData.value[0]?.data?.CDM_TABLE_NAME[0] === "MEASUREMENT") {
        getDomainSummary().then((value) => {
          addConceptToList(getConceptsForRequest(value));
        });
      } else {
        addConceptToList(getConceptsForRequest());
      }
    });
}
function close() {
  dialog.value = false;
  nextTick(() => {
    editedItem.value = Object.assign({}, defaultItem.value);
    editedIndex.value = -1;
  });
}

watch(editedItem, () => {
  errors.value = "";
  //deep
});

const dialogDelete: Ref<boolean> = ref(false);
function closeDelete() {
  dialogDelete.value = false;
  nextTick(() => {
    editedItem.value = Object.assign({}, defaultItem.value);
    editedIndex.value = -1;
  });
}
function deleteItemConfirm() {
  concepts.value.splice(editedIndex.value, 1);
  closeDelete();
}

function deleteItem(item) {
  editedIndex.value = concepts.value.indexOf(item);
  editedItem.value = Object.assign({}, item);
  dialogDelete.value = true;
}

watch(dialogDelete, (val) => {
  val || closeDelete();
});

const rules = {
  required: (value) => !!value || "Required field",
  concept: (value) => {
    const pattern = /^\d+$/;
    return pattern.test(value) || "The field is digits only";
  },
};

const headers: Ref<DataTableHeader[]> = ref([
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
const domains: Ref<DataTableHeader[]> = ref([
  { title: "Condition occurrence", key: "condition_occurrence" },
  { title: "Drug Exposure", key: "drug_exposure" },
  { title: "Device Exposure", key: "device_exposure" },
  { title: "Measurement", key: "measurement" },
  { title: "Death", key: "death" },
  { title: "Procedure Occurrence", key: "procedure_occurrence" },
  { title: "Observation", key: "observation" },
]);

const expanded = ref([]);

const conceptHeaders = computed(function (): DataTableHeader[] {
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

const getDomainSummary = function () {
  return store
    .dispatch(FETCH_MULTIPLE_FILES_BY_SOURCE, {
      files: [DOMAIN_SUMMARY],
      params: {
        concept: conceptsData.value[0].data.CONCEPT_ID[0],
        domain: "measurement",
      },
      criticalError: false,
    })
    .then(() => {
      return store.getters.getData.domainSummary.map((value) => ({
        parsedData: value.data,
        source: value.source.cdm_source_abbreviation,
      }));
    });
};

const formatComma = function (value) {
  return d3Format.format(",")(value);
};

const emit = defineEmits(["overlappingDataChanged"]);

watch(filterSourcesWithData, () => {
  emit("overlappingDataChanged", filterSourcesWithData.value);
});

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
