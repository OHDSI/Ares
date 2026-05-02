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
    :rows="tableRows"
    filename="cohort-incidence"
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
    :value="tableRows"
    :paginator="true"
    :rows="25"
    :rowsPerPageOptions="[10, 25, 50, 100]"
    :filterDisplay="showFilters ? 'row' : undefined"
    v-model:filters="tableFilters"
    :globalFilterFields="[
      'databaseName',
      'outcomeName',
      'ageGroupName',
      'genderName',
      'startYear',
    ]"
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
      :hidden="!selectedColumns.includes('outcomeName')"
      style="text-align: start"
      :pt="{ headerContent: 'justify-start' }"
      field="outcomeName"
      header="Outcome"
      sortable
      :showFilterMenu="false"
    >
      <template #filter="{ filterModel, filterCallback }">
        <Dropdown
          v-model="filterModel.value"
          :options="uniqueOutcomeNames"
          placeholder="All"
          :showClear="true"
          class="w-full"
          @change="filterCallback()"
        />
      </template>
    </Column>
    <Column
      :hidden="!selectedColumns.includes('tar')"
      style="text-align: start"
      :pt="{ headerContent: 'justify-start' }"
      field="tar"
      header="TAR"
      sortable
      :showFilterMenu="false"
    >
      <template #filter="{ filterModel, filterCallback }">
        <Dropdown
          v-model="filterModel.value"
          :options="uniqueTars"
          placeholder="All"
          :showClear="true"
          class="w-full"
          @change="filterCallback()"
        />
      </template>
    </Column>
    <Column
      :hidden="!selectedColumns.includes('ageGroupName')"
      style="text-align: start"
      :pt="{ headerContent: 'justify-start' }"
      field="ageGroupName"
      header="Age"
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
      :hidden="!selectedColumns.includes('genderName')"
      style="text-align: start"
      :pt="{ headerContent: 'justify-start' }"
      field="genderName"
      header="Sex"
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
      :hidden="!selectedColumns.includes('startYear')"
      style="text-align: end"
      :pt="{ headerContent: 'justify-end' }"
      field="startYear"
      header="Year"
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
      :hidden="!selectedColumns.includes('cleanWindow')"
      style="text-align: end"
      :pt="{ headerContent: 'justify-end' }"
      field="cleanWindow"
      header="Clean Win."
      sortable
      :showFilterMenu="false"
    >
      <template #filter="{ filterModel, filterCallback }">
        <Dropdown
          v-model="filterModel.value"
          :options="uniqueCleanWindows"
          placeholder="All"
          :showClear="true"
          class="w-full"
          @change="filterCallback()"
        />
      </template>
    </Column>
    <Column
      :hidden="!selectedColumns.includes('personsAtRisk')"
      style="text-align: end"
      :pt="{ headerContent: 'justify-end' }"
      field="personsAtRisk"
      header="Persons"
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
      :hidden="!selectedColumns.includes('personDays')"
      style="text-align: end"
      :pt="{ headerContent: 'justify-end' }"
      field="personDays"
      header="Person Days"
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
      :hidden="!selectedColumns.includes('outcomes')"
      style="text-align: end"
      :pt="{ headerContent: 'justify-end' }"
      field="outcomes"
      header="Outcomes"
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
      :hidden="!selectedColumns.includes('incidenceProportionP100p')"
      style="text-align: end"
      :pt="{ headerContent: 'justify-end' }"
      field="incidenceProportionP100p"
      header="Prop. /100p"
      sortable
      :showFilterMenu="false"
    >
      <template #body="{ data }">{{
        formatNum(data.incidenceProportionP100p)
      }}</template>
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
      :hidden="!selectedColumns.includes('incidenceRateP100py')"
      style="text-align: end"
      :pt="{ headerContent: 'justify-end' }"
      field="incidenceRateP100py"
      header="Rate /100py"
      sortable
      :showFilterMenu="false"
    >
      <template #body="{ data }">{{
        formatNum(data.incidenceRateP100py)
      }}</template>
      <template #filter="{ filterModel, filterCallback }">
        <InputText
          v-model="filterModel.value"
          @input="filterCallback()"
          placeholder="Filter..."
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
import MultiSelect from "primevue/multiselect";
import Dropdown from "primevue/dropdown";
import Checkbox from "primevue/checkbox";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";
import { colSelectorPt } from "../../shared/colSelectorPt";
import { formatNum } from "@/shared/lib/formatters";
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

const STORAGE_KEY = "char:cohortIncidence";

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

const selectedColumns = ref(
  store.getters.getSettings.columnSelection?.[STORAGE_KEY]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY]
    : CI_DEFAULT_COLUMNS
);

watch(selectedColumns, (val) => {
  store.dispatch(UPDATE_COLUMN_SELECTION, { [STORAGE_KEY]: val });
});

const tableRef = ref(null);
const search = ref("");
const showFilters = ref(false);
const tableDatabases = ref<string[]>([]);
const includeAge = ref(false);
const includeSex = ref(false);
const includeYear = ref(false);
const tableRows = ref<any[]>([]);

const tableFilters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  databaseName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  outcomeName: { value: null, matchMode: FilterMatchMode.EQUALS },
  tar: { value: null, matchMode: FilterMatchMode.EQUALS },
  ageGroupName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  genderName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  startYear: { value: null, matchMode: FilterMatchMode.CONTAINS },
  cleanWindow: { value: null, matchMode: FilterMatchMode.EQUALS },
  personsAtRisk: { value: null, matchMode: FilterMatchMode.CONTAINS },
  personDays: { value: null, matchMode: FilterMatchMode.CONTAINS },
  outcomes: { value: null, matchMode: FilterMatchMode.CONTAINS },
  incidenceProportionP100p: {
    value: null,
    matchMode: FilterMatchMode.CONTAINS,
  },
  incidenceRateP100py: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

watch(search, (val) => {
  tableFilters.value.global.value = val;
});

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
});

watch(
  () => props.data,
  () => {
    tableDatabases.value = [...uniqueDatabases.value];
    applyTableFilter();
  },
  { immediate: true }
);
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
</style>
