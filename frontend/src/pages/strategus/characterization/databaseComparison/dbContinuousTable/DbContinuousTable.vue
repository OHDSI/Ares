<template>
  <div>
    <p class="table-note" v-if="covRef.length">
      Continuous feature distributions ({{ covRef[0]?.minPriorObservation }}d
      prior obs.) across databases.
    </p>
    <TableToolbar
      v-model:search="search"
      v-model:columns="selectedColumns"
      :column-options="columnOptions"
      v-model:show-filters="showFilters"
      v-model:fullscreen="localFullscreen"
      :table-ref="tableRef"
      :rows="filteredRows"
      filename="database-comparison-continuous"
    />
    <DataTable
      ref="tableRef"
      :value="filteredRows"
      :paginator="true"
      :rows="25"
      :rowsPerPageOptions="[10, 25, 50, 100]"
      v-model:filters="globalFilter"
      :globalFilterFields="[
        'covariateName',
        'domain',
        'concept',
        'timeWindow',
        'windowDays',
        'subType',
        'detail',
      ]"
      sortMode="multiple"
      removableSort
      :striped-rows="store.getters.getSettings.strippedRows"
      size="small"
      class="result-table"
      :exportFilename="'database_comparison_continuous'"
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
                  placeholder="Search..."
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
            v-for="ref in covRef"
            :key="'chdr-' + ref.id"
            :header="`${ref.databaseName} (N=${ref.n})`"
            :hidden="groupHidden"
            :colspan="groupColspan"
            :pt="dbHeaderPt(ref.id)"
          />
          <Column
            :hidden="covRef.length !== 2 || !selectedColumns.includes('SMD')"
            :pt="{ headerContent: 'justify-end' }"
            :rowspan="3"
            sortField="SMD"
            sortable
          >
            <template #header>
              <div class="col-header-with-filter">
                <span>SMD</span>
                <FilterInput
                  v-if="tableFilters.SMD"
                  :filterObj="tableFilters.SMD"
                />
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
                />
              </template>
            </Column>
          </template>
        </Row>
      </ColumnGroup>

      <Column
        :hidden="!selectedColumns.includes('covariateName')"
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
        field="covariateId"
        sortable
        :showFilterMenu="false"
      />
      <template v-for="ref in covRef" :key="'ccol-' + ref.id">
        <Column
          :hidden="!selectedColumns.includes('statCount')"
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
        field="SMD"
        sortable
        :showFilterMenu="false"
      >
        <template #body="{ data }">{{
          data.SMD != null ? data.SMD.toFixed(4) : ""
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";
import TableToolbar from "@/widgets/tableToolbar";
import FilterInput from "../../shared/filterInput";
import CensoredCell from "../../shared/censoredCell";
import { useGroupBanding } from "../../shared/useGroupBanding";
import { formatCount, formatNumCensored } from "@/shared/lib/formatters";
import { useStore } from "vuex";
import { UPDATE_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";

interface CovRefEntry {
  id: string;
  databaseName: string;
  n: number;
  minPriorObservation?: number;
}

const props = defineProps<{
  data: any[];
  covRef: CovRefEntry[];
  isFullscreen: boolean;
}>();

const emit = defineEmits<{
  (e: "update:fullscreen", val: boolean): void;
}>();

const store = useStore();

const STORAGE_KEY = "char:databaseComparison:continuous";

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
];

const DEFAULT_COLUMNS = [
  "covariateName",
  "statCount",
  "mean",
  "stdev",
  "median",
  "min",
  "max",
  "SMD",
];

const selectedColumns = ref<string[]>(
  store.getters.getSettings.columnSelection?.[STORAGE_KEY]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY]
    : DEFAULT_COLUMNS
);

watch(selectedColumns, (val) => {
  store.dispatch(UPDATE_COLUMN_SELECTION, { [STORAGE_KEY]: val });
});

const localFullscreen = computed({
  get: () => props.isFullscreen,
  set: (val) => emit("update:fullscreen", val),
});

const search = ref("");
const showFilters = ref(false);
const tableRef = ref(null);

const globalFilter = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

watch(search, (val) => {
  globalFilter.value.global.value = val;
});

const tableFilters = ref<Record<string, { value: any; matchMode: string }>>({
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

const contStatsKeys = [
  "countValue",
  "averageValue",
  "standardDeviation",
  "medianValue",
  "minValue",
  "maxValue",
];

watch(
  () => props.data,
  () => {
    dropdownFilters.value = { domain: null, subType: null, timeWindow: null };
    const base = {
      covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
      concept: { value: null, matchMode: FilterMatchMode.CONTAINS },
      windowDays: { value: null, matchMode: FilterMatchMode.CONTAINS },
      detail: { value: null, matchMode: FilterMatchMode.CONTAINS },
      covariateId: { value: null, matchMode: FilterMatchMode.CONTAINS },
    } as Record<string, { value: any; matchMode: string }>;
    for (const ref of props.covRef) {
      for (const f of contStatsKeys) {
        base[`${f}_${ref.id}`] = {
          value: null,
          matchMode: FilterMatchMode.CONTAINS,
        };
      }
    }
    if (props.covRef.length === 2) {
      base.SMD = { value: null, matchMode: FilterMatchMode.CONTAINS };
    }
    tableFilters.value = base;
  },
  { immediate: true }
);

const filteredRows = computed(() => {
  let rows = props.data;
  if (dropdownFilters.value.domain)
    rows = rows.filter((r: any) => r.domain === dropdownFilters.value.domain);
  if (dropdownFilters.value.subType)
    rows = rows.filter((r: any) => r.subType === dropdownFilters.value.subType);
  if (dropdownFilters.value.timeWindow)
    rows = rows.filter(
      (r: any) => r.timeWindow === dropdownFilters.value.timeWindow
    );
  for (const [key, filter] of Object.entries(tableFilters.value)) {
    if (filter.value != null && filter.value !== "") {
      const val = String(filter.value).toLowerCase();
      rows = rows.filter((r) =>
        String(r[key] ?? "")
          .toLowerCase()
          .includes(val)
      );
    }
  }
  return rows;
});

const contColKeys = ["statCount", "mean", "stdev", "median", "min", "max"];

const groupColspan = computed(
  () => contColKeys.filter((k) => selectedColumns.value.includes(k)).length || 1
);

const groupHidden = computed(
  () => !contColKeys.some((k) => selectedColumns.value.includes(k))
);

const dbIndexMap = computed(() => {
  const map: Record<string, number> = {};
  props.covRef.forEach((ref, i) => {
    map[ref.id] = i;
  });
  return map;
});

const { headerPt, subPt, bodyPt } = useGroupBanding();
const dbHeaderPt = (id: string) => headerPt(dbIndexMap.value[id] ?? 0);
const dbSubPt = (id: string) => subPt(dbIndexMap.value[id] ?? 0);
const dbBodyPt = (id: string) => bodyPt(dbIndexMap.value[id] ?? 0);
</script>

<style scoped>
@import "../../shared/styles.css";

.col-header-with-filter {
  display: flex;
  flex-direction: column;
  gap: 4px;
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

.filter-dropdown {
  width: 100%;
  font-size: 0.75rem;
}
:deep(.filter-dropdown .p-dropdown-label) {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}
</style>
