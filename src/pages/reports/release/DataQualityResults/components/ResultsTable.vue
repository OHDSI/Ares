<template>
  <DataTable
    show-gridlines
    unstyled
    removableSort
    v-model:expandedRows="expanded"
    size="small"
    v-model:filters="filters"
    :value="checks"
    paginator
    :rows="10"
    filterDisplay="row"
    :globalFilterFields="[
      'cdmTableName',
      'cdmFieldName',
      'failed',
      'category',
      'checkDescription',
    ]"
  >
    <template #header>
      <div class="flex flex-row gap-10">
        <InputGroup unstyled>
          <InputGroupAddon>
            <i class="pi pi-search"></i>
          </InputGroupAddon>
          <InputText
            class="rounded-r-lg"
            style="width: 45rem"
            unstyled
            :value="route.query.search"
            @update:modelValue="debouncedSearch"
            placeholder="Search in Table"
          />
        </InputGroup>
        <MultiSelect
          :pt="{
            root: 'dark:bg-primary-500 bg-primary-400 text-white rounded',
            labelContainer:
              'dark:bg-primary-500 bg-primary-400 text-white rounded',
            trigger: [
              'flex items-center justify-center shrink-0 rounded-tr-md rounded-br-md dark:bg-primary-500 w-12',
            ],
          }"
          v-model="selectedHeaders"
          data-key="title"
          option-label="title"
          option-value="key"
          :options="headers"
          style="width: 15rem"
          placeholder="Select Columns"
        >
          <template #value>
            <span class="uppercase text-white">Select Columns</span>
          </template>
        </MultiSelect>
      </div>
    </template>
    <template #empty> No matching rows </template>
    <Column
      unstyled
      :hidden="!selectedHeaders.includes('failed')"
      sortable
      filter-field="failed"
      :show-filter-menu="false"
      :show-clear-button="false"
      field="failed"
      header="Status"
    >
      <template #body="{ data }">
        {{ data.failed }}
      </template>
      <template #filter="{ filterModel, filterCallback }">
        <MultiSelect
          :maxSelectedLabels="2"
          show-clear
          filter
          v-model="filterModel.value"
          @change="filterCallback()"
          :options="statusOptions"
          placeholder="Select One"
          class="p-column-filter w-full"
          style="min-width: 12rem"
        ></MultiSelect>
      </template>
    </Column>
    <Column
      :show-filter-menu="false"
      :show-clear-button="false"
      :hidden="!selectedHeaders.includes('cdmTableName')"
      sortable
      header="Table"
      filterField="cdmTableName"
    >
      <template #body="{ data }">
        <div class="flex align-items-center gap-2">
          {{ data.cdmTableName }}
        </div>
      </template>
      <template #filter="{ filterModel, filterCallback }">
        <MultiSelect
          show-clear
          filter
          v-model="filterModel.value"
          @change="filterCallback()"
          :options="cdmTableNamesOptions"
          :maxSelectedLabels="2"
          placeholder="Select One"
          class="p-column-filter w-full"
          style="min-width: 12rem"
        >
          <template #option="slotProps">
            {{ slotProps.option }}
          </template>
        </MultiSelect>
      </template>
    </Column>
    <Column
      :maxSelectedLabels="2"
      :show-filter-menu="false"
      :show-clear-button="false"
      :pt="{ headerContent: 'justify-end' }"
      :hidden="!selectedHeaders.includes('cdmFieldName')"
      sortable
      field="cdmFieldName"
      filter-field="cdmFieldName"
      header="Field"
      style="min-width: 12rem; text-align: end"
    >
      <template #body="{ data }">
        {{ data.cdmFieldName }}
      </template>
      <template #filter="{ filterModel, filterCallback }">
        <MultiSelect
          filter
          v-model="filterModel.value"
          @change="filterCallback()"
          :options="cdmFieldNameOptions"
          placeholder="Select One"
          class="p-column-filter w-full"
          style="min-width: 12rem"
        >
          <template #option="slotProps">
            {{ slotProps.option }}
          </template>
        </MultiSelect>
      </template>
    </Column>
    <Column
      :show-filter-menu="false"
      :show-clear-button="false"
      :hidden="!selectedHeaders.includes('checkName')"
      sortable
      filter-field="checkName"
      field="checkName"
      header="Check"
      style="text-align: end; min-width: 12rem"
      :pt="{ headerContent: 'justify-end' }"
    >
      <template #body="{ data }">
        {{ data.checkName }}
      </template>
      <template #filter="{ filterModel, filterCallback }">
        <MultiSelect
          :maxSelectedLabels="2"
          filter
          v-model="filterModel.value"
          @change="filterCallback()"
          :options="checkNameOptions"
          placeholder="Select One"
          class="p-column-filter w-full"
          style="min-width: 12rem"
        >
          <template #option="slotProps">
            {{ slotProps.option }}
          </template>
        </MultiSelect>
      </template>
    </Column>
    <Column
      :show-filter-menu="false"
      :show-clear-button="false"
      style="text-align: end; min-width: 12rem"
      :pt="{ headerContent: 'justify-end' }"
      :hidden="!selectedHeaders.includes('category')"
      sortable
      filter-field="category"
      field="category"
      header="Category"
    >
      <template #body="{ data }">
        {{ data.category }}
      </template>
      <template #filter="{ filterModel, filterCallback }">
        <MultiSelect
          :maxSelectedLabels="2"
          filter
          v-model="filterModel.value"
          @change="filterCallback()"
          :options="categoryOptions"
          placeholder="Select One"
          class="p-column-filter w-full"
          style="min-width: 12rem"
        >
          <template #option="slotProps">
            {{ slotProps.option }}
          </template>
        </MultiSelect>
      </template>
    </Column>
    <Column
      :show-filter-menu="false"
      :show-clear-button="false"
      style="text-align: end; min-width: 12rem"
      :pt="{ headerContent: 'justify-end' }"
      :hidden="!selectedHeaders.includes('subcategory')"
      sortable
      filter-field="subcategory"
      field="subcategory"
      header="Subcategory"
    >
      <template #body="slotProps">
        {{ slotProps.data.subcategory ? slotProps.data.subcategory : "None" }}
      </template>
      <template #filter="{ filterModel, filterCallback }">
        <MultiSelect
          :maxSelectedLabels="2"
          filter
          v-model="filterModel.value"
          @change="filterCallback()"
          :options="subcategoryOptions"
          placeholder="Select One"
          class="p-column-filter w-full"
          style="min-width: 12rem"
        >
          <template #option="slotProps">
            {{ slotProps.option }}
          </template>
        </MultiSelect>
      </template>
    </Column>
    <Column
      :show-filter-menu="false"
      :show-clear-button="false"
      style="text-align: end; min-width: 12rem"
      :pt="{ headerContent: 'justify-end' }"
      :hidden="!selectedHeaders.includes('context')"
      sortable
      filter-field="context"
      field="context"
      header="Context"
    >
      <template #body="{ data }">
        {{ data.context }}
      </template>
      <template #filter="{ filterModel, filterCallback }">
        <MultiSelect
          :maxSelectedLabels="2"
          filter
          v-model="filterModel.value"
          @change="filterCallback()"
          :options="contextsOptions"
          placeholder="Select One"
          class="p-column-filter w-full"
          style="min-width: 12rem"
        >
          <template #option="slotProps">
            {{ slotProps.option }}
          </template>
        </MultiSelect>
      </template>
    </Column>
    <Column
      :show-filter-menu="false"
      :show-clear-button="false"
      style="text-align: end; min-width: 12rem"
      :pt="{ headerContent: 'justify-end' }"
      :hidden="!selectedHeaders.includes('checkLevel')"
      sortable
      filter-field="checkLevel"
      field="checkLevel"
      header="Check Level"
    >
      <template #filter="{ filterModel, filterCallback }">
        <MultiSelect
          :maxSelectedLabels="2"
          filter
          v-model="filterModel.value"
          @change="filterCallback()"
          :options="checkLevelOptions"
          placeholder="Select One"
          class="p-column-filter w-full"
          style="min-width: 12rem"
        >
          <template #option="slotProps">
            {{ slotProps.option }}
          </template>
        </MultiSelect>
      </template>
    </Column>
    <Column
      :show-filter-menu="false"
      :show-clear-button="false"
      style="text-align: end; min-width: 12rem"
      :pt="{ headerContent: 'justify-end' }"
      :hidden="!selectedHeaders.includes('notesExist')"
      sortable
      filter-field="notesExist"
      field="notesExist"
      header="Notes"
    >
      <template #filter="{ filterModel, filterCallback }">
        <MultiSelect
          :maxSelectedLabels="2"
          filter
          v-model="filterModel.value"
          @change="filterCallback()"
          :options="notesExistOptions"
          placeholder="Select One"
          class="p-column-filter w-full"
          style="min-width: 12rem"
        >
          <template #option="slotProps">
            {{ slotProps.option }}
          </template>
        </MultiSelect>
      </template>
    </Column>
    <Column
      style="text-align: end; min-width: 12rem"
      :pt="{ headerContent: 'justify-end' }"
      :hidden="!selectedHeaders.includes('checkDescription')"
      sortable
      field="checkDescription"
      header="Description"
    >
      <template #body="slotProps">
        {{ renderDescription(slotProps.data) }}
      </template>
    </Column>
    <Column
      style="text-align: end; min-width: 12rem"
      :pt="{ headerContent: 'justify-end' }"
      :hidden="!selectedHeaders.includes('pctViolatedRows')"
      sortable
      field="pctViolatedRows"
      header="% Records Failed"
    >
      <template #body="slotProps">
        <div class="text-right">
          {{ renderPercentPassed(slotProps.data) }} %
        </div>
      </template>
    </Column>
    <Column
      style="text-align: end; min-width: 12rem"
      :pt="{ headerContent: 'justify-end' }"
      :hidden="!selectedHeaders.includes('numViolatedRows')"
      sortable
      field="numViolatedRows"
      header="# Records Failed"
    >
      <template #body="slotProps">
        {{ helpers.formatComma(slotProps.data.numViolatedRows) }}
      </template>
    </Column>
    <Column
      style="text-align: end; min-width: 12rem"
      :pt="{ headerContent: 'justify-end' }"
      :hidden="!selectedHeaders.includes('numDenominatorRows')"
      sortable
      field="numDenominatorRows"
      header="# Total Records"
    >
      <template #body="slotProps">
        <div class="text-right">
          {{ helpers.formatComma(slotProps.data.numDenominatorRows) }}
        </div>
      </template>
    </Column>
    <Column
      style="text-align: end; min-width: 12rem"
      :pt="{ headerContent: 'justify-end' }"
      :hidden="!selectedHeaders.includes('executionTime')"
      sortable
      field="executionTime"
      header="Execution Duration"
    >
    </Column>

    <Column expander style="width: 5rem" />

    <template #expansion="slotProps">
      <div class="p-3 flex flex-col gap-2">
        <table>
          <tr>
            <td>
              <h3 class="font-bold" cols="2">Check Name</h3>
            </td>
            <td>
              <p>{{ slotProps.data.checkName }}</p>
            </td>
          </tr>
          <tr>
            <td><h3 class="font-bold">Description</h3></td>
            <td>
              <div>
                {{ slotProps.data.checkDescription }} (threshold
                {{ slotProps.data.thresholdValue }}%)
              </div>
            </td>
          </tr>
          <tr>
            <td><h3 class="font-bold" cols="2">Threshold</h3></td>
            <td>
              <p>{{ slotProps.data.thresholdValue }}</p>
            </td>
          </tr>
          <tr>
            <td><h3 class="font-bold" cols="2">Notes</h3></td>
            <td>
              <p>{{ slotProps.data.noteValue }}</p>
            </td>
          </tr>
          <tr>
            <td><h3 class="font-bold" cols="2">Check Level</h3></td>
            <td>
              <p>{{ slotProps.data.checkLevel }}</p>
            </td>
          </tr>
          <tr>
            <td><h3 class="font-bold" cols="2">Table</h3></td>
            <td>
              <p>
                <a
                  :href="links.getDocsLink(slotProps.data.cdmTableName)"
                  target="_blank"
                >
                  {{ slotProps.data.cdmTableName }}
                  <!--                <v-icon small>mdi-open-in-new</v-icon>-->
                </a>
              </p>
            </td>
          </tr>
          <tr>
            <td>
              <h3 class="font-bold" cols="2">Field</h3>
            </td>
            <td>
              <p>{{ slotProps.data.cdmFieldName }}</p>
            </td>
          </tr>
          <tr>
            <td>
              <h3 class="font-bold" cols="2">Concept Id</h3>
            </td>
            <td>
              <p>
                <router-link
                  v-if="slotProps.data.conceptId != undefined"
                  :to="getConceptDrilldown(slotProps.data)"
                  color="primary"
                >
                  {{ slotProps.data.conceptId }}
                  <!--                <v-icon small>mdi-open-in-new</v-icon>-->
                </router-link>
              </p>
            </td>
          </tr>
          <tr>
            <td><h3 class="font-bold" cols="2">Unit Concept Id</h3></td>
            <td>
              <p>{{ slotProps.data.UNIT_conceptId }}</p>
            </td>
          </tr>
          <tr>
            <td>
              <h3 class="font-bold" cols="2"># Rows Violated</h3>
            </td>
            <td>
              <p>{{ slotProps.data.numViolatedRows }}</p>
            </td>
          </tr>
          <tr>
            <td><h3 class="font-bold" cols="2"># Rows Total</h3></td>
            <td>
              <p>{{ slotProps.data.numDenominatorRows }}</p>
            </td>
          </tr>
          <tr>
            <td>
              <h3 class="font-bold" cols="2">% Rows Violated</h3>
            </td>
            <td>
              <p>{{ (slotProps.data.pctViolatedRows * 100).toFixed(2) }} %</p>
            </td>
          </tr>
          <tr>
            <td><h3 class="font-bold" cols="2">Execution Time</h3></td>
            <td>
              <p>{{ slotProps.data.executionTime }}</p>
            </td>
          </tr>
          <tr>
            <td><h3 class="font-bold" cols="2">Errors</h3></td>
            <td>
              <p>{{ slotProps.data.ERROR }}</p>
            </td>
          </tr>
          <tr>
            <td><h3 class="font-bold" cols="2">SQL Query</h3></td>
            <td>
              <Codemirror
                :model-value="slotProps.data.queryText"
                :extensions="extensions"
                disabled
              ></Codemirror>
            </td>
          </tr>
        </table>
      </div>
    </template>
  </DataTable>
</template>

<script setup lang="ts">
import { links } from "@/shared/config/links";
import { helpers } from "@/shared/lib/mixins";
import { useStore } from "vuex";
import { computed, onBeforeMount, Ref, ref, watch } from "vue";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";
import { debounce } from "lodash";
import { useRoute, useRouter } from "vue-router";
import { Codemirror } from "vue-codemirror";
import { sql } from "@codemirror/lang-sql";
import { oneDark } from "@codemirror/theme-one-dark";
const store = useStore();
const route = useRoute();
const router = useRouter();
import { FilterMatchMode } from "primevue/api";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import MultiSelect from "primevue/multiselect";

const checks = ref(store.getters.getData.checkResults);

const extensions = [sql(), oneDark];

//filter field options
const statusOptions = computed(() => {
  return helpers.getValuesArray(checks.value, "failed", true);
});

const cdmTableNamesOptions = computed(() => {
  return helpers.getValuesArray(checks.value, "cdmTableName", true);
});

const cdmFieldNameOptions = computed(() => {
  return helpers.getValuesArray(checks.value, "cdmFieldName", true);
});
const checkNameOptions = computed(() => {
  return helpers.getValuesArray(checks.value, "checkName", true);
});
const categoryOptions = computed(() => {
  return helpers.getValuesArray(checks.value, "category", true);
});
const subcategoryOptions = computed(() => {
  return helpers.getValuesArray(checks.value, "subcategory", true);
});
const contextsOptions = computed(() => {
  return helpers.getValuesArray(checks.value, "context", true);
});
const checkLevelOptions = computed(() => {
  return helpers.getValuesArray(checks.value, "checkLevel", true);
});
const notesExistOptions = computed(() => {
  return helpers.getValuesArray(checks.value, "notesExist", true);
});

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  failed: { value: null, matchMode: FilterMatchMode.IN },
  cdmTableName: { value: null, matchMode: FilterMatchMode.IN },
  cdmFieldName: { value: null, matchMode: FilterMatchMode.IN },
  checkName: { value: null, matchMode: FilterMatchMode.IN },
  category: { value: null, matchMode: FilterMatchMode.IN },
  subcategory: { value: null, matchMode: FilterMatchMode.IN },
  context: { value: null, matchMode: FilterMatchMode.IN },
  checkLevel: { value: null, matchMode: FilterMatchMode.IN },
  notesExist: { value: null, matchMode: FilterMatchMode.IN },
});

const expanded = ref([]);

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
    key: "context",
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

const selectedHeaders = ref([]);

const setDefaultSelectedHeaders = function () {
  selectedHeaders.value = Object.values(headers.value)
    .filter((value) => value.show)
    .reduce((acc, val) => [...acc, val.key], []);
};
const getConceptDrilldown = function (item) {
  return {
    name: "networkConcept",
    params: {
      domain: item.cdmTableName.toLowerCase(),
      concept: item.conceptId.toString().trim(),
    },
  };
};
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

const debouncedSearch = debounce(function (data: string): void {
  router
    .push({
      query: {
        search: data,
      },
    })
    .then(() => {
      filters.value.global.value = route.query.search;
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
  selectedHeaders.value = [...selectedHeaders.value, ...parsedParams];
};

const updateFiltersFromUrl = function (): void {
  const parsedParams = JSON.parse(filterParams.value);

  for (const key in filters.value) {
    if (parsedParams[key]) {
      filters.value[key].value = parsedParams[key];
    } else {
      filters.value[key].value = null;
    }
  }
};

watch(filterParams, (): void => {
  updateColumnsList();
  updateFiltersFromUrl();
});

onBeforeMount((): void => {
  setDefaultSelectedHeaders();
  updateColumnsList();
  updateFiltersFromUrl();
});

watch(route, () => {
  setDefaultSelectedHeaders();
});
</script>

<style>
td {
  max-width: 300px;
  overflow: auto;
  text-overflow: ellipsis;
  word-break: break-word;
}
</style>
