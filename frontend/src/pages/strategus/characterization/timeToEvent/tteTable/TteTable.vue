<template>
  <TableToolbar
    v-model:search="search"
    v-model:columns="tableSelectedColumns"
    :column-options="tableColumnOptions"
    v-model:show-filters="showFilters"
    v-model:fullscreen="localFullscreen"
    :table-ref="tableRef"
    :rows="data"
    filename="time-to-event"
  />
  <DataTable
    ref="tableRef"
    :value="data"
    :paginator="true"
    :rows="25"
    :rowsPerPageOptions="[10, 25, 50, 100]"
    :filterDisplay="showFilters ? 'row' : undefined"
    v-model:filters="tableFilters"
    :globalFilterFields="[
      'databaseName',
      'targetName',
      'outcomeName',
      'outcomeType',
      'targetOutcomeType',
      'timeScale',
    ]"
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
      header="Database"
      sortable
      :showFilterMenu="false"
    >
      <template #filter="{ filterModel, filterCallback }">
        <InputText
          v-model="filterModel.value"
          @input="filterCallback()"
          placeholder="Search..."
          size="small"
        />
      </template>
    </Column>
    <Column
      :hidden="!tableSelectedColumns.includes('targetName')"
      style="text-align: start"
      :pt="{ headerContent: 'justify-start' }"
      field="targetName"
      header="Target"
      sortable
      :showFilterMenu="false"
    >
      <template #filter="{ filterModel, filterCallback }">
        <InputText
          v-model="filterModel.value"
          @input="filterCallback()"
          placeholder="Search..."
          size="small"
        />
      </template>
    </Column>
    <Column
      :hidden="!tableSelectedColumns.includes('outcomeName')"
      style="text-align: start"
      :pt="{ headerContent: 'justify-start' }"
      field="outcomeName"
      header="Outcome"
      sortable
      :showFilterMenu="false"
    >
      <template #filter="{ filterModel, filterCallback }">
        <InputText
          v-model="filterModel.value"
          @input="filterCallback()"
          placeholder="Search..."
          size="small"
        />
      </template>
    </Column>
    <Column
      :hidden="!tableSelectedColumns.includes('outcomeType')"
      style="text-align: start"
      :pt="{ headerContent: 'justify-start' }"
      field="outcomeType"
      header="Outcome Type"
      sortable
      :showFilterMenu="false"
    >
      <template #filter="{ filterModel, filterCallback }">
        <InputText
          v-model="filterModel.value"
          @input="filterCallback()"
          placeholder="Search..."
          size="small"
        />
      </template>
    </Column>
    <Column
      :hidden="!tableSelectedColumns.includes('targetOutcomeType')"
      style="text-align: start"
      :pt="{ headerContent: 'justify-start' }"
      field="targetOutcomeType"
      header="Timing"
      sortable
      :showFilterMenu="false"
    >
      <template #filter="{ filterModel, filterCallback }">
        <InputText
          v-model="filterModel.value"
          @input="filterCallback()"
          placeholder="Search..."
          size="small"
        />
      </template>
    </Column>
    <Column
      :hidden="!tableSelectedColumns.includes('timeToEvent')"
      style="text-align: end"
      :pt="{ headerContent: 'justify-end' }"
      field="timeToEvent"
      header="Days"
      sortable
      :showFilterMenu="false"
    >
      <template #filter="{ filterModel, filterCallback }">
        <InputText
          v-model="filterModel.value"
          @input="filterCallback()"
          placeholder="Filter..."
          size="small"
        />
      </template>
    </Column>
    <Column
      :hidden="!tableSelectedColumns.includes('numEvents')"
      style="text-align: end"
      :pt="{ headerContent: 'justify-end' }"
      field="numEvents"
      header="# Events"
      sortable
      :showFilterMenu="false"
    >
      <template #body="{ data }">
        <CensoredCell :text="formatCensored(data.numEvents)" />
      </template>
      <template #filter="{ filterModel, filterCallback }">
        <InputText
          v-model="filterModel.value"
          @input="filterCallback()"
          placeholder="Filter..."
          size="small"
        />
      </template>
    </Column>
    <Column
      :hidden="!tableSelectedColumns.includes('timeScale')"
      style="text-align: start"
      :pt="{ headerContent: 'justify-start' }"
      field="timeScale"
      header="Scale"
      sortable
      :showFilterMenu="false"
    >
      <template #filter="{ filterModel, filterCallback }">
        <InputText
          v-model="filterModel.value"
          @input="filterCallback()"
          placeholder="Search..."
          size="small"
        />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import TableToolbar from "@/widgets/tableToolbar";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";
import CensoredCell from "../../shared/censoredCell";
import { formatCensored } from "@/shared/lib/formatters";
import { useStore } from "vuex";
import { UPDATE_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";

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
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  databaseName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  targetName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  outcomeName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  outcomeType: { value: null, matchMode: FilterMatchMode.CONTAINS },
  targetOutcomeType: { value: null, matchMode: FilterMatchMode.CONTAINS },
  timeToEvent: { value: null, matchMode: FilterMatchMode.CONTAINS },
  numEvents: { value: null, matchMode: FilterMatchMode.CONTAINS },
  timeScale: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

watch(search, (val) => {
  tableFilters.value.global.value = val;
});
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
