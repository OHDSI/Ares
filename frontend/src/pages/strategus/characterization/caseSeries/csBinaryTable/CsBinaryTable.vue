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
      filename="case-series-binary"
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
            v-if="hasBinaryPhase('Before')"
            :hidden="groupHidden"
            header="Pre-exposure"
            :colspan="groupColspan"
            :pt="headerPt(phaseIndex.Before)"
          />
          <Column
            v-if="hasBinaryPhase('During')"
            :hidden="groupHidden"
            header="Between exposure &amp; outcome"
            :colspan="groupColspan"
            :pt="headerPt(phaseIndex.During)"
          />
          <Column
            v-if="hasBinaryPhase('After')"
            :hidden="groupHidden"
            header="Post-outcome"
            :colspan="groupColspan"
            :pt="headerPt(phaseIndex.After)"
          />
        </Row>
        <Row>
          <template v-if="hasBinaryPhase('Before')"
            ><Column
              :hidden="!selectedColumns.includes('counts')"
              :pt="{
                ...subPt(phaseIndex.Before),
                headerContent: 'justify-end',
              }"
              header="No."
              sortField="sumValue_Before"
              sortable /><Column
              :hidden="!selectedColumns.includes('pct')"
              :pt="{
                ...subPt(phaseIndex.Before),
                headerContent: 'justify-end',
              }"
              header="%"
              sortField="averageValue_Before"
              sortable
          /></template>
          <template v-if="hasBinaryPhase('During')"
            ><Column
              :hidden="!selectedColumns.includes('counts')"
              :pt="{
                ...subPt(phaseIndex.During),
                headerContent: 'justify-end',
              }"
              header="No."
              sortField="sumValue_During"
              sortable /><Column
              :hidden="!selectedColumns.includes('pct')"
              :pt="{
                ...subPt(phaseIndex.During),
                headerContent: 'justify-end',
              }"
              header="%"
              sortField="averageValue_During"
              sortable
          /></template>
          <template v-if="hasBinaryPhase('After')"
            ><Column
              :hidden="!selectedColumns.includes('counts')"
              :pt="{
                ...subPt(phaseIndex.After),
                headerContent: 'justify-end',
              }"
              header="No."
              sortField="sumValue_After"
              sortable /><Column
              :hidden="!selectedColumns.includes('pct')"
              :pt="{
                ...subPt(phaseIndex.After),
                headerContent: 'justify-end',
              }"
              header="%"
              sortField="averageValue_After"
              sortable
          /></template>
        </Row>
        <Row v-if="showFilters">
          <template v-if="hasBinaryPhase('Before')">
            <Column
              :hidden="!selectedColumns.includes('counts')"
              :pt="{
                ...subPt(phaseIndex.Before),
                headerContent: 'justify-end',
              }"
            >
              <template #header>
                <FilterInput
                  :filterObj="tableFilters.sumValue_Before"
                  input-style="width:100%"
                  type="numeric"
                />
              </template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('pct')"
              :pt="{
                ...subPt(phaseIndex.Before),
                headerContent: 'justify-end',
              }"
            >
              <template #header>
                <FilterInput
                  :filterObj="tableFilters.averageValue_Before"
                  input-style="width:100%"
                  type="numeric"
                />
              </template>
            </Column>
          </template>
          <template v-if="hasBinaryPhase('During')">
            <Column
              :hidden="!selectedColumns.includes('counts')"
              :pt="{
                ...subPt(phaseIndex.During),
                headerContent: 'justify-end',
              }"
            >
              <template #header>
                <FilterInput
                  :filterObj="tableFilters.sumValue_During"
                  input-style="width:100%"
                  type="numeric"
                />
              </template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('pct')"
              :pt="{
                ...subPt(phaseIndex.During),
                headerContent: 'justify-end',
              }"
            >
              <template #header>
                <FilterInput
                  :filterObj="tableFilters.averageValue_During"
                  input-style="width:100%"
                  type="numeric"
                />
              </template>
            </Column>
          </template>
          <template v-if="hasBinaryPhase('After')">
            <Column
              :hidden="!selectedColumns.includes('counts')"
              :pt="{ ...subPt(phaseIndex.After), headerContent: 'justify-end' }"
            >
              <template #header>
                <FilterInput
                  :filterObj="tableFilters.sumValue_After"
                  input-style="width:100%"
                  type="numeric"
                />
              </template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('pct')"
              :pt="{ ...subPt(phaseIndex.After), headerContent: 'justify-end' }"
            >
              <template #header>
                <FilterInput
                  :filterObj="tableFilters.averageValue_After"
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
      <template v-if="hasBinaryPhase('Before')">
        <Column
          :hidden="!selectedColumns.includes('counts')"
          style="text-align: end"
          field="sumValue_Before"
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex.Before)"
        >
          <template #body="{ data }">
            <CensoredCell :text="formatCensored(data.sumValue_Before)" />
          </template>
        </Column>
        <Column
          :hidden="!selectedColumns.includes('pct')"
          style="text-align: end"
          field="averageValue_Before"
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex.Before)"
        >
          <template #body="{ data }">{{
            formatPct(data.averageValue_Before)
          }}</template>
        </Column>
      </template>
      <template v-if="hasBinaryPhase('During')">
        <Column
          :hidden="!selectedColumns.includes('counts')"
          style="text-align: end"
          field="sumValue_During"
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex.During)"
        >
          <template #body="{ data }">
            <CensoredCell :text="formatCensored(data.sumValue_During)" />
          </template>
        </Column>
        <Column
          :hidden="!selectedColumns.includes('pct')"
          style="text-align: end"
          field="averageValue_During"
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex.During)"
        >
          <template #body="{ data }">{{
            formatPct(data.averageValue_During)
          }}</template>
        </Column>
      </template>
      <template v-if="hasBinaryPhase('After')">
        <Column
          :hidden="!selectedColumns.includes('counts')"
          style="text-align: end"
          field="sumValue_After"
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex.After)"
        >
          <template #body="{ data }">
            <CensoredCell :text="formatCensored(data.sumValue_After)" />
          </template>
        </Column>
        <Column
          :hidden="!selectedColumns.includes('pct')"
          style="text-align: end"
          field="averageValue_After"
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex.After)"
        >
          <template #body="{ data }">{{
            formatPct(data.averageValue_After)
          }}</template>
        </Column>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
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
import { formatCensored, formatPct } from "@/shared/lib/formatters";
import { useGroupBanding } from "../../shared/useGroupBanding";
import { UPDATE_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";
import { useTableFilter } from "../../shared/useTableFilter";
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

const STORAGE_KEY = "char:caseSeries:binary";
const CS_DEFAULT_COLUMNS = [
  "covariateName",
  "domain",
  "timeWindow",
  "counts",
  "pct",
];

const csColumnOptions = [
  { label: "Covariate", key: "covariateName" },
  { label: "Domain", key: "domain" },
  { label: "Concept", key: "concept" },
  { label: "Time Window", key: "timeWindow" },
  { label: "Window Days", key: "windowDays" },
  { label: "Sub-type", key: "subType" },
  { label: "Detail", key: "detail" },
  { label: "No.", key: "counts" },
  { label: "%", key: "pct" },
];

const selectedColumns = ref<string[]>(
  store.getters.getSettings.columnSelection?.[STORAGE_KEY]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY]
    : CS_DEFAULT_COLUMNS
);

watch(selectedColumns, (val) => {
  store.dispatch(UPDATE_COLUMN_SELECTION, { [STORAGE_KEY]: val });
});

const groupColspan = computed(() => {
  const n =
    (selectedColumns.value.includes("counts") ? 1 : 0) +
    (selectedColumns.value.includes("pct") ? 1 : 0);
  return n || 1;
});

const groupHidden = computed(
  () =>
    !selectedColumns.value.includes("counts") &&
    !selectedColumns.value.includes("pct")
);

const search = ref("");
const showFilters = ref(false);
const tableRef = ref(null);

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

const tableFilters = ref({
  covariateName: { value: null as any, matchMode: FilterMatchMode.CONTAINS },
  concept: { value: null as any, matchMode: FilterMatchMode.CONTAINS },
  windowDays: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  detail: { value: null as any, matchMode: FilterMatchMode.CONTAINS },
  sumValue_Before: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  averageValue_Before: {
    value: null as any,
    matchMode: FilterMatchMode.EQUALS,
  },
  sumValue_During: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  averageValue_During: {
    value: null as any,
    matchMode: FilterMatchMode.EQUALS,
  },
  sumValue_After: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  averageValue_After: { value: null as any, matchMode: FilterMatchMode.EQUALS },
});

const { keyMap, searchSuggestions } = useDynamicColumnKeys(() => props.phases, {
  getName: (p) => p,
  getId: (p) => p,
  statMap: { count: "sumValue", pct: "averageValue" },
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

function hasBinaryPhase(phase: string) {
  return props.phases.includes(phase);
}

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
