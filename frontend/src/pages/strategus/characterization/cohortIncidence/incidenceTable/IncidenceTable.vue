<template>
  <div class="table-filters">
    <div>
      <label class="field-label">Database</label>
      <MultiSelect
        v-model="tableDatabases"
        :options="uniqueDatabases"
        placeholder="All"
        filter
        :pt="colSelectorPt"
        display="chip"
        class="w-full"
      />
    </div>
  </div>
  <TableToolbar
    v-model:search="search"
    v-model:columns="selectedColumns"
    :column-options="columnOptions"
    v-model:show-filters="showFilters"
    v-model:fullscreen="localFullscreen"
    :table-ref="tableRef"
    :rows="filteredRows"
    :search-error="searchError"
    :search-suggestions="searchSuggestions"
    filename="cohort-incidence"
    :has-active-filters="hasActiveFilters"
    @clear-filters="clearFilters"
  >
    <div class="strat-checks">
      <div>
        <Checkbox
          v-model="includeAge"
          :binary="true"
          inputId="ageStrat"
        /><label for="ageStrat">Age stratified</label>
      </div>
      <div>
        <Checkbox
          v-model="includeSex"
          :binary="true"
          inputId="sexStrat"
        /><label for="sexStrat">Sex stratified</label>
      </div>
      <div>
        <Checkbox
          v-model="includeYear"
          :binary="true"
          inputId="yearStrat"
        /><label for="yearStrat">Year stratified</label>
      </div>
    </div>
  </TableToolbar>

  <DataTable
    v-if="tableRows.length"
    ref="tableRef"
    :value="filteredRows"
    :paginator="true"
    :rows="25"
    :rowsPerPageOptions="[10, 25, 50, 100]"
    sortMode="multiple"
    removableSort
    :striped-rows="store.getters.getSettings.strippedRows"
    size="small"
    class="result-table mt-3"
  >
    <Column
      :hidden="!selectedColumns.includes('databaseName')"
      style="text-align: start"
      :pt="{ headerContent: 'justify-start' }"
      field="databaseName"
      sortable
      :showFilterMenu="false"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Database</span>
          <FilterInput
            v-if="showFilters"
            :filterObj="tableFilters.databaseName"
            placeholder="Search..."
          />
        </div>
      </template>
    </Column>
    <Column
      :hidden="!selectedColumns.includes('outcomeName')"
      style="text-align: start"
      :pt="{ headerContent: 'justify-start' }"
      field="outcomeName"
      sortable
      :showFilterMenu="false"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Outcome</span>
          <Dropdown
            v-if="showFilters"
            v-model="tableFilters.outcomeName.value"
            :options="uniqueOutcomeNames"
            placeholder="All"
            :showClear="true"
            class="filter-dropdown"
            @click.stop
          />
        </div>
      </template>
    </Column>
    <Column
      :hidden="!selectedColumns.includes('tar')"
      style="text-align: start"
      :pt="{ headerContent: 'justify-start' }"
      field="tar"
      sortable
      :showFilterMenu="false"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>TAR</span>
          <Dropdown
            v-if="showFilters"
            v-model="tableFilters.tar.value"
            :options="uniqueTars"
            placeholder="All"
            :showClear="true"
            class="filter-dropdown"
            @click.stop
          />
        </div>
      </template>
    </Column>
    <Column
      :hidden="!selectedColumns.includes('ageGroupName')"
      style="text-align: start"
      :pt="{ headerContent: 'justify-start' }"
      field="ageGroupName"
      sortable
      :showFilterMenu="false"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Age</span>
          <FilterInput
            v-if="showFilters"
            :filterObj="tableFilters.ageGroupName"
            placeholder="Search..."
          />
        </div>
      </template>
    </Column>
    <Column
      :hidden="!selectedColumns.includes('genderName')"
      style="text-align: start"
      :pt="{ headerContent: 'justify-start' }"
      field="genderName"
      sortable
      :showFilterMenu="false"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Sex</span>
          <FilterInput
            v-if="showFilters"
            :filterObj="tableFilters.genderName"
            placeholder="Search..."
          />
        </div>
      </template>
    </Column>
    <Column
      :hidden="!selectedColumns.includes('startYear')"
      style="text-align: end"
      :pt="{ headerContent: 'justify-end' }"
      field="startYear"
      sortable
      :showFilterMenu="false"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Year</span>
          <FilterInput
            v-if="showFilters"
            :filterObj="tableFilters.startYear"
            placeholder="Filter..."
          />
        </div>
      </template>
    </Column>
    <Column
      :hidden="!selectedColumns.includes('cleanWindow')"
      style="text-align: end"
      :pt="{ headerContent: 'justify-end' }"
      field="cleanWindow"
      sortable
      :showFilterMenu="false"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Clean Win.</span>
          <Dropdown
            v-if="showFilters"
            v-model="tableFilters.cleanWindow.value"
            :options="uniqueCleanWindows"
            placeholder="All"
            :showClear="true"
            class="filter-dropdown"
            @click.stop
          />
        </div>
      </template>
    </Column>
    <Column
      :hidden="!selectedColumns.includes('personsAtRisk')"
      style="text-align: end"
      :pt="{ headerContent: 'justify-end' }"
      field="personsAtRisk"
      sortable
      :showFilterMenu="false"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Persons</span>
          <FilterInput
            v-if="showFilters"
            :filterObj="tableFilters.personsAtRisk"
            type="numeric"
          />
        </div>
      </template>
    </Column>
    <Column
      :hidden="!selectedColumns.includes('personDays')"
      style="text-align: end"
      :pt="{ headerContent: 'justify-end' }"
      field="personDays"
      sortable
      :showFilterMenu="false"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Person Days</span>
          <FilterInput
            v-if="showFilters"
            :filterObj="tableFilters.personDays"
            type="numeric"
          />
        </div>
      </template>
    </Column>
    <Column
      :hidden="!selectedColumns.includes('outcomes')"
      style="text-align: end"
      :pt="{ headerContent: 'justify-end' }"
      field="outcomes"
      sortable
      :showFilterMenu="false"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Outcomes</span>
          <FilterInput
            v-if="showFilters"
            :filterObj="tableFilters.outcomes"
            type="numeric"
          />
        </div>
      </template>
    </Column>
    <Column
      :hidden="!selectedColumns.includes('incidenceProportionP100p')"
      style="text-align: end"
      :pt="{ headerContent: 'justify-end' }"
      field="incidenceProportionP100p"
      sortable
      :showFilterMenu="false"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Prop. /100p</span>
          <FilterInput
            v-if="showFilters"
            :filterObj="tableFilters.incidenceProportionP100p"
            type="numeric"
          />
        </div>
      </template>
      <template #body="{ data }">{{
        formatNum(data.incidenceProportionP100p)
      }}</template>
    </Column>
    <Column
      :hidden="!selectedColumns.includes('incidenceRateP100py')"
      style="text-align: end"
      :pt="{ headerContent: 'justify-end' }"
      field="incidenceRateP100py"
      sortable
      :showFilterMenu="false"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Rate /100py</span>
          <FilterInput
            v-if="showFilters"
            :filterObj="tableFilters.incidenceRateP100py"
            type="numeric"
          />
        </div>
      </template>
      <template #body="{ data }">{{
        formatNum(data.incidenceRateP100py)
      }}</template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import TableToolbar from "@/widgets/tableToolbar";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import MultiSelect from "primevue/multiselect";
import Dropdown from "primevue/dropdown";
import Checkbox from "primevue/checkbox";
import FilterInput from "../../shared/filterInput";
import { FilterMatchMode } from "primevue/api";
import { colSelectorPt } from "../../shared/colSelectorPt";
import { formatNum } from "@/shared/lib/formatters";
import { useTableFilter } from "../../shared/useTableFilter";
import { useStore } from "vuex";
import { UPDATE_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";
import { useTableUrlState } from "@/shared/lib/composables/useTableUrlState";

const props = defineProps<{
  data: any[];
  isFullscreen: boolean;
}>();

const emit = defineEmits<{
  (e: "update:fullscreen", val: boolean): void;
}>();

const store = useStore();

const localFullscreen = computed({
  get: () => props.isFullscreen,
  set: (val: boolean) => emit("update:fullscreen", val),
});

const STORAGE_KEY = "char:cohortIncidence";
const urlState = useTableUrlState(STORAGE_KEY);

const columnOptions = [
  { label: "Database", key: "databaseName" },
  { label: "Outcome", key: "outcomeName" },
  { label: "TAR", key: "tar" },
  { label: "Age", key: "ageGroupName" },
  { label: "Sex", key: "genderName" },
  { label: "Year", key: "startYear" },
  { label: "Clean Win.", key: "cleanWindow" },
  { label: "Persons at Risk", key: "personsAtRisk" },
  { label: "Person Days", key: "personDays" },
  { label: "Outcomes", key: "outcomes" },
  { label: "Prop. /100p", key: "incidenceProportionP100p" },
  { label: "Rate /100py", key: "incidenceRateP100py" },
];

const CI_DEFAULT_COLUMNS = [
  "databaseName",
  "outcomeName",
  "tar",
  "personsAtRisk",
  "outcomes",
  "incidenceProportionP100p",
  "incidenceRateP100py",
];

const _urlCols = urlState.readState().cols;
const selectedColumns = ref(
  _urlCols?.length
    ? _urlCols
    : store.getters.getSettings.columnSelection?.[STORAGE_KEY]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY]
    : CI_DEFAULT_COLUMNS
);

let _tableReady = false;

watch(selectedColumns, (val) => {
  if (!_tableReady) return;
  urlState.writeState({ cols: val });
  store.dispatch(UPDATE_COLUMN_SELECTION, { [STORAGE_KEY]: val });
});

const tableRef = ref(null);
const search = ref("");
const showFilters = ref(false);
const tableDatabases = ref<string[]>([]);
const includeAge = ref(false);
const includeSex = ref(false);
const includeYear = ref(false);

watch(search, (val) => {
  if (_tableReady) urlState.writeState({ search: val });
});
watch(showFilters, (val) => {
  if (_tableReady) urlState.writeState({ showFilters: val });
});
const tableRows = ref<any[]>([]);

const tableFilters = ref({
  databaseName: { value: null as any, matchMode: FilterMatchMode.CONTAINS },
  outcomeName: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  tar: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  ageGroupName: { value: null as any, matchMode: FilterMatchMode.CONTAINS },
  genderName: { value: null as any, matchMode: FilterMatchMode.CONTAINS },
  startYear: { value: null as any, matchMode: FilterMatchMode.CONTAINS },
  cleanWindow: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  personsAtRisk: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  personDays: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  outcomes: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  incidenceProportionP100p: {
    value: null as any,
    matchMode: FilterMatchMode.EQUALS,
  },
  incidenceRateP100py: {
    value: null as any,
    matchMode: FilterMatchMode.EQUALS,
  },
});

const dropdownFilters = ref({} as Record<string, any>);

const searchSuggestions = [
  "databaseName",
  "outcomeName",
  "tar",
  "ageGroupName",
  "genderName",
  "startYear",
  "cleanWindow",
  "personsAtRisk",
  "personDays",
  "outcomes",
  "incidenceProportionP100p",
  "incidenceRateP100py",
];

const { filteredRows, applyNow, searchError, hasActiveFilters, clearFilters } =
  useTableFilter(
    () => tableRows.value,
    dropdownFilters,
    tableFilters,
    search,
    ref({} as Record<string, string>),
    tableRef
  );

const uniqueDatabases = computed(() =>
  [...new Set(props.data.map((r) => r.databaseName))].sort()
);
const uniqueOutcomeNames = computed(() =>
  [...new Set(props.data.map((r) => r.outcomeName))].sort()
);
const uniqueTars = computed(() => [...new Set(props.data.map((r) => r.tar))]);
const uniqueCleanWindows = computed(() => [
  ...new Set(props.data.map((r) => String(r.cleanWindow))),
]);

function applyTableFilter() {
  let data = props.data;
  if (tableDatabases.value.length)
    data = data.filter((r) => tableDatabases.value.includes(r.databaseName));
  if (!includeAge.value) data = data.filter((r) => r.ageGroupName === "Any");
  if (!includeSex.value) data = data.filter((r) => r.genderName === "Any");
  if (!includeYear.value) data = data.filter((r) => r.startYear === "Any");
  tableRows.value = data;
}

watch([tableDatabases, includeAge, includeSex, includeYear], () => {
  applyTableFilter();
  applyNow();
});

watch(
  () => props.data,
  () => {
    tableDatabases.value = [...uniqueDatabases.value];
    applyTableFilter();
    applyNow();
  },
  { immediate: true }
);

function writeFiltersToUrl() {
  if (!_tableReady) return;
  const merged: Record<string, any> = {};
  for (const [k, f] of Object.entries(tableFilters.value)) {
    if (f.value != null && f.value !== "")
      merged[k] = { v: f.value, m: f.matchMode };
  }
  const allDbs = uniqueDatabases.value;
  if (
    tableDatabases.value.length !== allDbs.length ||
    tableDatabases.value.some((d) => !allDbs.includes(d))
  ) {
    merged["_dbs"] = tableDatabases.value;
  }
  if (includeAge.value) merged["_age"] = "1";
  if (includeSex.value) merged["_sex"] = "1";
  if (includeYear.value) merged["_yr"] = "1";
  urlState.writeState({ filters: Object.keys(merged).length ? merged : null });
}
watch(tableFilters, writeFiltersToUrl, { deep: true });
watch(tableDatabases, writeFiltersToUrl, { deep: true });
watch(includeAge, writeFiltersToUrl);
watch(includeSex, writeFiltersToUrl);
watch(includeYear, writeFiltersToUrl);

onMounted(async () => {
  const state = urlState.readState();
  if (state.search) search.value = state.search;
  if (state.showFilters) showFilters.value = true;
  if (state.filters) {
    for (const [k, v] of Object.entries(state.filters)) {
      if (k === "_dbs") {
        tableDatabases.value = v as string[];
        continue;
      }
      if (k === "_age") {
        includeAge.value = true;
        continue;
      }
      if (k === "_sex") {
        includeSex.value = true;
        continue;
      }
      if (k === "_yr") {
        includeYear.value = true;
        continue;
      }
      if (k in tableFilters.value) {
        const e = v as any;
        if (e && typeof e === "object" && "v" in e) {
          tableFilters.value[k].value = e.v;
          tableFilters.value[k].matchMode = e.m;
        } else {
          tableFilters.value[k].value = e;
        }
      }
    }
    applyTableFilter();
    applyNow();
  }
  await nextTick();
  _tableReady = true;
});
</script>

<style scoped>
@import "../../shared/styles.css";

.table-filters {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.table-filters > div:first-child {
  min-width: 250px;
}

:deep(.p-sortable-column-icon) {
  opacity: 0.15;
  transition: opacity 0.15s;
}
:deep(.p-sortable-column:hover .p-sortable-column-icon),
:deep(.p-highlight .p-sortable-column-icon) {
  opacity: 1;
}

.strat-checks {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.strat-checks > div {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
}

.mt-3 {
  margin-top: 0.75rem;
}

.filter-dropdown {
  width: 100%;
  font-size: 0.75rem;
}
:deep(.filter-dropdown .p-dropdown-label) {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}
</style>
