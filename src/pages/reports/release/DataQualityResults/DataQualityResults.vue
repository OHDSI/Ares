<template>
  <v-responsive>
    <div v-if="!store.getters.getErrors">
      <v-card :loading="!store.getters.dataInStore" elevation="10" class="ma-4">
        <v-tabs v-model="tab">
          <v-tab value="overview">Overview</v-tab>
          <v-tab value="metadata">Metadata</v-tab>
          <v-tab value="results">Results</v-tab>
          <v-tab value="pivot">Pivot table</v-tab>
        </v-tabs>
        <v-window v-model="tab">
          <v-window-item v-if="store.getters.dataInStore" value="overview">
            <v-container fluid class="ma-2 pa-4">
              <table id="results">
                <thead>
                  <tr>
                    <td></td>
                    <td colspan="3" class="header text-center">Verification</td>
                    <td colspan="3" class="header text-center">Validation</td>
                    <td colspan="3" class="header text-center">Total</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td class="subheader text-center">Pass</td>
                    <td class="subheader text-center">Fail</td>
                    <td class="subheader text-center">Total</td>
                    <td class="subheader text-center">Pass</td>
                    <td class="subheader text-center">Fail</td>
                    <td class="subheader text-center">Total</td>
                    <td class="subheader text-center">Pass</td>
                    <td class="subheader text-center">Fail</td>
                    <td class="subheader text-center">Total</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="text-left header">Plausibility</td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Verification
                          .Plausibility.Pass
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Verification
                          .Plausibility.Fail
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Verification
                          .Plausibility.Total
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Validation
                          .Plausibility.Pass
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Validation
                          .Plausibility.Fail
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Validation
                          .Plausibility.Total
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Total.Plausibility
                          .Pass
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Total.Plausibility
                          .Fail
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Total.Plausibility
                          .Total
                      }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-left header">Conformance</td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Verification
                          .Conformance.Pass
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Verification
                          .Conformance.Fail
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Verification
                          .Conformance.Total
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Validation
                          .Conformance.Pass
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Validation
                          .Conformance.Fail
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Validation
                          .Conformance.Total
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Total.Conformance
                          .Pass
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Total.Conformance
                          .Fail
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Total.Conformance
                          .Total
                      }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-left header">Completeness</td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Verification
                          .Completeness.Pass
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Verification
                          .Completeness.Fail
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Verification
                          .Completeness.Total
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Validation
                          .Completeness.Pass
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Validation
                          .Completeness.Fail
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Validation
                          .Completeness.Total
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Total.Completeness
                          .Pass
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Total.Completeness
                          .Fail
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Total.Completeness
                          .Total
                      }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-left header">Total</td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Verification.Total
                          .Pass
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Verification.Total
                          .Fail
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Verification.Total
                          .Total
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Validation.Total
                          .Pass
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Validation.Total
                          .Fail
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Validation.Total
                          .Total
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Total.Total.Pass
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Total.Total.Fail
                      }}
                    </td>
                    <td>
                      {{
                        store.getters.getData.derivedResults.Total.Total.Total
                      }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <info-panel
                details="The Data Quality Overview provides a summary
              of the results of the Data Quality assessment performed by the
              Data Quality Dashboard package."
                :link="links.getDataQualityDashboardLink()"
              ></info-panel>
            </v-container>
          </v-window-item>
          <v-window-item v-if="store.getters.dataInStore" value="metadata">
            <v-container fluid ma-2 pa-4>
              <v-row>
                <v-col cols="2">CDM Source Name</v-col>
                <v-col>{{ store.getters.getData.cdmSourceName }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">Description</v-col>
                <v-col>{{ store.getters.getData.sourceDescription }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">Licensee</v-col>
                <v-col>{{ store.getters.getData.cdmHolder }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">Source Released</v-col>
                <v-col>{{ store.getters.getData.sourceReleaseDate }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">CDM Released</v-col>
                <v-col>{{ store.getters.getData.cdmReleaseDate }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">CDM Version</v-col>
                <v-col>{{ store.getters.getData.cdmVersion }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">DQD Version</v-col>
                <v-col>{{ store.getters.getData.dqdVersion }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">Vocabulary Version</v-col>
                <v-col>{{ store.getters.getData.vocabularyVersion }}</v-col>
              </v-row>
              <v-row>
                <v-col cols="2">Source Documentation</v-col>
                <v-col>
                  {{ store.getters.getData.sourceDocumentationReference }}
                  <a
                    :href="store.getters.getData.sourceDocumentationReference"
                    target="_blank"
                  >
                    <v-icon right small color="primary">mdi-open-in-new</v-icon>
                  </a>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="2">ETL Reference</v-col>
                <v-col>
                  {{ store.getters.getData.cdmEtlReference }}
                  <a
                    :href="store.getters.getData.cdmEtlReference"
                    target="_blank"
                  >
                    <v-icon right small color="primary">mdi-open-in-new</v-icon>
                  </a>
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>
          <v-window-item v-if="store.getters.dataInStore" value="results">
            <v-container fluid class="ma-2 pa-4">
              <v-row>
                <v-col cols="3">
                  <v-text-field
                    prepend-icon="mdi-magnify"
                    label="Search in Table"
                    single-line
                    variant="outlined"
                    density="compact"
                    hide-details
                    @update:modelValue="debouncedSearch"
                  ></v-text-field>
                </v-col>
                <v-col cols="auto">
                  <SelectColumns :headers="headers" />
                </v-col>
                <v-col cols="auto">
                  <v-menu
                    attach
                    v-model="chooseFilter"
                    bottom
                    :close-on-content-click="false"
                    :offset-y="true"
                  >
                    <template #activator="{ props }">
                      <v-btn color="primary" v-bind="props">
                        <v-icon dark left>mdi-filter</v-icon>
                        Helpful Filters
                      </v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item
                        v-for="(item, index) in helpfulFilters"
                        :key="index"
                      >
                        <v-checkbox-btn
                          v-model="selectedFilter"
                          :label="item.text"
                          :value="item"
                          :multiple="false"
                          hide-details="auto"
                          @update:modelValue="helpfulFilterUpdate(item.preset)"
                        ></v-checkbox-btn>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-col>
                <v-col>
                  <NestedMenu
                    :data="store.getters.getData.checkResults"
                    :items="showHeaders"
                    :filters="filters"
                  ></NestedMenu>
                </v-col>
              </v-row>
            </v-container>
            <v-data-table
              show-expand
              v-model:expanded="expanded"
              :headers="showHeaders"
              :items="filteredChecks"
              :footer-props="{
                'items-per-page-options': [5, 10, 25],
              }"
              item-key="checkId"
              :items-per-page="10"
              :search="route.query.search"
              density="compact"
            >
              <template v-slot:expanded-row="{ columns, item }">
                <td class="text-left pa-4" :colspan="columns.length">
                  <v-row dense>
                    <v-col cols="2">Check Name</v-col>
                    <v-col>{{ item.raw.CHECK_NAME }}</v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">Description</v-col>
                    <v-col
                      >{{ item.raw.CHECK_DESCRIPTION }} (threshold
                      {{ item.raw.THRESHOLD_VALUE }}%)</v-col
                    >
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">Threshold</v-col>
                    <v-col>{{ item.raw.THRESHOLD_VALUE }}</v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">Notes</v-col>
                    <v-col>{{ item.raw.NOTE_VALUE }}</v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">Level</v-col>
                    <v-col>{{ item.raw.CHECK_LEVEL }}</v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">Table</v-col>
                    <v-col>
                      <a
                        :href="links.getDocsLink(item.raw.CDM_TABLE_NAME)"
                        target="_blank"
                      >
                        {{ item.raw.CDM_TABLE_NAME }}
                        <v-icon small>mdi-open-in-new</v-icon>
                      </a>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">Field</v-col>
                    <v-col>{{ item.raw.CDM_FIELD_NAME }}</v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">Concept Id</v-col>
                    <v-col>
                      <router-link
                        v-if="item.raw.CONCEPT_ID != undefined"
                        :to="getConceptDrilldown(item)"
                        color="primary"
                      >
                        {{ item.raw.CONCEPT_ID }}
                        <v-icon small>mdi-open-in-new</v-icon>
                      </router-link>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">Unit Concept Id</v-col>
                    <v-col>{{ item.raw.UNIT_CONCEPT_ID }}</v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2"># Rows Violated</v-col>
                    <v-col>{{ item.raw.NUM_VIOLATED_ROWS }}</v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2"># Rows Total</v-col>
                    <v-col>{{ item.raw.NUM_DENOMINATOR_ROWS }}</v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">% Rows Violated</v-col>
                    <v-col
                      >{{
                        (item.raw.PCT_VIOLATED_ROWS * 100).toFixed(2)
                      }}
                      %</v-col
                    >
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">Execution Time</v-col>
                    <v-col>{{ item.raw.EXECUTION_TIME }}</v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">SQL Query</v-col>
                    <v-col>
                      <Codemirror
                        ref="myCm"
                        :value="item.raw.QUERY_TEXT"
                        :options="cmOptions"
                      ></Codemirror>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col cols="2">Errors</v-col>
                    <v-col>{{ item.raw.ERROR }}</v-col>
                  </v-row>
                </td>
              </template>
              <template #item.SUBCATEGORY="{ item }">{{
                item.raw.SUBCATEGORY == undefined
                  ? item.raw.SUBCATEGORY
                  : "None"
              }}</template>
              <template #item.CHECK_DESCRIPTION="{ item }">{{
                renderDescription(item.raw)
              }}</template>
              <template #item.PCT_VIOLATED_ROWS="{ item }">
                <div class="text-right">
                  {{ renderPercentPassed(item.raw) }} %
                </div>
              </template>
              <template #item.NUM_VIOLATED_ROWS="{ item }">
                <div class="text-right">
                  {{ helpers.formatComma(item.raw.NUM_VIOLATED_ROWS) }}
                </div>
              </template>
              <template #item.NUM_DENOMINATOR_ROWS="{ item }">
                <div class="text-right">
                  {{ helpers.formatComma(item.raw.NUM_DENOMINATOR_ROWS) }}
                </div>
              </template>
            </v-data-table>
          </v-window-item>
          <v-window-item v-if="store.getters.dataInStore" value="pivot">
            <v-container fluid>
              <Pivot
                :data="store.getters.getData.rawData.CheckResults"
                :event-listener="pivotRedirectToResultsTab"
                :attributes="[
                  'CATEGORY',
                  'CDM_FIELD_NAME',
                  'CHECK_LEVEL',
                  'CHECK_NAME',
                  'CONTEXT',
                  'NOTES_EXIST',
                  'SUBCATEGORY',
                  'CDM_TABLE_NAME',
                  'FAILED',
                ]"
                :aggregator-names-list="['Count']"
              >
              </Pivot>
            </v-container>
          </v-window-item>
        </v-window>
      </v-card>
    </div>
  </v-responsive>
</template>

<script setup lang="ts">
import Codemirror from "codemirror-editor-vue3";
import { VDataTable } from "vuetify/labs/VDataTable";
import Pivot from "../../../../widgets/pivot";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/sql/sql";
import "codemirror/theme/neat.css";
import "codemirror/theme/base16-dark.css";
import { helpers } from "@/shared/lib/mixins";
import { links } from "@/shared/config/links";
import SelectColumns from "@/features/selectColumns";

import { useStore } from "vuex";
import {
  useRouter,
  useRoute,
  Router,
  RouteLocationNormalizedLoaded,
} from "vue-router";
import { computed, ref, Ref, watch, onBeforeMount } from "vue";
import InfoPanel from "@/widgets/infoPanel/ui/InfoPanel.vue";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";
import { debounce } from "lodash";
import NestedMenu from "@/features/nestedMenu/NestedMenu.vue";

const store = useStore();
const route = useRoute();
const router = useRouter();

const expanded = ref([]);
const chooseFilter: Ref<boolean> = ref(false);
const helpfulFilters = ref([
  {
    text: "Failed Checks",
    key: "failed",
    preset: {
      FAILED: ["FAIL"],
      CDM_TABLE_NAME: [],
      CDM_FIELD_NAME: [],
      CHECK_NAME: [],
      NOTES_EXIST: [],
      CATEGORY: [],
      SUBCATEGORY: [],
      CONTEXT: [],
      CHECK_LEVEL: [],
    },
  },
  {
    text: "No Filters",
    key: "noFilters",
    preset: {
      FAILED: [],
      CDM_TABLE_NAME: [],
      CDM_FIELD_NAME: [],
      CHECK_NAME: [],
      NOTES_EXIST: [],
      CATEGORY: [],
      SUBCATEGORY: [],
      CONTEXT: [],
      CHECK_LEVEL: [],
    },
  },
]);
const filters = ref({
  FAILED: [],
  CDM_TABLE_NAME: [],
  CDM_FIELD_NAME: [],
  CHECK_NAME: [],
  NOTES_EXIST: [],
  CATEGORY: [],
  SUBCATEGORY: [],
  CONTEXT: [],
  CHECK_LEVEL: [],
});
const selectedFilter = ref([]);
const headers: Ref<DataTableHeader[]> = ref([
  {
    title: "Status",
    sortable: true,
    key: "FAILED",
    show: true,
    default: true,
  },
  {
    title: "Table",
    sortable: true,
    key: "CDM_TABLE_NAME",
    show: true,
    default: true,
  },
  {
    title: "Field",
    sortable: true,
    key: "CDM_FIELD_NAME",
    show: false,
    default: false,
  },
  {
    title: "Check",
    sortable: true,
    key: "CHECK_NAME",
    show: false,
    default: false,
  },
  {
    title: "Category",
    sortable: true,
    key: "CATEGORY",
    show: false,
    default: false,
  },
  {
    title: "Subcategory",
    sortable: true,
    key: "SUBCATEGORY",
    show: false,
    default: false,
  },
  {
    title: "Context",
    sortable: true,
    key: "CONTEXT",
    show: false,
    default: false,
  },
  {
    title: "Level",
    sortable: true,
    key: "CHECK_LEVEL",
    show: false,
    default: false,
  },
  {
    title: "Notes",
    sortable: true,
    key: "NOTES_EXIST",
    show: false,
    default: false,
  },
  {
    title: "Description",
    sortable: true,
    key: "CHECK_DESCRIPTION",
    show: true,
    default: true,
  },
  {
    title: "% Records Failed",
    sortable: true,
    key: "PCT_VIOLATED_ROWS",
    show: true,
    default: true,
  },
  {
    title: "# Records Failed",
    sortable: true,
    key: "NUM_VIOLATED_ROWS",
    show: true,
    default: true,
  },
  {
    title: "# Total Records",
    sortable: true,
    key: "NUM_DENOMINATOR_ROWS",
    show: false,
    default: false,
  },
  {
    title: "Execution Duration",
    sortable: true,
    key: "EXECUTION_TIME",
    show: false,
    default: false,
  },
]);

const pivotRedirectToResultsTab = function (
  router: Router,
  route: RouteLocationNormalizedLoaded,
  componentAttributes: string[]
) {
  return {
    clickCallback: function (e, value, axisAttributes, pivotData) {
      if (value) {
        const params = Object.keys(componentAttributes)
          .filter(
            (attribute) =>
              Object.keys(axisAttributes).includes(attribute) ||
              Object.keys(pivotData.props.valueFilter).includes(attribute)
          )
          .reduce(
            (acc, key) => ({
              ...acc,
              [key]: axisAttributes[key]
                ? axisAttributes[key]
                : Object.values(componentAttributes[key]).filter((attrValue) =>
                    pivotData.props.valueFilter[key]
                      ? !Object.keys(pivotData.props.valueFilter[key]).includes(
                          attrValue
                        )
                      : //empty strings are possible values, as such need additional checks for them, otherwise Object.keys returns an error
                        attrValue === ""
                  ),
            }),
            {}
          );
        router.push({
          path:
            "/cdm/" +
            route.params.cdm +
            "/" +
            route.params.release +
            `/data_quality`,
          query: {
            tab: "results",
            ...params,
          },
        });
      }
    },
  };
};

const debouncedSearch = debounce(function (data: string): void {
  router.push({
    query: { ...route.query, search: data },
  });
}, 300);

const updateColumnsList = function (): void {
  const parsedParams = Object.keys(JSON.parse(filterParams.value));
  headers.value = headers.value.map((header) => {
    if (parsedParams.includes(header.key)) {
      return { ...header, show: true };
    } else {
      if (header.default) {
        return header;
      } else {
        return { ...header, show: false };
      }
    }
  });
};

const getConceptDrilldown = function (item) {
  return {
    name: "networkConcept",
    params: {
      domain: item.CDM_TABLE_NAME.toLowerCase(),
      concept: item.CONCEPT_ID.toString().trim(),
    },
  };
};

const renderDescription = function (d) {
  let thresholdMessage = "";
  if (d.THRESHOLD_VALUE != undefined) {
    thresholdMessage = " (Threshold=" + d.THRESHOLD_VALUE + "%).";
  }
  return d.CHECK_DESCRIPTION + thresholdMessage;
};

const renderPercentPassed = function (d): string | number {
  return d.PCT_VIOLATED_ROWS ? (d.PCT_VIOLATED_ROWS * 100).toFixed(2) : 0;
};

const cmOptions = computed(function () {
  return {
    theme: store.getters.getSettings.darkMode ? "base16-dark" : "neat",
    lineWrapping: true,
    tabSize: 2,
    mode: "text/x-sql",
    viewportMargin: Infinity,
    lineNumbers: true,
    autoRefresh: true,
  };
});
const filterParams = computed(function () {
  return JSON.stringify(
    Object.keys(route.query)
      .filter((param) => param !== "tab")
      .reduce(
        (acc, key) => ({
          ...acc,
          [key]: route.query[key],
        }),
        {}
      )
  );
});

const helpfulFilterUpdate = function (filter): void {
  filters.value = Object.keys(filters.value).reduce(
    (acc, key) => ({
      ...acc,
      [key]: filter[key] ? filter[key] : [],
    }),
    {}
  );
};
const updateFiltersFromUrl = function (): void {
  const parsedParams = JSON.parse(filterParams.value);
  helpfulFilterUpdate(
    Object.keys(parsedParams).reduce(
      (acc, key) => ({
        ...acc,
        [key]: Array.isArray(parsedParams[key])
          ? [...parsedParams[key]]
          : [parsedParams[key]],
      }),
      {}
    )
  );
};

const tab = computed({
  set(tab: string): void {
    router.push({
      query: {
        tab: tab,
      },
    });
  },
  get(): string | string[] {
    return route.query.tab;
  },
});
const filteredChecks = computed(() => {
  return store.getters.getData.checkResults.filter((d) => {
    return Object.keys(filters.value).every((f) => {
      return filters.value[f].length < 1 || filters.value[f].includes(d[f]);
    });
  });
});
const showHeaders = computed((): DataTableHeader[] => {
  return headers.value.filter((header) => header.show);
});

watch(filterParams, (): void => {
  updateFiltersFromUrl();
  updateColumnsList();
});

onBeforeMount((): void => {
  updateFiltersFromUrl();
  updateColumnsList();
});
</script>

<style>
tr:hover {
  background-color: transparent !important;
}
.CodeMirror {
  height: auto;
}
.v-data-table-header th {
  white-space: nowrap;
}
.v-text-field {
  padding-top: 0px !important;
}
table#results {
  width: 100%;
}
table#results tr td.header {
  text-transform: uppercase;
  background-color: rgb(var(--v-theme-accent));
}
table#results .subheader {
  text-transform: uppercase;
  background-color: rgb(var(--v-theme-accent));
}
table#results {
  border-spacing: 2px;
}
table#results td {
  font-size: 14px;
  line-height: 30px;
  text-align: right;
}
table#results th {
  text-align: left;
}
table#results tbody td {
  padding: 0px 3px 0px 7px;
}
body {
  font-size: 14px;
}
a {
  text-decoration: none;
}
</style>
