<template>
  <TableToolbar
    v-model:search="search"
    v-model:columns="tableSelectedColumns"
    :column-options="tableColumnOptions"
    v-model:show-filters="showFilters"
    v-model:fullscreen="localFullscreen"
    :table-ref="tableRef"
    :rows="filteredRows"
    :search-error="searchError"
    :search-suggestions="searchSuggestions"
    filename="time-to-event"
  />
  <DataTable
    ref="tableRef"
    :value="filteredRows"
    :paginator="true"
    :rows="25"
    :rowsPerPageOptions="[10, 25, 50, 100]"
    sortMode="multiple"
    removableSort
    :striped-rows="store.getters.getSettings.strippedRows"
    size="small"
    class="result-table"
  >
    <Column
      :hidden="!tableSelectedColumns.includes('databaseName')"
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
      :hidden="!tableSelectedColumns.includes('targetName')"
      style="text-align: start"
      :pt="{ headerContent: 'justify-start' }"
      field="targetName"
      sortable
      :showFilterMenu="false"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Target</span>
          <FilterInput
            v-if="showFilters"
            :filterObj="tableFilters.targetName"
            placeholder="Search..."
          />
        </div>
      </template>
    </Column>
    <Column
      :hidden="!tableSelectedColumns.includes('outcomeName')"
      style="text-align: start"
      :pt="{ headerContent: 'justify-start' }"
      field="outcomeName"
      sortable
      :showFilterMenu="false"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Outcome</span>
          <FilterInput
            v-if="showFilters"
            :filterObj="tableFilters.outcomeName"
            placeholder="Search..."
          />
        </div>
      </template>
    </Column>
    <Column
      :hidden="!tableSelectedColumns.includes('outcomeType')"
      style="text-align: start"
      :pt="{ headerContent: 'justify-start' }"
      field="outcomeType"
      sortable
      :showFilterMenu="false"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Outcome Type</span>
          <FilterInput
            v-if="showFilters"
            :filterObj="tableFilters.outcomeType"
            placeholder="Search..."
          />
        </div>
      </template>
    </Column>
    <Column
      :hidden="!tableSelectedColumns.includes('targetOutcomeType')"
      style="text-align: start"
      :pt="{ headerContent: 'justify-start' }"
      field="targetOutcomeType"
      sortable
      :showFilterMenu="false"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Timing</span>
          <FilterInput
            v-if="showFilters"
            :filterObj="tableFilters.targetOutcomeType"
            placeholder="Search..."
          />
        </div>
      </template>
    </Column>
    <Column
      :hidden="!tableSelectedColumns.includes('timeToEvent')"
      style="text-align: end"
      :pt="{ headerContent: 'justify-end' }"
      field="timeToEvent"
      sortable
      :showFilterMenu="false"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Days</span>
          <FilterInput
            v-if="showFilters"
            :filterObj="tableFilters.timeToEvent"
            type="numeric"
          />
        </div>
      </template>
    </Column>
    <Column
      :hidden="!tableSelectedColumns.includes('numEvents')"
      style="text-align: end"
      :pt="{ headerContent: 'justify-end' }"
      field="numEvents"
      sortable
      :showFilterMenu="false"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span># Events</span>
          <FilterInput
            v-if="showFilters"
            :filterObj="tableFilters.numEvents"
            type="numeric"
          />
        </div>
      </template>
      <template #body="{ data }">
        <CensoredCell :text="formatCensored(data.numEvents)" />
      </template>
    </Column>
    <Column
      :hidden="!tableSelectedColumns.includes('timeScale')"
      style="text-align: start"
      :pt="{ headerContent: 'justify-start' }"
      field="timeScale"
      sortable
      :showFilterMenu="false"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Scale</span>
          <FilterInput
            v-if="showFilters"
            :filterObj="tableFilters.timeScale"
            placeholder="Search..."
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import TableToolbar from "@/widgets/tableToolbar";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { FilterMatchMode } from "primevue/api";
import CensoredCell from "../../shared/censoredCell";
import FilterInput from "../../shared/filterInput";
import { formatCensored } from "@/shared/lib/formatters";
import { useStore } from "vuex";
import { UPDATE_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";
import { useTableFilter } from "../../shared/useTableFilter";

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

const STORAGE_KEY = "char:timeToEvent";

const tableColumnOptions = [
  { label: "Database", key: "databaseName" },
  { label: "Target", key: "targetName" },
  { label: "Outcome", key: "outcomeName" },
  { label: "Outcome Type", key: "outcomeType" },
  { label: "Timing", key: "targetOutcomeType" },
  { label: "Days", key: "timeToEvent" },
  { label: "# Events", key: "numEvents" },
  { label: "Scale", key: "timeScale" },
];

const TTE_DEFAULT_COLUMNS = [
  "databaseName",
  "outcomeName",
  "outcomeType",
  "targetOutcomeType",
  "timeToEvent",
  "numEvents",
];

const tableSelectedColumns = ref(
  store.getters.getSettings.persistColumnSelection &&
    store.getters.getSettings.columnSelection?.[STORAGE_KEY]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY]
    : TTE_DEFAULT_COLUMNS
);

watch(tableSelectedColumns, (val) => {
  store.dispatch(UPDATE_COLUMN_SELECTION, { [STORAGE_KEY]: val });
});

const tableRef = ref(null);
const search = ref("");
const showFilters = ref(false);

const tableFilters = ref({
  databaseName: { value: null as any, matchMode: FilterMatchMode.CONTAINS },
  targetName: { value: null as any, matchMode: FilterMatchMode.CONTAINS },
  outcomeName: { value: null as any, matchMode: FilterMatchMode.CONTAINS },
  outcomeType: { value: null as any, matchMode: FilterMatchMode.CONTAINS },
  targetOutcomeType: {
    value: null as any,
    matchMode: FilterMatchMode.CONTAINS,
  },
  timeToEvent: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  numEvents: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  timeScale: { value: null as any, matchMode: FilterMatchMode.CONTAINS },
});

const dropdownFilters = ref({} as Record<string, any>);

const searchSuggestions = [
  "databaseName",
  "targetName",
  "outcomeName",
  "outcomeType",
  "targetOutcomeType",
  "timeToEvent",
  "numEvents",
  "timeScale",
];

const { filteredRows, applyNow, searchError } = useTableFilter(
  () => props.data,
  dropdownFilters,
  tableFilters,
  search,
  ref({} as Record<string, string>),
  tableRef
);

watch(
  () => props.data,
  () => applyNow(),
  { immediate: true }
);
</script>

<style scoped>
@import "../../shared/styles.css";

:deep(.p-sortable-column-icon) {
  opacity: 0.15;
  transition: opacity 0.15s;
}
:deep(.p-sortable-column:hover .p-sortable-column-icon),
:deep(.p-highlight .p-sortable-column-icon) {
  opacity: 1;
}
</style>
