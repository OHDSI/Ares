<template>
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
    item-value="checkId"
    :items-per-page="10"
    :search="route.query.search"
    density="compact"
  >
    <template v-slot:expanded-row="{ columns, item }">
      <td class="text-left pa-4" :colspan="columns.length">
        <v-row dense>
          <v-col cols="2">Check Name</v-col>
          <v-col>{{ item.raw.checkName }}</v-col>
        </v-row>
        <v-row dense>
          <v-col cols="2">Description</v-col>
          <v-col
            >{{ item.raw.checkDescription }} (threshold
            {{ item.raw.thresholdValue }}%)</v-col
          >
        </v-row>
        <v-row dense>
          <v-col cols="2">Threshold</v-col>
          <v-col>{{ item.raw.thresholdValue }}</v-col>
        </v-row>
        <v-row dense>
          <v-col cols="2">Notes</v-col>
          <v-col>{{ item.raw.noteValue }}</v-col>
        </v-row>
        <v-row dense>
          <v-col cols="2">Level</v-col>
          <v-col>{{ item.raw.checkLevel }}</v-col>
        </v-row>
        <v-row dense>
          <v-col cols="2">Table</v-col>
          <v-col>
            <a
              :href="links.getDocsLink(item.raw.cdmTableName)"
              target="_blank"
            >
              {{ item.raw.cdmTableName }}
              <v-icon small>mdi-open-in-new</v-icon>
            </a>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="2">Field</v-col>
          <v-col>{{ item.raw.cdmFieldName }}</v-col>
        </v-row>
        <v-row dense>
          <v-col cols="2">Concept Id</v-col>
          <v-col>
            <router-link
              v-if="item.raw.conceptId != undefined"
              :to="getConceptDrilldown(item)"
              color="primary"
            >
              {{ item.raw.conceptId }}
              <v-icon small>mdi-open-in-new</v-icon>
            </router-link>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col cols="2">Unit Concept Id</v-col>
          <v-col>{{ item.raw.UNIT_conceptId }}</v-col>
        </v-row>
        <v-row dense>
          <v-col cols="2"># Rows Violated</v-col>
          <v-col>{{ item.raw.numViolatedRows }}</v-col>
        </v-row>
        <v-row dense>
          <v-col cols="2"># Rows Total</v-col>
          <v-col>{{ item.raw.numDenominatorRows }}</v-col>
        </v-row>
        <v-row dense>
          <v-col cols="2">% Rows Violated</v-col>
          <v-col>{{ (item.raw.pctViolatedRows * 100).toFixed(2) }} %</v-col>
        </v-row>
        <v-row dense>
          <v-col cols="2">Execution Time</v-col>
          <v-col>{{ item.raw.executionTime }}</v-col>
        </v-row>
        <v-row dense>
          <v-col cols="2">SQL Query</v-col>
          <v-col>
            <Codemirror
              ref="myCm"
              :value="item.raw.queryText"
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
    <template #item.subcategory="{ item }">{{
      item.raw.subcategory == undefined ? item.raw.subcategory : "None"
    }}</template>
    <template #item.checkDescription="{ item }">{{
      renderDescription(item.raw)
    }}</template>
    <template #item.pctViolatedRows="{ item }">
      <div class="text-right">{{ renderPercentPassed(item.raw) }} %</div>
    </template>
    <template #item.numViolatedRows="{ item }">
      <div class="text-right">
        {{ helpers.formatComma(item.raw.numViolatedRows) }}
      </div>
    </template>
    <template #item.numDenominatorRows="{ item }">
      <div class="text-right">
        {{ helpers.formatComma(item.raw.numDenominatorRows) }}
      </div>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { VDataTable } from "vuetify/labs/VDataTable";
import SelectColumns from "@/features/selectColumns";
import NestedMenu from "@/features/nestedMenu/NestedMenu.vue";
import Codemirror from "codemirror-editor-vue3";
import { links } from "@/shared/config/links";
import { helpers } from "@/shared/lib/mixins";
import { useStore } from "vuex";
import { computed, onBeforeMount, Ref, ref, watch } from "vue";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";
import { debounce } from "lodash";
import { useRoute, useRouter } from "vue-router";
const store = useStore();
const route = useRoute();
const router = useRouter();

const expanded = ref([]);
const chooseFilter: Ref<boolean> = ref(false);
const filters = ref({
  failed: [],
  cdmTableName: [],
  cdmFieldName: [],
  checkName: [],
  notesExist: [],
  category: [],
  subcategory: [],
  context: [],
  checkLevel: [],
});
const selectedFilter = ref([]);
const headers: Ref<DataTableHeader[]> = ref([
  {
    title: "Status",
    sortable: true,
    key: "failed",
    show: true,
    default: true,
  },
  {
    title: "Table",
    sortable: true,
    key: "cdmTableName",
    show: true,
    default: true,
  },
  {
    title: "Field",
    sortable: true,
    key: "cdmFieldName",
    show: false,
    default: false,
  },
  {
    title: "Check",
    sortable: true,
    key: "checkName",
    show: false,
    default: false,
  },
  {
    title: "Category",
    sortable: true,
    key: "category",
    show: false,
    default: false,
  },
  {
    title: "Subcategory",
    sortable: true,
    key: "subcategory",
    show: false,
    default: false,
  },
  {
    title: "Context",
    sortable: true,
    key: "contexts",
    show: false,
    default: false,
  },
  {
    title: "Level",
    sortable: true,
    key: "checkLevel",
    show: false,
    default: false,
  },
  {
    title: "Notes",
    sortable: true,
    key: "notesExist",
    show: false,
    default: false,
  },
  {
    title: "Description",
    sortable: true,
    key: "checkDescription",
    show: true,
    default: true,
  },
  {
    title: "% Records Failed",
    sortable: true,
    key: "pctViolatedRows",
    show: true,
    default: true,
  },
  {
    title: "# Records Failed",
    sortable: true,
    key: "numViolatedRows",
    show: true,
    default: true,
  },
  {
    title: "# Total Records",
    sortable: true,
    key: "numDenominatorRows",
    show: false,
    default: false,
  },
  {
    title: "Execution Duration",
    sortable: true,
    key: "executionTime",
    show: false,
    default: false,
  },
]);
const getConceptDrilldown = function (item) {
  return {
    name: "networkConcept",
    params: {
      domain: item.cdmTableName.toLowerCase(),
      concept: item.conceptId.toString().trim(),
    },
  };
};
const filteredChecks = computed(() => {
  return store.getters.getData.checkResults.filter((d) => {
    return Object.keys(filters.value).every((f) => {
      return filters.value[f].length < 1 || filters.value[f].includes(d[f]);
    });
  });
});
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
const renderDescription = function (d) {
  let thresholdMessage = "";
  if (d.thresholdValue != undefined) {
    thresholdMessage = " (Threshold=" + d.thresholdValue + "%).";
  }
  return d.checkDescription + thresholdMessage;
};
const renderPercentPassed = function (d): string | number {
  return d.pctViolatedRows ? (d.pctViolatedRows * 100).toFixed(2) : 0;
};
const showHeaders = computed((): DataTableHeader[] => {
  return headers.value.filter((header) => header.show);
});
const debouncedSearch = debounce(function (data: string): void {
  router.push({
    query: { ...route.query, search: data },
  });
}, 300);

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

watch(filterParams, (): void => {
  updateColumnsList();
});

onBeforeMount((): void => {
  updateColumnsList();
});
</script>

<style scoped></style>
