<template>
  <div>
    <TableToolbar
      v-model:search="search"
      v-model:columns="selectedColumns"
      :column-options="drColumnOptions"
      v-model:show-filters="showFilters"
      v-model:fullscreen="localFullscreen"
      :table-ref="tableRef"
      :rows="props.data"
      filename="dechallenge-rechallenge"
    />
    <DataTable
      ref="tableRef"
      :value="props.data"
      :paginator="props.data.length > 25"
      :rows="25"
      :filterDisplay="showFilters ? 'row' : undefined"
      v-model:filters="tableFilters"
      :globalFilterFields="['databaseName']"
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
        :hidden="!selectedColumns.includes('dechallengeStopInterval')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="dechallengeStopInterval"
        header="Stop Interval"
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
        :hidden="!selectedColumns.includes('dechallengeEvaluationWindow')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="dechallengeEvaluationWindow"
        header="Eval Window"
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
        :hidden="!selectedColumns.includes('numExposureEras')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="numExposureEras"
        header="# Exp Eras"
        sortable
        :showFilterMenu="false"
      >
        <template #body="{ data: rowData }">
          <CensoredCell :text="formatCensored(rowData.numExposureEras)" />
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
        :hidden="!selectedColumns.includes('numPersonsExposed')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="numPersonsExposed"
        header="# Exposed"
        sortable
        :showFilterMenu="false"
      >
        <template #body="{ data: rowData }">
          <CensoredCell :text="formatCensored(rowData.numPersonsExposed)" />
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
        :hidden="!selectedColumns.includes('numCases')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="numCases"
        header="# Cases"
        sortable
        :showFilterMenu="false"
      >
        <template #body="{ data: rowData }">
          <CensoredCell :text="formatCensored(rowData.numCases)" />
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
        :hidden="!selectedColumns.includes('dechallengeAttempt')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="dechallengeAttempt"
        header="# D.Attempt"
        sortable
        :showFilterMenu="false"
      >
        <template #body="{ data: rowData }">
          <CensoredCell :text="formatCensored(rowData.dechallengeAttempt)" />
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
        :hidden="!selectedColumns.includes('dechallengeFail')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="dechallengeFail"
        header="# D.Fail"
        sortable
        :showFilterMenu="false"
      >
        <template #body="{ data: rowData }">
          <CensoredCell :text="formatCensored(rowData.dechallengeFail)" />
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
        :hidden="!selectedColumns.includes('dechallengeSuccess')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="dechallengeSuccess"
        header="# D.Success"
        sortable
        :showFilterMenu="false"
      >
        <template #body="{ data: rowData }">
          <CensoredCell :text="formatCensored(rowData.dechallengeSuccess)" />
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
        :hidden="!selectedColumns.includes('pctDechallengeAttempt')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="pctDechallengeAttempt"
        header="% D.Attempt"
        sortable
        :showFilterMenu="false"
      >
        <template #body="{ data: rowData }">{{
          formatPct(rowData.pctDechallengeAttempt)
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
        :hidden="!selectedColumns.includes('pctDechallengeSuccess')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="pctDechallengeSuccess"
        header="% D.Success"
        sortable
        :showFilterMenu="false"
      >
        <template #body="{ data: rowData }">{{
          formatPct(rowData.pctDechallengeSuccess)
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
        :hidden="!selectedColumns.includes('pctDechallengeFail')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="pctDechallengeFail"
        header="% D.Fail"
        sortable
        :showFilterMenu="false"
      >
        <template #body="{ data: rowData }">{{
          formatPct(rowData.pctDechallengeFail)
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
        :hidden="!selectedColumns.includes('rechallengeAttempt')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="rechallengeAttempt"
        header="# R.Attempt"
        sortable
        :showFilterMenu="false"
      >
        <template #body="{ data: rowData }">
          <CensoredCell :text="formatCensored(rowData.rechallengeAttempt)" />
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
        :hidden="!selectedColumns.includes('rechallengeFail')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="rechallengeFail"
        header="# R.Fail"
        sortable
        :showFilterMenu="false"
      >
        <template #body="{ data: rowData }">
          <CensoredCell :text="formatCensored(rowData.rechallengeFail)" />
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
        :hidden="!selectedColumns.includes('rechallengeSuccess')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="rechallengeSuccess"
        header="# R.Success"
        sortable
        :showFilterMenu="false"
      >
        <template #body="{ data: rowData }">
          <CensoredCell :text="formatCensored(rowData.rechallengeSuccess)" />
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
        :hidden="!selectedColumns.includes('pctRechallengeAttempt')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="pctRechallengeAttempt"
        header="% R.Attempt"
        sortable
        :showFilterMenu="false"
      >
        <template #body="{ data: rowData }">{{
          formatPct(rowData.pctRechallengeAttempt)
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
        :hidden="!selectedColumns.includes('pctRechallengeSuccess')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="pctRechallengeSuccess"
        header="% R.Success"
        sortable
        :showFilterMenu="false"
      >
        <template #body="{ data: rowData }">{{
          formatPct(rowData.pctRechallengeSuccess)
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
        :hidden="!selectedColumns.includes('pctRechallengeFail')"
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        field="pctRechallengeFail"
        header="% R.Fail"
        sortable
        :showFilterMenu="false"
      >
        <template #body="{ data: rowData }">{{
          formatPct(rowData.pctRechallengeFail)
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
import InputText from "primevue/inputtext";
import CensoredCell from "../../shared/censoredCell";
import Tooltip from "@/shared/ui/tooltip";
import { FilterMatchMode } from "primevue/api";

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
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  databaseName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  dechallengeStopInterval: { value: null, matchMode: FilterMatchMode.CONTAINS },
  dechallengeEvaluationWindow: {
    value: null,
    matchMode: FilterMatchMode.CONTAINS,
  },
  numExposureEras: { value: null, matchMode: FilterMatchMode.CONTAINS },
  numPersonsExposed: { value: null, matchMode: FilterMatchMode.CONTAINS },
  numCases: { value: null, matchMode: FilterMatchMode.CONTAINS },
  dechallengeAttempt: { value: null, matchMode: FilterMatchMode.CONTAINS },
  dechallengeFail: { value: null, matchMode: FilterMatchMode.CONTAINS },
  dechallengeSuccess: { value: null, matchMode: FilterMatchMode.CONTAINS },
  pctDechallengeAttempt: { value: null, matchMode: FilterMatchMode.CONTAINS },
  pctDechallengeSuccess: { value: null, matchMode: FilterMatchMode.CONTAINS },
  pctDechallengeFail: { value: null, matchMode: FilterMatchMode.CONTAINS },
  rechallengeAttempt: { value: null, matchMode: FilterMatchMode.CONTAINS },
  rechallengeFail: { value: null, matchMode: FilterMatchMode.CONTAINS },
  rechallengeSuccess: { value: null, matchMode: FilterMatchMode.CONTAINS },
  pctRechallengeAttempt: { value: null, matchMode: FilterMatchMode.CONTAINS },
  pctRechallengeSuccess: { value: null, matchMode: FilterMatchMode.CONTAINS },
  pctRechallengeFail: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

watch(search, (val) => {
  tableFilters.value.global.value = val;
});

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
