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
          @close="close"
          @save="(item) => save(item)"
          @missing-concepts-changed="(item) => (missingConcepts = item)"
          :show="dialog"
          multi-selection
        />
      </template>
      <Column header="Source" field="cdm_name"> </Column>
      <Column sortable header="Issues" field="issues"> </Column>
      <Column header="Time-series issues" field="time_series_issues"></Column>
      <Column sortable header="Available concepts" field="concepts.length">
        <template #body="slotProps">
          {{
            `${slotProps.data.concepts.length}/${
              addedConceptsCount + missingConcepts
            }`
          }}
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
          <Column sortable header="Domain" field="domain"> </Column>
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
import { DOMAIN_SUMMARY } from "@/shared/config/files";
import { useStore } from "vuex";
import { FETCH_MULTIPLE_FILES_BY_SOURCE } from "@/processes/exploreReports/model/store/actions.type";
import { helpers } from "@/shared/lib/mixins";
import { computed, ref, watch, Ref, onBeforeMount } from "vue";
import { ConceptSearchForm } from "@/widgets/conceptSearchForm";
import { webApiActions } from "@/shared/api/webAPI";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Message from "primevue/message";
import Divider from "primevue/divider";
import Panel from "primevue/panel";
import environment from "@/shared/api/environment";
import { CONCEPT_METADATA } from "@/shared/api/duckdb/files";

const store = useStore();
const dialog: Ref<boolean> = ref(false);
const addedConcepts = ref({});
const conceptsData = ref([]);
const successMessage = ref([]);
const expanded = ref([]);
const sources = ref([]);
const missingConcepts = ref([]);

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

const getSourcesOverview = computed(() => {
  return filterSourcesWithData.value.map((source) => {
    const populations = source.concepts.map((concept) => concept.population);
    const issuesCount = source.concepts.filter(
      (concept) => !concept.issues
    ).length;
    const timeSeriesIssuesCount = source.concepts.filter(
      (concept) => concept.time_series?.[0] === false
    ).length;

    return {
      ...source,
      min_population: Math.min(...populations),
      max_population: Math.max(...populations),
      issues: issuesCount,
      time_series_issues: timeSeriesIssuesCount,
    };
  });
});
const getDomainSummary = async () => {
  await store.dispatch(FETCH_MULTIPLE_FILES_BY_SOURCE, {
    files: [
      {
        name: DOMAIN_SUMMARY,
        instanceParams: [{ domain: "measurement", concept: "" }],
      },
    ],
    criticalError: false,
  });

  return store.getters.getData.domainSummary.map(({ data, source }) => ({
    parsedData: data,
    source,
  }));
};

const addConceptToList = function (concepts) {
  concepts.forEach((concept) => {
    const source = sources.value.find(
      (source) => source.cdm_name === concept.cdm_name
    );
    if (source) {
      source.concepts.push(concept);
    }
  });
};
const getConceptsForRequest = (measurement = []) => {
  return conceptsData.value.map((value) => {
    const sourceAbbreviation = value.source?.cdm_source_abbreviation;
    let conceptId,
      conceptName,
      domain,
      population,
      percentage,
      timeSeries,
      issues;

    if (environment.DUCKDB_ENABLED === "true") {
      const metadata = value?.data[CONCEPT_METADATA][0];
      conceptId = metadata.CONCEPT_ID;
      conceptName = metadata.CONCEPT_NAME;
      domain = metadata.DOMAIN;
      population = metadata.NUM_PERSONS;
      percentage = metadata.PERCENT_PERSONS;
      timeSeries = metadata.IS_STATIONARY;
      issues = metadata.COUNT_FAILED;
    } else {
      conceptId = value?.data.CONCEPT_ID[0];
      conceptName = value?.data.CONCEPT_NAME[0];
      domain = value?.data.CDM_TABLE_NAME[0];
      population = value?.data.NUM_PERSONS[0];
      percentage = value?.data.PERCENT_PERSONS[0];
      timeSeries = value?.data.IS_STATIONARY;
      issues = value?.data.COUNT_FAILED;
    }

    const missingData = measurement.length
      ? measurement
          .find((source) => source.source === sourceAbbreviation)
          ?.parsedData.find(
            (summaryReport) => summaryReport.CONCEPT_ID == conceptId
          )?.PERCENT_MISSING_VALUES
      : null;

    return {
      concept_id: conceptId,
      concept_name: conceptName,
      domain: domain,
      population: population,
      percentage: percentage,
      cdm_name: sourceAbbreviation,
      time_series: timeSeries,
      issues: issues,
      measurement:
        missingData !== null ? ((1 - missingData) * 100).toFixed(2) : null,
    };
  });
};

const close = function () {
  dialog.value = false;
  store.dispatch(webApiActions.RESET_API_STORAGE);
  successMessage.value = [];
};
const save = function (item) {
  conceptsData.value = store.getters.getData.concept;
  addedConcepts.value = { ...addedConcepts.value, ...item };
  if (!conceptsData.value) {
    return;
  }
  let withMeasurement;
  if (environment.DUCKDB_ENABLED === "true") {
    withMeasurement = conceptsData.value.filter(
      (value) => value.data[CONCEPT_METADATA].CDM_TABLE_NAME === "MEASUREMENT"
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
