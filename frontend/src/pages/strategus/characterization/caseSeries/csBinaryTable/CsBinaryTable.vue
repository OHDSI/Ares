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
      filename="case-series-binary"
    />
    <DataTable
      ref="tableRef"
      :value="filteredRows"
      :paginator="true"
      :rows="25"
      :rowsPerPageOptions="[10, 25, 50, 100]"
      :filterDisplay="showFilters ? 'row' : undefined"
      v-model:filters="binaryTableFilters"
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
              header="No." /><Column
              :hidden="!selectedColumns.includes('pct')"
              :pt="{
                ...subPt(phaseIndex.Before),
                headerContent: 'justify-end',
              }"
              header="%"
          /></template>
          <template v-if="hasBinaryPhase('During')"
            ><Column
              :hidden="!selectedColumns.includes('counts')"
              :pt="{
                ...subPt(phaseIndex.During),
                headerContent: 'justify-end',
              }"
              header="No." /><Column
              :hidden="!selectedColumns.includes('pct')"
              :pt="{
                ...subPt(phaseIndex.During),
                headerContent: 'justify-end',
              }"
              header="%"
          /></template>
          <template v-if="hasBinaryPhase('After')"
            ><Column
              :hidden="!selectedColumns.includes('counts')"
              :pt="{
                ...subPt(phaseIndex.After),
                headerContent: 'justify-end',
              }"
              header="No." /><Column
              :hidden="!selectedColumns.includes('pct')"
              :pt="{
                ...subPt(phaseIndex.After),
                headerContent: 'justify-end',
              }"
              header="%"
          /></template>
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
            v-model="binaryDropdownFilters.domain"
            :options="binaryDomainOptions"
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
            v-model="binaryDropdownFilters.timeWindow"
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
            v-model="binaryDropdownFilters.subType"
            :options="binarySubTypeOptions"
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
      <template v-if="hasBinaryPhase('Before')">
        <Column
          :hidden="!selectedColumns.includes('counts')"
          style="text-align: end"
          field="sumValue_Before"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex.Before)"
        >
          <template #body="{ data }">
            <CensoredCell :text="formatCensored(data.sumValue_Before)" />
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
          :hidden="!selectedColumns.includes('pct')"
          style="text-align: end"
          field="averageValue_Before"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex.Before)"
        >
          <template #body="{ data }">{{
            formatPct(data.averageValue_Before)
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
      <template v-if="hasBinaryPhase('During')">
        <Column
          :hidden="!selectedColumns.includes('counts')"
          style="text-align: end"
          field="sumValue_During"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex.During)"
        >
          <template #body="{ data }">
            <CensoredCell :text="formatCensored(data.sumValue_During)" />
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
          :hidden="!selectedColumns.includes('pct')"
          style="text-align: end"
          field="averageValue_During"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex.During)"
        >
          <template #body="{ data }">{{
            formatPct(data.averageValue_During)
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
      <template v-if="hasBinaryPhase('After')">
        <Column
          :hidden="!selectedColumns.includes('counts')"
          style="text-align: end"
          field="sumValue_After"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex.After)"
        >
          <template #body="{ data }">
            <CensoredCell :text="formatCensored(data.sumValue_After)" />
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
          :hidden="!selectedColumns.includes('pct')"
          style="text-align: end"
          field="averageValue_After"
          sortable
          :showFilterMenu="false"
          :pt="bodyPt(phaseIndex.After)"
        >
          <template #body="{ data }">{{
            formatPct(data.averageValue_After)
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
import { formatCensored, formatPct } from "@/shared/lib/formatters";
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

const binaryDropdownFilters = ref<{
  domain: string | null;
  subType: string | null;
  timeWindow: string | null;
}>({ domain: null, subType: null, timeWindow: null });

const binaryDomainOptions = computed(
  () =>
    [
      ...new Set(props.data.map((r: any) => r.domain).filter(Boolean)),
    ].sort() as string[]
);

const binarySubTypeOptions = computed(
  () =>
    [
      ...new Set(props.data.map((r: any) => r.subType).filter(Boolean)),
    ].sort() as string[]
);

const binaryTableFilters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  concept: { value: null, matchMode: FilterMatchMode.CONTAINS },
  windowDays: { value: null, matchMode: FilterMatchMode.CONTAINS },
  detail: { value: null, matchMode: FilterMatchMode.CONTAINS },
  sumValue_Before: { value: null, matchMode: FilterMatchMode.CONTAINS },
  averageValue_Before: { value: null, matchMode: FilterMatchMode.CONTAINS },
  sumValue_During: { value: null, matchMode: FilterMatchMode.CONTAINS },
  averageValue_During: { value: null, matchMode: FilterMatchMode.CONTAINS },
  sumValue_After: { value: null, matchMode: FilterMatchMode.CONTAINS },
  averageValue_After: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

watch(search, (val) => {
  binaryTableFilters.value.global.value = val;
});

const filteredRows = computed(() => {
  let rows = props.data;
  if (binaryDropdownFilters.value.domain)
    rows = rows.filter(
      (r: any) => r.domain === binaryDropdownFilters.value.domain
    );
  if (binaryDropdownFilters.value.subType)
    rows = rows.filter(
      (r: any) => r.subType === binaryDropdownFilters.value.subType
    );
  if (binaryDropdownFilters.value.timeWindow)
    rows = rows.filter(
      (r: any) => r.timeWindow === binaryDropdownFilters.value.timeWindow
    );
  return rows;
});

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
