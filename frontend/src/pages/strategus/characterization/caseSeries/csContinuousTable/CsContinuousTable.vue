<template>
  <div>
    <TableToolbar
      v-model:search="search"
      v-model:columns="selectedColumns"
      :column-options="csColumnOptions"
      v-model:show-filters="showFilters"
      v-model:fullscreen="localFullscreen"
      :table-ref="tableRef"
      :rows="filteredRows"
      :search-error="searchError"
      :search-suggestions="searchSuggestions"
      :search-value-map="searchValueMap"
      filename="case-series-continuous"
      :has-active-filters="hasActiveFilters"
      @clear-filters="clearFilters"
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
      <ColumnGroup type="header">
        <Row>
          <Column
            :hidden="!selectedColumns.includes('covariateName')"
            :pt="{ headerContent: 'justify-start' }"
            :rowspan="showFilters ? 3 : 2"
            sortField="covariateName"
            sortable
          >
            <template #header>
              <div class="col-header-with-filter">
                <span>Covariate</span>
                <FilterInput
                  v-if="showFilters"
                  :filterObj="tableFilters.covariateName"
                  placeholder="Search..."
                />
              </div>
            </template>
          </Column>
          <Column
            :hidden="!selectedColumns.includes('domain')"
            :pt="{ headerContent: 'justify-start' }"
            :rowspan="showFilters ? 3 : 2"
            sortField="domain"
            sortable
          >
            <template #header>
              <div class="col-header-with-filter">
                <span>Domain</span>
                <Dropdown
                  v-if="showFilters"
                  v-model="dropdownFilters.domain"
                  :options="domainOptions"
                  placeholder="All"
                  showClear
                  class="filter-dropdown"
                  @click.stop
                />
              </div>
            </template>
          </Column>
          <Column
            :hidden="!selectedColumns.includes('concept')"
            :pt="{ headerContent: 'justify-start' }"
            :rowspan="showFilters ? 3 : 2"
            sortField="concept"
            sortable
          >
            <template #header>
              <div class="col-header-with-filter">
                <span>Concept</span>
                <FilterInput
                  v-if="showFilters"
                  :filterObj="tableFilters.concept"
                  placeholder="Search..."
                />
              </div>
            </template>
          </Column>
          <Column
            :hidden="!selectedColumns.includes('timeWindow')"
            :pt="{ headerContent: 'justify-start' }"
            :rowspan="showFilters ? 3 : 2"
            sortField="timeWindow"
            sortable
          >
            <template #header>
              <div class="col-header-with-filter">
                <span>Time Window</span>
                <Dropdown
                  v-if="showFilters"
                  v-model="dropdownFilters.timeWindow"
                  :options="timeWindowOptions"
                  placeholder="All"
                  showClear
                  class="filter-dropdown"
                  @click.stop
                />
              </div>
            </template>
          </Column>
          <Column
            :hidden="!selectedColumns.includes('windowDays')"
            :pt="{ headerContent: 'justify-start' }"
            :rowspan="showFilters ? 3 : 2"
            sortField="windowDays"
            sortable
          >
            <template #header>
              <div class="col-header-with-filter">
                <span>Window Days</span>
                <FilterInput
                  v-if="showFilters"
                  :filterObj="tableFilters.windowDays"
                  placeholder="e.g. -365 to -1"
                  type="numeric"
                />
              </div>
            </template>
          </Column>
          <Column
            :hidden="!selectedColumns.includes('subType')"
            :pt="{ headerContent: 'justify-start' }"
            :rowspan="showFilters ? 3 : 2"
            sortField="subType"
            sortable
          >
            <template #header>
              <div class="col-header-with-filter">
                <span>Sub-type</span>
                <Dropdown
                  v-if="showFilters"
                  v-model="dropdownFilters.subType"
                  :options="subTypeOptions"
                  placeholder="All"
                  showClear
                  class="filter-dropdown"
                  @click.stop
                />
              </div>
            </template>
          </Column>
          <Column
            :hidden="!selectedColumns.includes('detail')"
            :pt="{ headerContent: 'justify-start' }"
            :rowspan="showFilters ? 3 : 2"
            sortField="detail"
            sortable
          >
            <template #header>
              <div class="col-header-with-filter">
                <span>Detail</span>
                <FilterInput
                  v-if="showFilters"
                  :filterObj="tableFilters.detail"
                  placeholder="Search..."
                />
              </div>
            </template>
          </Column>
          <Column
            :hidden="!selectedColumns.includes('covariateId')"
            :pt="{ headerContent: 'justify-start' }"
            :rowspan="showFilters ? 3 : 2"
            sortField="covariateId"
            sortable
          >
            <template #header>
              <div class="col-header-with-filter">
                <span>ID</span>
                <FilterInput
                  v-if="showFilters"
                  :filterObj="tableFilters.covariateId"
                  placeholder="Search..."
                />
              </div>
            </template>
          </Column>
          <Column
            v-if="hasContinuousPhase('Before')"
            :hidden="groupHidden"
            header="Pre-exposure"
            :colspan="groupColspan"
            :pt="headerPt(phaseIndex.Before)"
          />
          <Column
            v-if="hasContinuousPhase('During')"
            :hidden="groupHidden"
            header="Between exposure &amp; outcome"
            :colspan="groupColspan"
            :pt="headerPt(phaseIndex.During)"
          />
          <Column
            v-if="hasContinuousPhase('After')"
            :hidden="groupHidden"
            header="Post-outcome"
            :colspan="groupColspan"
            :pt="headerPt(phaseIndex.After)"
          />
        </Row>
        <Row>
          <template v-for="phase in presentPhases" :key="'ch-' + phase">
            <Column
              :hidden="!selectedColumns.includes('statCount')"
              :pt="{
                ...subPt(phaseIndex[phase]),
                headerContent: 'justify-end',
              }"
              header="Count"
              :sortField="'countValue_' + phase"
              sortable
            /><Column
              :hidden="!selectedColumns.includes('min')"
              :pt="{
                ...subPt(phaseIndex[phase]),
                headerContent: 'justify-end',
              }"
              header="Min"
              :sortField="'minValue_' + phase"
              sortable
            /><Column
              :hidden="!selectedColumns.includes('max')"
              :pt="{
                ...subPt(phaseIndex[phase]),
                headerContent: 'justify-end',
              }"
              header="Max"
              :sortField="'maxValue_' + phase"
              sortable
            />
            <Column
              :hidden="!selectedColumns.includes('mean')"
              :pt="{
                ...subPt(phaseIndex[phase]),
                headerContent: 'justify-end',
              }"
              header="Mean"
              :sortField="'averageValue_' + phase"
              sortable
            /><Column
              :hidden="!selectedColumns.includes('stdev')"
              :pt="{
                ...subPt(phaseIndex[phase]),
                headerContent: 'justify-end',
              }"
              header="StDev"
              :sortField="'standardDeviation_' + phase"
              sortable
            /><Column
              :hidden="!selectedColumns.includes('median')"
              :pt="{
                ...subPt(phaseIndex[phase]),
                headerContent: 'justify-end',
              }"
              header="Median"
              :sortField="'medianValue_' + phase"
              sortable
            />
          </template>
        </Row>
        <Row v-if="showFilters">
          <template v-for="phase in presentPhases" :key="'cf-' + phase">
            <Column
              :hidden="!selectedColumns.includes('statCount')"
              :pt="{
                ...subPt(phaseIndex[phase]),
                headerContent: 'justify-end',
              }"
            >
              <template #header>
                <FilterInput
                  v-if="tableFilters['countValue_' + phase]"
                  :filterObj="tableFilters['countValue_' + phase]"
                  input-style="width:100%"
                  type="numeric"
                />
              </template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('min')"
              :pt="{
                ...subPt(phaseIndex[phase]),
                headerContent: 'justify-end',
              }"
            >
              <template #header>
                <FilterInput
                  v-if="tableFilters['minValue_' + phase]"
                  :filterObj="tableFilters['minValue_' + phase]"
                  input-style="width:100%"
                  type="numeric"
                />
              </template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('max')"
              :pt="{
                ...subPt(phaseIndex[phase]),
                headerContent: 'justify-end',
              }"
            >
              <template #header>
                <FilterInput
                  v-if="tableFilters['maxValue_' + phase]"
                  :filterObj="tableFilters['maxValue_' + phase]"
                  input-style="width:100%"
                  type="numeric"
                />
              </template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('mean')"
              :pt="{
                ...subPt(phaseIndex[phase]),
                headerContent: 'justify-end',
              }"
            >
              <template #header>
                <FilterInput
                  v-if="tableFilters['averageValue_' + phase]"
                  :filterObj="tableFilters['averageValue_' + phase]"
                  input-style="width:100%"
                  type="numeric"
                />
              </template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('stdev')"
              :pt="{
                ...subPt(phaseIndex[phase]),
                headerContent: 'justify-end',
              }"
            >
              <template #header>
                <FilterInput
                  v-if="tableFilters['standardDeviation_' + phase]"
                  :filterObj="tableFilters['standardDeviation_' + phase]"
                  input-style="width:100%"
                  type="numeric"
                />
              </template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('median')"
              :pt="{
                ...subPt(phaseIndex[phase]),
                headerContent: 'justify-end',
              }"
            >
              <template #header>
                <FilterInput
                  v-if="tableFilters['medianValue_' + phase]"
                  :filterObj="tableFilters['medianValue_' + phase]"
                  input-style="width:100%"
                  type="numeric"
                />
              </template>
            </Column>
          </template>
        </Row>
      </ColumnGroup>

      <Column
        :hidden="!selectedColumns.includes('covariateName')"
        field="covariateName"
        style="text-align: start"
      />
      <Column
        :hidden="!selectedColumns.includes('domain')"
        field="domain"
        style="text-align: start"
      />
      <Column
        :hidden="!selectedColumns.includes('concept')"
        field="concept"
        style="text-align: start"
      />
      <Column
        :hidden="!selectedColumns.includes('timeWindow')"
        field="timeWindow"
        style="text-align: start"
      />
      <Column
        :hidden="!selectedColumns.includes('windowDays')"
        field="windowDays"
        style="text-align: start"
      />
      <Column
        :hidden="!selectedColumns.includes('subType')"
        field="subType"
        style="text-align: start"
      />
      <Column
        :hidden="!selectedColumns.includes('detail')"
        field="detail"
        style="text-align: start"
      />
      <Column
        :hidden="!selectedColumns.includes('covariateId')"
        field="covariateId"
        style="text-align: start"
      />
      <template v-for="phase in presentPhases" :key="'cc-' + phase">
        <Column
          :hidden="!selectedColumns.includes('statCount')"
          style="text-align: end"
          :field="'countValue_' + phase"
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex[phase])"
        >
          <template #body="{ data }">
            <CensoredCell :text="formatCensored(data['countValue_' + phase])" />
          </template>
        </Column>
        <Column
          :hidden="!selectedColumns.includes('min')"
          style="text-align: end"
          :field="'minValue_' + phase"
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex[phase])"
        >
          <template #body="{ data }">{{
            formatNum(data["minValue_" + phase])
          }}</template>
        </Column>
        <Column
          :hidden="!selectedColumns.includes('max')"
          style="text-align: end"
          :field="'maxValue_' + phase"
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex[phase])"
        >
          <template #body="{ data }">{{
            formatNum(data["maxValue_" + phase])
          }}</template>
        </Column>
        <Column
          :hidden="!selectedColumns.includes('mean')"
          style="text-align: end"
          :field="'averageValue_' + phase"
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex[phase])"
        >
          <template #body="{ data }">{{
            formatNum(data["averageValue_" + phase])
          }}</template>
        </Column>
        <Column
          :hidden="!selectedColumns.includes('stdev')"
          style="text-align: end"
          :field="'standardDeviation_' + phase"
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex[phase])"
        >
          <template #body="{ data }">{{
            formatNum(data["standardDeviation_" + phase])
          }}</template>
        </Column>
        <Column
          :hidden="!selectedColumns.includes('median')"
          style="text-align: end"
          :field="'medianValue_' + phase"
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex[phase])"
        >
          <template #body="{ data }">{{
            formatNum(data["medianValue_" + phase])
          }}</template>
        </Column>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useStore } from "vuex";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import Dropdown from "primevue/dropdown";
import { FilterMatchMode } from "primevue/api";
import TableToolbar from "@/widgets/tableToolbar";
import CensoredCell from "../../shared/censoredCell";
import FilterInput from "../../shared/filterInput";
import { formatCensored, formatNum } from "@/shared/lib/formatters";
import { useGroupBanding } from "../../shared/useGroupBanding";
import { UPDATE_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";
import { useTableFilter } from "../../shared/useTableFilter";
import { useTableUrlState } from "@/shared/lib/composables/useTableUrlState";
import {
  useDynamicColumnKeys,
  COVARIATE_FILTER_KEYS,
} from "../../shared/useDynamicColumnKeys";

const props = defineProps<{
  data: any[];
  phases: string[];
  isFullscreen: boolean;
}>();

const emit = defineEmits<{
  (e: "update:fullscreen", val: boolean): void;
}>();

const store = useStore();

const STORAGE_KEY = "char:caseSeries:continuous";
const urlState = useTableUrlState(STORAGE_KEY);
const CS_DEFAULT_COLUMNS = [
  "covariateName",
  "statCount",
  "min",
  "max",
  "mean",
  "stdev",
  "median",
];

const csColumnOptions = [
  { label: "Covariate", key: "covariateName" },
  { label: "Domain", key: "domain" },
  { label: "Concept", key: "concept" },
  { label: "Time Window", key: "timeWindow" },
  { label: "Window Days", key: "windowDays" },
  { label: "Sub-type", key: "subType" },
  { label: "Detail", key: "detail" },
  { label: "ID", key: "covariateId" },
  { label: "Count", key: "statCount" },
  { label: "Min", key: "min" },
  { label: "Max", key: "max" },
  { label: "Mean", key: "mean" },
  { label: "StDev", key: "stdev" },
  { label: "Median", key: "median" },
];

const _urlCols = urlState.readState().cols;
const selectedColumns = ref<string[]>(
  _urlCols?.length
    ? _urlCols
    : store.getters.getSettings.columnSelection?.[STORAGE_KEY]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY]
    : CS_DEFAULT_COLUMNS
);

let _tableReady = false;

watch(selectedColumns, (val) => {
  if (!_tableReady) return;
  urlState.writeState({ cols: val });
  store.dispatch(UPDATE_COLUMN_SELECTION, { [STORAGE_KEY]: val });
});

const contStatsKeys = ["statCount", "min", "max", "mean", "stdev", "median"];

const groupColspan = computed(
  () =>
    contStatsKeys.filter((k) => selectedColumns.value.includes(k)).length || 1
);

const groupHidden = computed(
  () => !contStatsKeys.some((k) => selectedColumns.value.includes(k))
);

const search = ref("");
const showFilters = ref(false);
const tableRef = ref(null);

watch(search, (val) => {
  if (_tableReady) urlState.writeState({ search: val });
});
watch(showFilters, (val) => {
  if (_tableReady) urlState.writeState({ showFilters: val });
});

const timeWindowOptions = ["temporal", "any_time_prior", "window"];

const dropdownFilters = ref<{
  domain: string | null;
  subType: string | null;
  timeWindow: string | null;
}>({ domain: null, subType: null, timeWindow: null });

const domainOptions = computed(
  () =>
    [
      ...new Set(props.data.map((r: any) => r.domain).filter(Boolean)),
    ].sort() as string[]
);

const subTypeOptions = computed(
  () =>
    [
      ...new Set(props.data.map((r: any) => r.subType).filter(Boolean)),
    ].sort() as string[]
);

const tableFilters = ref<Record<string, { value: any; matchMode: string }>>({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  concept: { value: null, matchMode: FilterMatchMode.CONTAINS },
  windowDays: { value: null, matchMode: FilterMatchMode.EQUALS },
  detail: { value: null, matchMode: FilterMatchMode.CONTAINS },
  covariateId: { value: null, matchMode: FilterMatchMode.CONTAINS },
  countValue_Before: { value: null, matchMode: FilterMatchMode.EQUALS },
  minValue_Before: { value: null, matchMode: FilterMatchMode.EQUALS },
  maxValue_Before: { value: null, matchMode: FilterMatchMode.EQUALS },
  averageValue_Before: { value: null, matchMode: FilterMatchMode.EQUALS },
  standardDeviation_Before: { value: null, matchMode: FilterMatchMode.EQUALS },
  medianValue_Before: { value: null, matchMode: FilterMatchMode.EQUALS },
  countValue_During: { value: null, matchMode: FilterMatchMode.EQUALS },
  minValue_During: { value: null, matchMode: FilterMatchMode.EQUALS },
  maxValue_During: { value: null, matchMode: FilterMatchMode.EQUALS },
  averageValue_During: { value: null, matchMode: FilterMatchMode.EQUALS },
  standardDeviation_During: { value: null, matchMode: FilterMatchMode.EQUALS },
  medianValue_During: { value: null, matchMode: FilterMatchMode.EQUALS },
  countValue_After: { value: null, matchMode: FilterMatchMode.EQUALS },
  minValue_After: { value: null, matchMode: FilterMatchMode.EQUALS },
  maxValue_After: { value: null, matchMode: FilterMatchMode.EQUALS },
  averageValue_After: { value: null, matchMode: FilterMatchMode.EQUALS },
  standardDeviation_After: { value: null, matchMode: FilterMatchMode.EQUALS },
  medianValue_After: { value: null, matchMode: FilterMatchMode.EQUALS },
});

const { keyMap, searchSuggestions } = useDynamicColumnKeys(() => props.phases, {
  getName: (p) => p,
  getId: (p) => p,
  statMap: {
    count: "countValue",
    min: "minValue",
    max: "maxValue",
    mean: "averageValue",
    stdev: "standardDeviation",
    median: "medianValue",
  },
  staticKeys: COVARIATE_FILTER_KEYS,
});

const searchValueMap = computed(() => ({
  domain: domainOptions.value,
  subType: subTypeOptions.value,
  timeWindow: timeWindowOptions,
}));

const { filteredRows, applyNow, searchError, hasActiveFilters, clearFilters } =
  useTableFilter(
    () => props.data,
    dropdownFilters,
    tableFilters,
    search,
    keyMap,
    tableRef
  );

watch(
  () => props.data,
  () => applyNow(),
  { immediate: true }
);

function writeFiltersToUrl() {
  if (!_tableReady) return;
  const merged: Record<string, any> = {};
  for (const [k, f] of Object.entries(tableFilters.value)) {
    if (f.value != null && f.value !== "")
      merged[k] = { v: f.value, m: f.matchMode };
  }
  for (const [k, v] of Object.entries(dropdownFilters.value)) {
    if (v != null) merged[k] = v;
  }
  urlState.writeState({ filters: Object.keys(merged).length ? merged : null });
}
watch(tableFilters, writeFiltersToUrl, { deep: true });
watch(dropdownFilters, writeFiltersToUrl, { deep: true });

onMounted(async () => {
  const state = urlState.readState();
  if (state.search) search.value = state.search;
  if (state.showFilters) showFilters.value = true;
  if (state.filters) {
    for (const [k, v] of Object.entries(state.filters)) {
      if (k in tableFilters.value) {
        const e = v as any;
        if (e && typeof e === "object" && "v" in e) {
          tableFilters.value[k].value = e.v;
          tableFilters.value[k].matchMode = e.m;
        } else {
          tableFilters.value[k].value = e;
        }
      } else if (k in dropdownFilters.value)
        dropdownFilters.value[k] = v as string;
    }
    applyNow();
  }
  await nextTick();
  _tableReady = true;
});

function hasContinuousPhase(phase: string) {
  return props.phases.includes(phase);
}

const presentPhases = computed(() =>
  ["Before", "During", "After"].filter((p) => props.phases.includes(p))
);

const phaseIndex: Record<string, number> = { Before: 0, During: 1, After: 2 };

const { headerPt, subPt, bodyPt } = useGroupBanding();

const localFullscreen = computed({
  get: () => props.isFullscreen,
  set: (val) => emit("update:fullscreen", val),
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

.filter-dropdown {
  width: 100%;
  font-size: 0.75rem;
}
:deep(.filter-dropdown .p-dropdown-label) {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}
</style>
