<template>
  <div>
    <TableToolbar
      v-model:search="search"
      v-model:columns="selectedColumns"
      :column-options="drColumnOptions"
      v-model:show-filters="showFilters"
      v-model:fullscreen="localFullscreen"
      :table-ref="tableRef"
      :rows="filteredRows"
      :search-error="searchError"
      :search-suggestions="searchSuggestions"
      filename="dechallenge-rechallenge"
      :has-active-filters="hasActiveFilters"
      @clear-filters="clearFilters"
    />
    <DataTable
      ref="tableRef"
      :value="filteredRows"
      :paginator="filteredRows.length > 25"
      :rows="25"
      sortMode="multiple"
      removableSort
      :striped-rows="store.getters.getSettings.strippedRows"
      size="small"
      class="result-table"
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
        :hidden="!selectedColumns.includes('dechallengeStopInterval')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="dechallengeStopInterval"
        sortable
        :showFilterMenu="false"
      >
        <template #header>
          <div class="col-header-with-filter">
            <span>Stop Interval</span>
            <FilterInput
              v-if="showFilters"
              :filterObj="tableFilters.dechallengeStopInterval"
              type="numeric"
            />
          </div>
        </template>
      </Column>
      <Column
        :hidden="!selectedColumns.includes('dechallengeEvaluationWindow')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="dechallengeEvaluationWindow"
        sortable
        :showFilterMenu="false"
      >
        <template #header>
          <div class="col-header-with-filter">
            <span>Eval Window</span>
            <FilterInput
              v-if="showFilters"
              :filterObj="tableFilters.dechallengeEvaluationWindow"
              type="numeric"
            />
          </div>
        </template>
      </Column>
      <Column
        :hidden="!selectedColumns.includes('numExposureEras')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="numExposureEras"
        sortable
        :showFilterMenu="false"
      >
        <template #header>
          <div class="col-header-with-filter">
            <span># Exp Eras</span>
            <FilterInput
              v-if="showFilters"
              :filterObj="tableFilters.numExposureEras"
              type="numeric"
            />
          </div>
        </template>
        <template #body="{ data: rowData }">
          <CensoredCell :text="formatCensored(rowData.numExposureEras)" />
        </template>
      </Column>
      <Column
        :hidden="!selectedColumns.includes('numPersonsExposed')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="numPersonsExposed"
        sortable
        :showFilterMenu="false"
      >
        <template #header>
          <div class="col-header-with-filter">
            <span># Exposed</span>
            <FilterInput
              v-if="showFilters"
              :filterObj="tableFilters.numPersonsExposed"
              type="numeric"
            />
          </div>
        </template>
        <template #body="{ data: rowData }">
          <CensoredCell :text="formatCensored(rowData.numPersonsExposed)" />
        </template>
      </Column>
      <Column
        :hidden="!selectedColumns.includes('numCases')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="numCases"
        sortable
        :showFilterMenu="false"
      >
        <template #header>
          <div class="col-header-with-filter">
            <span># Cases</span>
            <FilterInput
              v-if="showFilters"
              :filterObj="tableFilters.numCases"
              type="numeric"
            />
          </div>
        </template>
        <template #body="{ data: rowData }">
          <CensoredCell :text="formatCensored(rowData.numCases)" />
        </template>
      </Column>
      <Column
        :hidden="!selectedColumns.includes('dechallengeAttempt')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="dechallengeAttempt"
        sortable
        :showFilterMenu="false"
      >
        <template #header>
          <div class="col-header-with-filter">
            <span># D.Attempt</span>
            <FilterInput
              v-if="showFilters"
              :filterObj="tableFilters.dechallengeAttempt"
              type="numeric"
            />
          </div>
        </template>
        <template #body="{ data: rowData }">
          <CensoredCell :text="formatCensored(rowData.dechallengeAttempt)" />
        </template>
      </Column>
      <Column
        :hidden="!selectedColumns.includes('dechallengeFail')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="dechallengeFail"
        sortable
        :showFilterMenu="false"
      >
        <template #header>
          <div class="col-header-with-filter">
            <span># D.Fail</span>
            <FilterInput
              v-if="showFilters"
              :filterObj="tableFilters.dechallengeFail"
              type="numeric"
            />
          </div>
        </template>
        <template #body="{ data: rowData }">
          <CensoredCell :text="formatCensored(rowData.dechallengeFail)" />
        </template>
      </Column>
      <Column
        :hidden="!selectedColumns.includes('dechallengeSuccess')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="dechallengeSuccess"
        sortable
        :showFilterMenu="false"
      >
        <template #header>
          <div class="col-header-with-filter">
            <span># D.Success</span>
            <FilterInput
              v-if="showFilters"
              :filterObj="tableFilters.dechallengeSuccess"
              type="numeric"
            />
          </div>
        </template>
        <template #body="{ data: rowData }">
          <CensoredCell :text="formatCensored(rowData.dechallengeSuccess)" />
        </template>
      </Column>
      <Column
        :hidden="!selectedColumns.includes('pctDechallengeAttempt')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="pctDechallengeAttempt"
        sortable
        :showFilterMenu="false"
      >
        <template #header>
          <div class="col-header-with-filter">
            <span>% D.Attempt</span>
            <FilterInput
              v-if="showFilters"
              :filterObj="tableFilters.pctDechallengeAttempt"
              type="numeric"
            />
          </div>
        </template>
        <template #body="{ data: rowData }">{{
          formatPct(rowData.pctDechallengeAttempt)
        }}</template>
      </Column>
      <Column
        :hidden="!selectedColumns.includes('pctDechallengeSuccess')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="pctDechallengeSuccess"
        sortable
        :showFilterMenu="false"
      >
        <template #header>
          <div class="col-header-with-filter">
            <span>% D.Success</span>
            <FilterInput
              v-if="showFilters"
              :filterObj="tableFilters.pctDechallengeSuccess"
              type="numeric"
            />
          </div>
        </template>
        <template #body="{ data: rowData }">{{
          formatPct(rowData.pctDechallengeSuccess)
        }}</template>
      </Column>
      <Column
        :hidden="!selectedColumns.includes('pctDechallengeFail')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="pctDechallengeFail"
        sortable
        :showFilterMenu="false"
      >
        <template #header>
          <div class="col-header-with-filter">
            <span>% D.Fail</span>
            <FilterInput
              v-if="showFilters"
              :filterObj="tableFilters.pctDechallengeFail"
              type="numeric"
            />
          </div>
        </template>
        <template #body="{ data: rowData }">{{
          formatPct(rowData.pctDechallengeFail)
        }}</template>
      </Column>
      <Column
        :hidden="!selectedColumns.includes('rechallengeAttempt')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="rechallengeAttempt"
        sortable
        :showFilterMenu="false"
      >
        <template #header>
          <div class="col-header-with-filter">
            <span># R.Attempt</span>
            <FilterInput
              v-if="showFilters"
              :filterObj="tableFilters.rechallengeAttempt"
              type="numeric"
            />
          </div>
        </template>
        <template #body="{ data: rowData }">
          <CensoredCell :text="formatCensored(rowData.rechallengeAttempt)" />
        </template>
      </Column>
      <Column
        :hidden="!selectedColumns.includes('rechallengeFail')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="rechallengeFail"
        sortable
        :showFilterMenu="false"
      >
        <template #header>
          <div class="col-header-with-filter">
            <span># R.Fail</span>
            <FilterInput
              v-if="showFilters"
              :filterObj="tableFilters.rechallengeFail"
              type="numeric"
            />
          </div>
        </template>
        <template #body="{ data: rowData }">
          <CensoredCell :text="formatCensored(rowData.rechallengeFail)" />
        </template>
      </Column>
      <Column
        :hidden="!selectedColumns.includes('rechallengeSuccess')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="rechallengeSuccess"
        sortable
        :showFilterMenu="false"
      >
        <template #header>
          <div class="col-header-with-filter">
            <span># R.Success</span>
            <FilterInput
              v-if="showFilters"
              :filterObj="tableFilters.rechallengeSuccess"
              type="numeric"
            />
          </div>
        </template>
        <template #body="{ data: rowData }">
          <CensoredCell :text="formatCensored(rowData.rechallengeSuccess)" />
        </template>
      </Column>
      <Column
        :hidden="!selectedColumns.includes('pctRechallengeAttempt')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="pctRechallengeAttempt"
        sortable
        :showFilterMenu="false"
      >
        <template #header>
          <div class="col-header-with-filter">
            <span>% R.Attempt</span>
            <FilterInput
              v-if="showFilters"
              :filterObj="tableFilters.pctRechallengeAttempt"
              type="numeric"
            />
          </div>
        </template>
        <template #body="{ data: rowData }">{{
          formatPct(rowData.pctRechallengeAttempt)
        }}</template>
      </Column>
      <Column
        :hidden="!selectedColumns.includes('pctRechallengeSuccess')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="pctRechallengeSuccess"
        sortable
        :showFilterMenu="false"
      >
        <template #header>
          <div class="col-header-with-filter">
            <span>% R.Success</span>
            <FilterInput
              v-if="showFilters"
              :filterObj="tableFilters.pctRechallengeSuccess"
              type="numeric"
            />
          </div>
        </template>
        <template #body="{ data: rowData }">{{
          formatPct(rowData.pctRechallengeSuccess)
        }}</template>
      </Column>
      <Column
        :hidden="!selectedColumns.includes('pctRechallengeFail')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="pctRechallengeFail"
        sortable
        :showFilterMenu="false"
      >
        <template #header>
          <div class="col-header-with-filter">
            <span>% R.Fail</span>
            <FilterInput
              v-if="showFilters"
              :filterObj="tableFilters.pctRechallengeFail"
              type="numeric"
            />
          </div>
        </template>
        <template #body="{ data: rowData }">{{
          formatPct(rowData.pctRechallengeFail)
        }}</template>
      </Column>
      <Column
        header="Fails"
        style="width: 56px; text-align: center"
        :pt="{ headerContent: 'justify-center' }"
      >
        <template #body="{ data: rowData, index }">
          <Tooltip text="View fail cases">
            <Button
              icon="pi pi-chart-line"
              size="small"
              severity="secondary"
              text
              rounded
              @click="showFails(rowData, index)"
            />
          </Tooltip>
        </template>
      </Column>
    </DataTable>

    <Teleport to="body">
      <Transition name="fails-modal">
        <div
          v-if="failsDialogVisible"
          class="fails-modal-backdrop"
          @click.self="failsDialogVisible = false"
        >
          <div class="fails-modal-panel section">
            <div class="fails-modal-header">
              <span class="fails-modal-title">Failed Dechallenge Cases</span>
              <Button
                icon="pi pi-times"
                severity="secondary"
                text
                rounded
                size="small"
                @click="failsDialogVisible = false"
              />
            </div>
            <div v-if="failPlotData.length" class="fails-chart-container">
              <Chart
                :data="failPlotData"
                :chartSpec="failsChartSpec"
                id="fails-chart"
                height="460px"
              />
            </div>
            <p v-else class="table-note">No fails to display.</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import Chart from "@/widgets/echarts/echarts";
import { failsChartSpec } from "../chartSpec";

import TableToolbar from "@/widgets/tableToolbar";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import FilterInput from "../../shared/filterInput";
import CensoredCell from "../../shared/censoredCell";
import Tooltip from "@/shared/ui/tooltip";
import { FilterMatchMode } from "primevue/api";
import { useTableFilter } from "../../shared/useTableFilter";

import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { formatCensored, formatPct } from "@/shared/lib/formatters";
import { useStore } from "vuex";
import { UPDATE_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";

const props = defineProps<{
  data: any[];
  isFullscreen: boolean;
  targetId: number;
  outcomeId: number;
}>();

const emit = defineEmits<{
  (e: "update:fullscreen", val: boolean): void;
}>();

const store = useStore();

const localFullscreen = computed({
  get: () => props.isFullscreen,
  set: (val: boolean) => emit("update:fullscreen", val),
});

const STORAGE_KEY = "char:dechalRechal";

const drColumnOptions = [
  { label: "Database", key: "databaseName" },
  { label: "Stop Interval", key: "dechallengeStopInterval" },
  { label: "Eval Window", key: "dechallengeEvaluationWindow" },
  { label: "# Exp Eras", key: "numExposureEras" },
  { label: "# Exposed", key: "numPersonsExposed" },
  { label: "# Cases", key: "numCases" },
  { label: "# D.Attempt", key: "dechallengeAttempt" },
  { label: "# D.Fail", key: "dechallengeFail" },
  { label: "# D.Success", key: "dechallengeSuccess" },
  { label: "% D.Attempt", key: "pctDechallengeAttempt" },
  { label: "% D.Success", key: "pctDechallengeSuccess" },
  { label: "% D.Fail", key: "pctDechallengeFail" },
  { label: "# R.Attempt", key: "rechallengeAttempt" },
  { label: "# R.Fail", key: "rechallengeFail" },
  { label: "# R.Success", key: "rechallengeSuccess" },
  { label: "% R.Attempt", key: "pctRechallengeAttempt" },
  { label: "% R.Success", key: "pctRechallengeSuccess" },
  { label: "% R.Fail", key: "pctRechallengeFail" },
];

const DR_DEFAULT_COLUMNS = [
  "databaseName",
  "dechallengeStopInterval",
  "dechallengeEvaluationWindow",
  "numExposureEras",
  "numPersonsExposed",
  "numCases",
  "dechallengeAttempt",
  "dechallengeFail",
  "dechallengeSuccess",
  "rechallengeAttempt",
  "rechallengeSuccess",
];

const selectedColumns = ref(
  store.getters.getSettings.columnSelection?.[STORAGE_KEY]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY]
    : DR_DEFAULT_COLUMNS
);

watch(selectedColumns, (val) => {
  store.dispatch(UPDATE_COLUMN_SELECTION, { [STORAGE_KEY]: val });
});

const tableRef = ref(null);
const search = ref("");
const showFilters = ref(false);

const tableFilters = ref({
  databaseName: { value: null as any, matchMode: FilterMatchMode.CONTAINS },
  dechallengeStopInterval: {
    value: null as any,
    matchMode: FilterMatchMode.EQUALS,
  },
  dechallengeEvaluationWindow: {
    value: null as any,
    matchMode: FilterMatchMode.EQUALS,
  },
  numExposureEras: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  numPersonsExposed: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  numCases: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  dechallengeAttempt: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  dechallengeFail: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  dechallengeSuccess: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  pctDechallengeAttempt: {
    value: null as any,
    matchMode: FilterMatchMode.EQUALS,
  },
  pctDechallengeSuccess: {
    value: null as any,
    matchMode: FilterMatchMode.EQUALS,
  },
  pctDechallengeFail: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  rechallengeAttempt: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  rechallengeFail: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  rechallengeSuccess: { value: null as any, matchMode: FilterMatchMode.EQUALS },
  pctRechallengeAttempt: {
    value: null as any,
    matchMode: FilterMatchMode.EQUALS,
  },
  pctRechallengeSuccess: {
    value: null as any,
    matchMode: FilterMatchMode.EQUALS,
  },
  pctRechallengeFail: { value: null as any, matchMode: FilterMatchMode.EQUALS },
});

const dropdownFilters = ref({} as Record<string, any>);

const searchSuggestions = [
  "databaseName",
  "dechallengeStopInterval",
  "dechallengeEvaluationWindow",
  "numExposureEras",
  "numPersonsExposed",
  "numCases",
  "dechallengeAttempt",
  "dechallengeFail",
  "dechallengeSuccess",
  "pctDechallengeAttempt",
  "pctDechallengeSuccess",
  "pctDechallengeFail",
  "rechallengeAttempt",
  "rechallengeFail",
  "rechallengeSuccess",
  "pctRechallengeAttempt",
  "pctRechallengeSuccess",
  "pctRechallengeFail",
];

const { filteredRows, applyNow, searchError, hasActiveFilters, clearFilters } =
  useTableFilter(
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

const failsDialogVisible = ref(false);
const failPlotData = ref([]);

async function fetchFailData(
  databaseId: number,
  stopInterval: number,
  evalWindow: number
) {
  const res =
    await StrategusService.characterization.getDechallengeRechallengeFails(
      props.targetId,
      props.outcomeId,
      databaseId,
      stopInterval,
      evalWindow
    );
  return res.data;
}

async function showFails(rowData: any, _index: number) {
  const data = await fetchFailData(
    rowData.databaseId,
    rowData.dechallengeStopInterval,
    rowData.dechallengeEvaluationWindow
  );
  failPlotData.value = data?.length ? data : [];
  failsDialogVisible.value = true;
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape" && failsDialogVisible.value) {
    failsDialogVisible.value = false;
  }
}

onMounted(() => {
  window.addEventListener("keydown", onKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
});
</script>

<style scoped>
@import "../../shared/styles.css";

.fails-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.fails-modal-panel {
  width: 80vw;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.fails-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fails-modal-title {
  font-weight: 600;
  font-size: 0.9375rem;
  color: #1e293b;
}

.dark .fails-modal-title {
  color: #e2e8f0;
}

.fails-chart-container {
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
</style>

<style>
.fails-modal-enter-active,
.fails-modal-leave-active {
  transition: opacity 0.2s ease;
}

.fails-modal-enter-active .fails-modal-panel,
.fails-modal-leave-active .fails-modal-panel {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fails-modal-enter-from,
.fails-modal-leave-to {
  opacity: 0;
}

.fails-modal-enter-from .fails-modal-panel,
.fails-modal-leave-to .fails-modal-panel {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
</style>
