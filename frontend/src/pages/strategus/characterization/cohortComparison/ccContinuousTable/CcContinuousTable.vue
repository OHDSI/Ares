<template>
  <div>
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
      :search-value-map="searchValueMap"
      filename="cohort-comparison-continuous"
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
            v-for="ref in covRef"
            :key="'chdr-' + ref.id"
            :header="columnGroupLabel(ref)"
            :hidden="groupHidden"
            :colspan="groupColspan"
            :pt="dbHeaderPt(ref.id)"
          />
          <Column
            :hidden="covRef.length !== 2 || !selectedColumns.includes('SMD')"
            :pt="{ headerContent: 'justify-end' }"
            :rowspan="showFilters ? 3 : 2"
            sortField="SMD"
            sortable
          >
            <template #header>
              <div class="col-header-with-filter">
                <span>SMD</span>
                <FilterInput
                  v-if="showFilters && tableFilters.SMD"
                  :filterObj="tableFilters.SMD"
                  type="numeric"
                />
              </div>
            </template>
          </Column>
          <Column
            :hidden="covRef.length !== 2 || !selectedColumns.includes('absSMD')"
            :pt="{ headerContent: 'justify-end' }"
            :rowspan="showFilters ? 3 : 2"
            sortField="absSMD"
            sortable
          >
            <template #header>
              <div class="col-header-with-filter">
                <span>|SMD|</span>
                <div class="smd-filter">
                  <Slider
                    v-model="absSmdMin"
                    :min="0"
                    :max="smdMax"
                    :step="0.01"
                    class="smd-slider"
                  />
                  <span class="smd-val">≥ {{ absSmdMin.toFixed(2) }}</span>
                </div>
              </div>
            </template>
          </Column>
        </Row>
        <Row>
          <template v-for="ref in covRef" :key="'csub-' + ref.id">
            <Column
              :hidden="!selectedColumns.includes('statCount')"
              :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
              header="Count"
              :sortField="'countValue_' + ref.id"
              sortable
            />
            <Column
              :hidden="!selectedColumns.includes('mean')"
              :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
              header="Mean"
              :sortField="'averageValue_' + ref.id"
              sortable
            />
            <Column
              :hidden="!selectedColumns.includes('stdev')"
              :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
              header="StDev"
              :sortField="'standardDeviation_' + ref.id"
              sortable
            />
            <Column
              :hidden="!selectedColumns.includes('median')"
              :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
              header="Median"
              :sortField="'medianValue_' + ref.id"
              sortable
            />
            <Column
              :hidden="!selectedColumns.includes('min')"
              :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
              header="Min"
              :sortField="'minValue_' + ref.id"
              sortable
            />
            <Column
              :hidden="!selectedColumns.includes('max')"
              :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
              header="Max"
              :sortField="'maxValue_' + ref.id"
              sortable
            />
          </template>
        </Row>
        <Row v-if="showFilters">
          <template v-for="ref in covRef" :key="'cflt-' + ref.id">
            <Column
              :hidden="!selectedColumns.includes('statCount')"
              :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
            >
              <template #header>
                <FilterInput
                  v-if="tableFilters['countValue_' + ref.id]"
                  :filterObj="tableFilters['countValue_' + ref.id]"
                  input-style="width:100%"
                  type="numeric"
                />
              </template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('mean')"
              :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
            >
              <template #header>
                <FilterInput
                  v-if="tableFilters['averageValue_' + ref.id]"
                  :filterObj="tableFilters['averageValue_' + ref.id]"
                  input-style="width:100%"
                  type="numeric"
                />
              </template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('stdev')"
              :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
            >
              <template #header>
                <FilterInput
                  v-if="tableFilters['standardDeviation_' + ref.id]"
                  :filterObj="tableFilters['standardDeviation_' + ref.id]"
                  input-style="width:100%"
                  type="numeric"
                />
              </template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('median')"
              :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
            >
              <template #header>
                <FilterInput
                  v-if="tableFilters['medianValue_' + ref.id]"
                  :filterObj="tableFilters['medianValue_' + ref.id]"
                  input-style="width:100%"
                  type="numeric"
                />
              </template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('min')"
              :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
            >
              <template #header>
                <FilterInput
                  v-if="tableFilters['minValue_' + ref.id]"
                  :filterObj="tableFilters['minValue_' + ref.id]"
                  input-style="width:100%"
                  type="numeric"
                />
              </template>
            </Column>
            <Column
              :hidden="!selectedColumns.includes('max')"
              :pt="{ ...dbSubPt(ref.id), headerContent: 'justify-end' }"
            >
              <template #header>
                <FilterInput
                  v-if="tableFilters['maxValue_' + ref.id]"
                  :filterObj="tableFilters['maxValue_' + ref.id]"
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
        style="text-align: start"
        field="covariateName"
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
        style="text-align: start"
        field="covariateId"
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
      <template v-for="ref in covRef" :key="'ccol-' + ref.id">
        <Column
          :hidden="!selectedColumns.includes('statCount')"
          style="text-align: end"
          :field="'countValue_' + ref.id"
          sortable
          :showFilterMenu="false"
          :pt="dbBodyPt(ref.id)"
        >
          <template #body="{ data }">
            <CensoredCell :text="formatCount(data['countValue_' + ref.id])" />
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
          :hidden="!selectedColumns.includes('mean')"
          style="text-align: end"
          :field="'averageValue_' + ref.id"
          sortable
          :showFilterMenu="false"
          :pt="dbBodyPt(ref.id)"
        >
          <template #body="{ data }">{{
            formatNumCensored(data["averageValue_" + ref.id])
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
          :hidden="!selectedColumns.includes('stdev')"
          style="text-align: end"
          :field="'standardDeviation_' + ref.id"
          sortable
          :showFilterMenu="false"
          :pt="dbBodyPt(ref.id)"
        >
          <template #body="{ data }">{{
            formatNumCensored(data["standardDeviation_" + ref.id])
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
          :hidden="!selectedColumns.includes('median')"
          style="text-align: end"
          :field="'medianValue_' + ref.id"
          sortable
          :showFilterMenu="false"
          :pt="dbBodyPt(ref.id)"
        >
          <template #body="{ data }">{{
            formatNumCensored(data["medianValue_" + ref.id])
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
          :hidden="!selectedColumns.includes('min')"
          style="text-align: end"
          :field="'minValue_' + ref.id"
          sortable
          :showFilterMenu="false"
          :pt="dbBodyPt(ref.id)"
        >
          <template #body="{ data }">{{
            formatNumCensored(data["minValue_" + ref.id])
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
          :hidden="!selectedColumns.includes('max')"
          style="text-align: end"
          :field="'maxValue_' + ref.id"
          sortable
          :showFilterMenu="false"
          :pt="dbBodyPt(ref.id)"
        >
          <template #body="{ data }">{{
            formatNumCensored(data["maxValue_" + ref.id])
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
      </template>
      <Column
        :hidden="covRef.length !== 2 || !selectedColumns.includes('SMD')"
        style="text-align: end"
        field="SMD"
        sortable
        :showFilterMenu="false"
      >
        <template #body="{ data }">{{ formatSmd(data.SMD) }}</template>
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
        :hidden="covRef.length !== 2 || !selectedColumns.includes('absSMD')"
        style="text-align: end"
        field="absSMD"
        sortable
        :showFilterMenu="false"
      >
        <template #body="{ data }">{{ formatSmd(data.absSMD) }}</template>
        <template #filter="{}">
          <div class="smd-filter">
            <Slider
              v-model="absSmdMin"
              :min="0"
              :max="smdMax"
              :step="0.01"
              class="smd-slider"
            />
            <span class="smd-val">≥ {{ absSmdMin.toFixed(2) }}</span>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useStore } from "vuex";
import { FilterMatchMode } from "primevue/api";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import Dropdown from "primevue/dropdown";
import Slider from "primevue/slider";
import InputText from "primevue/inputtext";
import TableToolbar from "@/widgets/tableToolbar";
import FilterInput from "../../shared/filterInput";
import CensoredCell from "../../shared/censoredCell";
import { useGroupBanding } from "../../shared/useGroupBanding";
import {
  formatCount,
  formatSmd,
  formatNumCensored,
} from "@/shared/lib/formatters";
import { UPDATE_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";
import { useTableFilter } from "../../shared/useTableFilter";
import { useTableUrlState } from "@/shared/lib/composables/useTableUrlState";
import {
  useDynamicColumnKeys,
  COVARIATE_FILTER_KEYS,
} from "../../shared/useDynamicColumnKeys";

interface CovRefItem {
  id: string;
  cohortId: number;
  minPriorObservation: number;
  n: number;
}

const props = defineProps<{
  data: any[];
  covRef: CovRefItem[];
  targetCohortId: number;
  isFullscreen: boolean;
  smdMax?: number;
}>();

const emit = defineEmits<{
  (e: "update:fullscreen", val: boolean): void;
}>();

const store = useStore();

const STORAGE_KEY = "char:cohortComparison:continuous";
const urlState = useTableUrlState(STORAGE_KEY);

const columnOptions = [
  { label: "Covariate", key: "covariateName" },
  { label: "Domain", key: "domain" },
  { label: "Concept", key: "concept" },
  { label: "Time Window", key: "timeWindow" },
  { label: "Window Days", key: "windowDays" },
  { label: "Sub-type", key: "subType" },
  { label: "Detail", key: "detail" },
  { label: "ID", key: "covariateId" },
  { label: "Count", key: "statCount" },
  { label: "Mean", key: "mean" },
  { label: "StDev", key: "stdev" },
  { label: "Median", key: "median" },
  { label: "Min", key: "min" },
  { label: "Max", key: "max" },
  { label: "SMD", key: "SMD" },
  { label: "|SMD|", key: "absSMD" },
];

const CC_DEFAULT = [
  "covariateName",
  "statCount",
  "mean",
  "stdev",
  "median",
  "min",
  "max",
  "SMD",
  "absSMD",
];

const _urlCols = urlState.readState().cols;
const selectedColumns = ref<string[]>(
  _urlCols?.length
    ? _urlCols
    : store.getters.getSettings.columnSelection?.[STORAGE_KEY]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY]
    : CC_DEFAULT
);

let _tableReady = false;

watch(selectedColumns, (val) => {
  if (!_tableReady) return;
  urlState.writeState({ cols: val });
  store.dispatch(UPDATE_COLUMN_SELECTION, { [STORAGE_KEY]: val });
});

const localFullscreen = computed({
  get: () => props.isFullscreen,
  set: (val) => emit("update:fullscreen", val),
});

const tableRef = ref(null);
const search = ref("");
const showFilters = ref(false);

const tableFilters = ref<Record<string, any>>({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  concept: { value: null, matchMode: FilterMatchMode.CONTAINS },
  windowDays: { value: null, matchMode: FilterMatchMode.CONTAINS },
  detail: { value: null, matchMode: FilterMatchMode.CONTAINS },
  covariateId: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const dropdownFilters = ref<{
  domain: string | null;
  subType: string | null;
  timeWindow: string | null;
}>({ domain: null, subType: null, timeWindow: null });

const absSmdMin = ref(0);
const smdMax = computed(() => props.smdMax ?? 2);

watch(search, (val) => {
  if (_tableReady) urlState.writeState({ search: val });
});
watch(showFilters, (val) => {
  if (_tableReady) urlState.writeState({ showFilters: val });
});

const timeWindowOptions = ["temporal", "any_time_prior", "window"];

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

const CONT_STAT_FIELDS = [
  "countValue",
  "averageValue",
  "standardDeviation",
  "medianValue",
  "minValue",
  "maxValue",
];

const CONT_STAT_MAP: Record<string, string> = {
  count: "countValue",
  mean: "averageValue",
  stdev: "standardDeviation",
  median: "medianValue",
  min: "minValue",
  max: "maxValue",
};

const { keyMap, searchSuggestions } = useDynamicColumnKeys(() => props.covRef, {
  getName: (r) =>
    r.cohortId === props.targetCohortId ? "target" : "comparator",
  getId: (r) => r.id,
  getN: (r) => r.n,
  statMap: CONT_STAT_MAP,
  staticKeys: COVARIATE_FILTER_KEYS,
  conditionalKeys: () => (props.covRef.length === 2 ? ["SMD", "absSMD"] : []),
});

const searchValueMap = computed(() => ({
  domain: domainOptions.value,
  subType: subTypeOptions.value,
  timeWindow: timeWindowOptions,
}));

const {
  filteredRows: _rows,
  applyNow,
  searchError,
  hasActiveFilters: _hasBaseFilters,
  clearFilters: _clearBaseFilters,
} = useTableFilter(
  () => props.data,
  dropdownFilters,
  tableFilters,
  search,
  keyMap,
  tableRef
);

const hasActiveFilters = computed(
  () => _hasBaseFilters.value || absSmdMin.value > 0
);
function clearFilters() {
  _clearBaseFilters();
  absSmdMin.value = 0;
}

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
  if (absSmdMin.value > 0) merged["_smd"] = String(absSmdMin.value);
  urlState.writeState({ filters: Object.keys(merged).length ? merged : null });
}

watch(tableFilters, writeFiltersToUrl, { deep: true });
watch(dropdownFilters, writeFiltersToUrl, { deep: true });
watch(absSmdMin, writeFiltersToUrl);

onMounted(async () => {
  const state = urlState.readState();
  if (state.search) search.value = state.search;
  if (state.showFilters) showFilters.value = true;
  if (state.filters) {
    for (const [k, v] of Object.entries(state.filters)) {
      if (k === "_smd") {
        absSmdMin.value = parseFloat(v as string);
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
      } else if (k in dropdownFilters.value)
        dropdownFilters.value[k] = v as string;
    }
    applyNow();
  }
  await nextTick();
  _tableReady = true;
});

watch(
  () => props.covRef,
  (newRefs) => {
    const filters: Record<string, any> = {
      covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
      concept: { value: null, matchMode: FilterMatchMode.CONTAINS },
      windowDays: { value: null, matchMode: FilterMatchMode.CONTAINS },
      detail: { value: null, matchMode: FilterMatchMode.CONTAINS },
      covariateId: { value: null, matchMode: FilterMatchMode.CONTAINS },
    };
    for (const ref of newRefs) {
      for (const f of CONT_STAT_FIELDS) {
        filters[`${f}_${ref.id}`] = {
          value: null,
          matchMode: FilterMatchMode.CONTAINS,
        };
      }
    }
    if (newRefs.length === 2) {
      filters.SMD = { value: null, matchMode: FilterMatchMode.CONTAINS };
      filters.absSMD = { value: null, matchMode: FilterMatchMode.CONTAINS };
    }
    tableFilters.value = filters;
    dropdownFilters.value = { domain: null, subType: null, timeWindow: null };
    absSmdMin.value = 0;
    applyNow();
  },
  { immediate: true }
);

const filteredRows = computed(() => {
  if (absSmdMin.value <= 0) return _rows.value;
  return _rows.value.filter((r: any) => (r.absSMD ?? 0) >= absSmdMin.value);
});

const { headerPt, subPt, bodyPt } = useGroupBanding();

const dbIndexMap = computed(() => {
  const map: Record<string, number> = {};
  props.covRef.forEach((ref, i) => {
    map[ref.id] = i;
  });
  return map;
});

const dbHeaderPt = (id: string) => headerPt(dbIndexMap.value[id] ?? 0);
const dbSubPt = (id: string) => subPt(dbIndexMap.value[id] ?? 0);
const dbBodyPt = (id: string) => bodyPt(dbIndexMap.value[id] ?? 0);

const CONT_STAT_KEYS = ["statCount", "mean", "stdev", "median", "min", "max"];

const groupColspan = computed(
  () =>
    CONT_STAT_KEYS.filter((k) => selectedColumns.value.includes(k)).length || 1
);

const groupHidden = computed(
  () => !CONT_STAT_KEYS.some((k) => selectedColumns.value.includes(k))
);

function columnGroupLabel(ref: CovRefItem) {
  const role = ref.cohortId === props.targetCohortId ? "Target" : "Comparator";
  return `${role} (${ref.minPriorObservation}d prior, N=${ref.n})`;
}
</script>

<style scoped>
@import "../../shared/styles.css";

.smd-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
}

.smd-slider {
  flex: 1;
  min-width: 70px;
}

.smd-val {
  font-size: 0.75rem;
  white-space: nowrap;
  color: var(--color-text-muted);
}

.col-header-with-filter {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.filter-dropdown {
  width: 100%;
}

:deep(.p-sortable-column-icon) {
  opacity: 0.15;
  transition: opacity 0.15s;
}

:deep(.p-sortable-column:hover .p-sortable-column-icon),
:deep(.p-highlight .p-sortable-column-icon) {
  opacity: 1;
}

:deep(.filter-dropdown .p-dropdown-label) {
  padding: 0.2rem 0.4rem;
  font-size: 0.75rem;
}

:deep(.filter-dropdown .p-dropdown-trigger) {
  width: 1.5rem;
}
</style>
