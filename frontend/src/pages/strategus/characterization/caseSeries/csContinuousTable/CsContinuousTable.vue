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
      filename="case-series-continuous"
    />
    <DataTable
      ref="tableRef"
      :value="filteredRows"
      :paginator="true"
      :rows="25"
      :rowsPerPageOptions="[10, 25, 50, 100]"
      :filterDisplay="showFilters ? 'row' : undefined"
      v-model:filters="continuousTableFilters"
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
    >
      <ColumnGroup type="header">
        <Row>
          <Column
            :hidden="!selectedColumns.includes('covariateName')"
            :pt="{ headerContent: 'justify-start' }"
            header="Covariate"
            :rowspan="showFilters ? 3 : 2"
          />
          <Column
            :hidden="!selectedColumns.includes('domain')"
            :pt="{ headerContent: 'justify-start' }"
            header="Domain"
            :rowspan="showFilters ? 3 : 2"
          />
          <Column
            :hidden="!selectedColumns.includes('concept')"
            :pt="{ headerContent: 'justify-start' }"
            header="Concept"
            :rowspan="showFilters ? 3 : 2"
          />
          <Column
            :hidden="!selectedColumns.includes('timeWindow')"
            :pt="{ headerContent: 'justify-start' }"
            header="Time Window"
            :rowspan="showFilters ? 3 : 2"
          />
          <Column
            :hidden="!selectedColumns.includes('windowDays')"
            :pt="{ headerContent: 'justify-start' }"
            header="Window Days"
            :rowspan="showFilters ? 3 : 2"
          />
          <Column
            :hidden="!selectedColumns.includes('subType')"
            :pt="{ headerContent: 'justify-start' }"
            header="Sub-type"
            :rowspan="showFilters ? 3 : 2"
          />
          <Column
            :hidden="!selectedColumns.includes('detail')"
            :pt="{ headerContent: 'justify-start' }"
            header="Detail"
            :rowspan="showFilters ? 3 : 2"
          />
          <Column
            :hidden="!selectedColumns.includes('covariateId')"
            :pt="{ headerContent: 'justify-start' }"
            header="ID"
            :rowspan="showFilters ? 3 : 2"
          />
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
            /><Column
              :hidden="!selectedColumns.includes('min')"
              :pt="{
                ...subPt(phaseIndex[phase]),
                headerContent: 'justify-end',
              }"
              header="Min"
            /><Column
              :hidden="!selectedColumns.includes('max')"
              :pt="{
                ...subPt(phaseIndex[phase]),
                headerContent: 'justify-end',
              }"
              header="Max"
            />
            <Column
              :hidden="!selectedColumns.includes('mean')"
              :pt="{
                ...subPt(phaseIndex[phase]),
                headerContent: 'justify-end',
              }"
              header="Mean"
            /><Column
              :hidden="!selectedColumns.includes('stdev')"
              :pt="{
                ...subPt(phaseIndex[phase]),
                headerContent: 'justify-end',
              }"
              header="StDev"
            /><Column
              :hidden="!selectedColumns.includes('median')"
              :pt="{
                ...subPt(phaseIndex[phase]),
                headerContent: 'justify-end',
              }"
              header="Median"
            />
          </template>
        </Row>
      </ColumnGroup>

      <Column
        :hidden="!selectedColumns.includes('covariateName')"
        field="covariateName"
        :showFilterMenu="false"
        style="text-align: start"
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
        :showFilterMenu="false"
        style="text-align: start"
      >
        <template #filter>
          <Dropdown
            v-model="continuousDropdownFilters.domain"
            :options="continuousDomainOptions"
            placeholder="All"
            showClear
            class="filter-dropdown"
          />
        </template>
      </Column>
      <Column
        :hidden="!selectedColumns.includes('concept')"
        field="concept"
        :showFilterMenu="false"
        style="text-align: start"
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
        :hidden="!selectedColumns.includes('timeWindow')"
        field="timeWindow"
        :showFilterMenu="false"
        style="text-align: start"
      >
        <template #filter>
          <Dropdown
            v-model="continuousDropdownFilters.timeWindow"
            :options="timeWindowOptions"
            placeholder="All"
            showClear
            class="filter-dropdown"
          />
        </template>
      </Column>
      <Column
        :hidden="!selectedColumns.includes('windowDays')"
        field="windowDays"
        :showFilterMenu="false"
        style="text-align: start"
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
        :hidden="!selectedColumns.includes('subType')"
        field="subType"
        :showFilterMenu="false"
        style="text-align: start"
      >
        <template #filter>
          <Dropdown
            v-model="continuousDropdownFilters.subType"
            :options="continuousSubTypeOptions"
            placeholder="All"
            showClear
            class="filter-dropdown"
          />
        </template>
      </Column>
      <Column
        :hidden="!selectedColumns.includes('detail')"
        field="detail"
        :showFilterMenu="false"
        style="text-align: start"
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
      <template v-for="phase in presentPhases" :key="'cc-' + phase">
        <Column
          :hidden="!selectedColumns.includes('statCount')"
          style="text-align: end"
          :field="'countValue_' + phase"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex[phase])"
        >
          <template #body="{ data }">
            <CensoredCell :text="formatCensored(data['countValue_' + phase])" />
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
          :hidden="!selectedColumns.includes('min')"
          style="text-align: end"
          :field="'minValue_' + phase"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex[phase])"
        >
          <template #body="{ data }">{{
            formatNum(data["minValue_" + phase])
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
          :field="'maxValue_' + phase"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex[phase])"
        >
          <template #body="{ data }">{{
            formatNum(data["maxValue_" + phase])
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
          :hidden="!selectedColumns.includes('mean')"
          style="text-align: end"
          :field="'averageValue_' + phase"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex[phase])"
        >
          <template #body="{ data }">{{
            formatNum(data["averageValue_" + phase])
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
          :field="'standardDeviation_' + phase"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex[phase])"
        >
          <template #body="{ data }">{{
            formatNum(data["standardDeviation_" + phase])
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
          :field="'medianValue_' + phase"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex[phase])"
        >
          <template #body="{ data }">{{
            formatNum(data["medianValue_" + phase])
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
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";
import TableToolbar from "@/widgets/tableToolbar";
import CensoredCell from "../../shared/censoredCell";
import { formatCensored, formatNum } from "@/shared/lib/formatters";
import { useGroupBanding } from "../../shared/useGroupBanding";
import { UPDATE_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";

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

const selectedColumns = ref<string[]>(
  store.getters.getSettings.columnSelection?.[STORAGE_KEY]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY]
    : CS_DEFAULT_COLUMNS
);

watch(selectedColumns, (val) => {
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

const timeWindowOptions = ["temporal", "any_time_prior", "window"];

const continuousDropdownFilters = ref<{
  domain: string | null;
  subType: string | null;
  timeWindow: string | null;
}>({ domain: null, subType: null, timeWindow: null });

const continuousDomainOptions = computed(
  () =>
    [
      ...new Set(props.data.map((r: any) => r.domain).filter(Boolean)),
    ].sort() as string[]
);

const continuousSubTypeOptions = computed(
  () =>
    [
      ...new Set(props.data.map((r: any) => r.subType).filter(Boolean)),
    ].sort() as string[]
);

const continuousTableFilters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  concept: { value: null, matchMode: FilterMatchMode.CONTAINS },
  windowDays: { value: null, matchMode: FilterMatchMode.CONTAINS },
  detail: { value: null, matchMode: FilterMatchMode.CONTAINS },
  covariateId: { value: null, matchMode: FilterMatchMode.CONTAINS },
  countValue_Before: { value: null, matchMode: FilterMatchMode.CONTAINS },
  minValue_Before: { value: null, matchMode: FilterMatchMode.CONTAINS },
  maxValue_Before: { value: null, matchMode: FilterMatchMode.CONTAINS },
  averageValue_Before: { value: null, matchMode: FilterMatchMode.CONTAINS },
  standardDeviation_Before: {
    value: null,
    matchMode: FilterMatchMode.CONTAINS,
  },
  medianValue_Before: { value: null, matchMode: FilterMatchMode.CONTAINS },
  countValue_During: { value: null, matchMode: FilterMatchMode.CONTAINS },
  minValue_During: { value: null, matchMode: FilterMatchMode.CONTAINS },
  maxValue_During: { value: null, matchMode: FilterMatchMode.CONTAINS },
  averageValue_During: { value: null, matchMode: FilterMatchMode.CONTAINS },
  standardDeviation_During: {
    value: null,
    matchMode: FilterMatchMode.CONTAINS,
  },
  medianValue_During: { value: null, matchMode: FilterMatchMode.CONTAINS },
  countValue_After: { value: null, matchMode: FilterMatchMode.CONTAINS },
  minValue_After: { value: null, matchMode: FilterMatchMode.CONTAINS },
  maxValue_After: { value: null, matchMode: FilterMatchMode.CONTAINS },
  averageValue_After: { value: null, matchMode: FilterMatchMode.CONTAINS },
  standardDeviation_After: { value: null, matchMode: FilterMatchMode.CONTAINS },
  medianValue_After: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

watch(search, (val) => {
  continuousTableFilters.value.global.value = val;
});

const filteredRows = computed(() => {
  let rows = props.data;
  if (continuousDropdownFilters.value.domain)
    rows = rows.filter(
      (r: any) => r.domain === continuousDropdownFilters.value.domain
    );
  if (continuousDropdownFilters.value.subType)
    rows = rows.filter(
      (r: any) => r.subType === continuousDropdownFilters.value.subType
    );
  if (continuousDropdownFilters.value.timeWindow)
    rows = rows.filter(
      (r: any) => r.timeWindow === continuousDropdownFilters.value.timeWindow
    );
  return rows;
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
