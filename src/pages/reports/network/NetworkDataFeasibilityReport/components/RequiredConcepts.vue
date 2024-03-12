<template>
  <Panel toggleable header="Concept Requirements" fluid>
    <DataTable
      v-model:expandedRows="expanded"
      removable-sort
      size="small"
      :value="getSourcesOverview"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
    >
      <template #header>
        <div class="flex flex-row justify-end">
          <Button @click="dialog = !dialog" plain>
            <span class="uppercase font-thin text-grey"
              >Add concepts
            </span></Button
          >
        </div>

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
      <Column header="Source" field="cdm_name"> </Column>
      <Column sortable header="Issues" field="issues"> </Column>
      <Column header="Time-series issues" field="time_series_issues"></Column>
      <Column sortable header="Available concepts" field="concepts.length">
        <template #body="slotProps">
          {{ `${slotProps.data.concepts.length}/${addedConceptsCount}` }}
        </template>
      </Column>
      <Column header="Min population" field="min_population">
        <template #body="slotProps">
          {{ helpers.formatComma(slotProps.data.min_population) || "No data" }}
        </template>
      </Column>
      <Column sortable header="Max population" field="max_population">
        <template #body="slotProps">
          {{ helpers.formatComma(slotProps.data.max_population) || "No data" }}
        </template>
      </Column>
      <Column style="width: 5rem" expander> </Column>
      <template #expansion="slotProps">
        <DataTable
          removable-sort
          size="small"
          :value="slotProps.data.concepts"
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20, 50]"
        >
          <Column header="Concept ID" field="concept_id"></Column>
          <Column sortable header="Concept Name" field="concept_name"> </Column>
          <Column sortable header="Domain" field="domain">
            <template #body="slotProps">
              {{ (slotProps.data.percentage * 100).toFixed(2) }}
            </template>
          </Column>
          <Column sortable header="Population" field="population">
            <template #body="slotProps">
              {{ helpers.formatComma(slotProps.data.population) }}
            </template>
          </Column>
          <Column sortable header="%" field="percentage">
            <template #body="slotProps">
              {{ (slotProps.data.percentage * 100).toFixed(2) || "No data" }}
            </template>
          </Column>
          <Column sortable header="Time series" field="time_series">
            <template #body="slotProps">
              {{
                slotProps.data.time_series
                  ? slotProps.data.time_series[0] === false
                    ? "Non-stationary"
                    : "Stationary"
                  : "No data"
              }}
            </template>
          </Column>
          <Column sortable header="Issues" field="issues">
            <template #body="slotProps">
              {{ slotProps.issues ? slotProps.data.issues[0] : "" }}
            </template>
          </Column>
          <Column
            :hidden="
              ![
                ...getSourcesOverview.map((value) =>
                  value.concepts.filter(
                    (concept) => concept.domain === 'MEASUREMENT'
                  )
                ),
              ].filter((value) => value.length).length
            "
            sortable
            header="% with values"
            field="measurement"
          >
            <template #body="slotProps">
              {{
                !slotProps.data.measurement
                  ? isNaN(slotProps.data.measurement)
                    ? "No data"
                    : "N/A"
                  : slotProps.data.measurement
              }}
            </template>
          </Column>
        </DataTable>
      </template>
    </DataTable>
    <Divider />
    <Message :closable="false" severity="info">
      The overview section uses the smallest population count of all added
      concepts in estimations.
    </Message>
  </Panel>
</template>

<script setup lang="ts">
import { CONCEPT, DOMAIN_SUMMARY } from "@/shared/config/files";
import { useStore } from "vuex";
import { FETCH_MULTIPLE_FILES_BY_SOURCE } from "@/processes/exploreReports/model/store/actions.type";
import { helpers } from "@/shared/lib/mixins";
import { computed, ref, watch, defineEmits, Ref, onBeforeMount } from "vue";
import webApiKeyMap from "@/shared/config/webApiKeyMap";
import { ConceptSearchForm } from "@/widgets/conceptSearchForm";
import { webApiActions } from "@/shared/api/webAPI";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Message from "primevue/message";
import Divider from "primevue/divider";
import Panel from "primevue/panel";
import environment from "@/shared/api/environment";
import getDuckDBTables from "@/shared/api/duckdb/conceptTables";
import { CONCEPT_METADATA } from "@/shared/api/duckdb/files";

const store = useStore();
const dialog: Ref<boolean> = ref(false);
const addedConcepts = ref({});
const errors = ref("");
const conceptsData = ref([]);
const successMessage = ref([]);
const expanded = ref([]);
const sources = ref([]);

const addedConceptsCount = computed(function () {
  return Object.keys(addedConcepts.value).filter(
    (key) => addedConcepts.value[key] === "Loaded"
  ).length;
});

const emit = defineEmits(["overlappingDataChanged"]);

const filterSourcesWithData = computed(function () {
  return sources.value.filter((data) => data.concepts.length);
});
watch(filterSourcesWithData, () => {
  emit("overlappingDataChanged", filterSourcesWithData.value);
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
    if (environment.DUCKDB_ENABLED === "true") {
      return {
        concept_id: value?.data[CONCEPT_METADATA][0].CONCEPT_ID,
        concept_name: value?.data[CONCEPT_METADATA][0].CONCEPT_NAME,
        domain: value?.data[CONCEPT_METADATA][0].CDM_TABLE_NAME,
        population: value?.data[CONCEPT_METADATA][0].NUM_PERSONS,
        percentage: value?.data[CONCEPT_METADATA][0].PERCENT_PERSONS,
        cdm_name: value?.source.cdm_source_abbreviation,
        time_series: value?.data[CONCEPT_METADATA][0].IS_STATIONARY,
        issues: value?.data[CONCEPT_METADATA][0].COUNT_FAILED,
        measurement: measurement.length
          ? (1 - missingData) * (100).toFixed(2)
          : null,
      };
    } else {
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
    }
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
  console.log(environment.DUCKDB_ENABLED);
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
      conceptsData.value = store.getters.getData.concept;
      if (!conceptsData.value.length) {
        errors.value = "Requested concept is not found across data sources";
        addedConcepts.value = {
          ...addedConcepts.value,
          [item.CONCEPT_ID]: "Not found",
        };
        return;
      }
      if (environment.DUCKDB_ENABLED === "true") {
        withMeasurement = conceptsData.value.filter(
          (value) =>
            value.data[CONCEPT_METADATA].CDM_TABLE_NAME === "MEASUREMENT"
        );
      } else {
        withMeasurement = conceptsData.value.filter(
          (value) => value.data.CDM_TABLE_NAME[0] === "MEASUREMENT"
        );
      }
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
