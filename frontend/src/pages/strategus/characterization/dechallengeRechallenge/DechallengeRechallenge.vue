<template>
  <div class="dechal-rechal">
    <div class="section">
      <label class="field-label">Outcome</label>
      <OutcomeSelector v-model="selectedOutcome" :options="outcomeOptions" />

      <GenerateButton :disabled="generateDisabled" @click="generate" />
    </div>

    <ContextBar
      v-if="showResults"
      :items="[targetName, lastGeneratedConfig.outcomeName]"
    />

    <Message
      v-if="showResults && targetWarning"
      severity="warn"
      :closable="false"
    >
      The target cohort does not have multiple records per person - rechallenge
      attempts cannot be observed.
    </Message>
    <Message
      v-if="showResults && outcomeWarning"
      severity="warn"
      :closable="false"
    >
      The outcome cohort does not have multiple records per person - rechallenge
      attempts cannot be observed.
    </Message>

    <div
      v-if="showResults"
      :class="[
        'section',
        'results-body',
        {
          'results-fullscreen': isFullscreen,
          'results-leaving': isFullscreenLeaving,
        },
      ]"
    >
      <div v-if="isFullscreen" class="section-header">
        <h3>Dechallenge / Rechallenge</h3>
        <button
          class="fullscreen-btn"
          title="Exit fullscreen (Esc)"
          @click="exitFullscreen"
        >
          <SvgIcon :path="mdiFullscreenExit" :size="18" />
        </button>
      </div>
      <TableToolbar
        v-model:search="search"
        v-model:columns="selectedColumns"
        :column-options="drColumnOptions"
        v-model:show-filters="showFilters"
        v-model:fullscreen="isFullscreen"
        :table-ref="tableRef"
        :rows="tableData"
        filename="dechallenge-rechallenge"
      />
      <DataTable
        ref="tableRef"
        :value="tableData"
        :paginator="tableData.length > 25"
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
          <template #body="{ data }">
            <CensoredCell :text="formatCensored(data.numExposureEras)" />
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
          <template #body="{ data }">
            <CensoredCell :text="formatCensored(data.numPersonsExposed)" />
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
          <template #body="{ data }">
            <CensoredCell :text="formatCensored(data.numCases)" />
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
          <template #body="{ data }">
            <CensoredCell :text="formatCensored(data.dechallengeAttempt)" />
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
          <template #body="{ data }">
            <CensoredCell :text="formatCensored(data.dechallengeFail)" />
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
          <template #body="{ data }">
            <CensoredCell :text="formatCensored(data.dechallengeSuccess)" />
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
          <template #body="{ data }">{{
            formatPct(data.pctDechallengeAttempt)
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
          <template #body="{ data }">{{
            formatPct(data.pctDechallengeSuccess)
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
          <template #body="{ data }">{{
            formatPct(data.pctDechallengeFail)
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
          <template #body="{ data }">
            <CensoredCell :text="formatCensored(data.rechallengeAttempt)" />
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
          <template #body="{ data }">
            <CensoredCell :text="formatCensored(data.rechallengeFail)" />
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
          <template #body="{ data }">
            <CensoredCell :text="formatCensored(data.rechallengeSuccess)" />
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
          <template #body="{ data }">{{
            formatPct(data.pctRechallengeAttempt)
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
          <template #body="{ data }">{{
            formatPct(data.pctRechallengeSuccess)
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
          <template #body="{ data }">{{
            formatPct(data.pctRechallengeFail)
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
          <template #body="{ data, index }">
            <Tooltip text="View fail cases">
              <Button
                icon="pi pi-chart-line"
                size="small"
                severity="secondary"
                text
                rounded
                @click="showFails(data, index)"
              />
            </Tooltip>
          </template>
        </Column>
      </DataTable>
    </div>

    <div v-else-if="!loading" class="section empty-state">
      Select an outcome, then click Generate.
    </div>

    <ResultsLoader :loader-state="loaderState" />

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
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import Chart from "@/widgets/echarts/echarts";
import { failsChartSpec } from "./chartSpec";

import ResultsLoader from "../shared/resultsLoader";
import OutcomeSelector from "../shared/outcomeSelector";
import ContextBar from "../shared/contextBar";
import TableToolbar from "@/widgets/tableToolbar";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import GenerateButton from "@/pages/strategus/characterization/shared/generateButton";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import CensoredCell from "../shared/censoredCell";
import Tooltip from "@/shared/ui/tooltip";
import { FilterMatchMode } from "primevue/api";

import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { formatCensored, formatPct } from "@/shared/lib/formatters";
import { useStore } from "vuex";
import { UPDATE_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";
import SvgIcon from "@/shared/ui/svgIcon";
import { mdiFullscreenExit } from "@mdi/js";

const store = useStore();
const darkMode = computed(() => store.getters.getSettings.darkMode);

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

const props = defineProps({
  targetRow: { type: Object },
  outcomeTable: { type: Array },
  initialUrlState: { type: Object, default: null },
});

const emit = defineEmits(["state-change"]);

const tableRef = ref(null);
const isFullscreen = ref(false);
const isFullscreenLeaving = ref(false);

function exitFullscreen() {
  isFullscreenLeaving.value = true;
  setTimeout(() => {
    isFullscreen.value = false;
    isFullscreenLeaving.value = false;
  }, 230);
}

const loading = ref(false);
const showResults = ref(false);
const showFilters = ref(false);
const loaderState = ref("idle");
const selectedOutcome = ref(null);
const tableData = ref([]);
const targetWarning = ref(false);
const outcomeWarning = ref(false);
const lastGeneratedConfig = ref(null);

const failsDialogVisible = ref(false);
const failPlotData = ref([]);

const search = ref("");

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

const outcomeOptions = computed(() => props.outcomeTable ?? []);
const targetName = computed(() => props.targetRow?.cohortName ?? "");
const outcomeName = computed(() => selectedOutcome.value?.cohortName ?? "");

watch(
  () => props.targetRow,
  () => {
    showResults.value = false;
    tableData.value = [];
  }
);

async function fetchDechalRechalData(targetId, outcomeId) {
  const res = await StrategusService.characterization.getDechallengeRechallenge(
    [targetId],
    [outcomeId]
  );
  return res.data;
}

async function fetchFailData(
  targetId,
  outcomeId,
  databaseId,
  stopInterval,
  evalWindow
) {
  const res =
    await StrategusService.characterization.getDechallengeRechallengeFails(
      targetId,
      outcomeId,
      databaseId,
      stopInterval,
      evalWindow
    );
  return res.data;
}

async function fetchIsUniquePeople(cohortId) {
  const res = await StrategusService.characterization.getCohortUniquePeople(
    cohortId
  );
  return res.data;
}

async function generate() {
  if (!selectedOutcome.value || !props.targetRow) {
    showResults.value = false;
    return;
  }

  showResults.value = false;
  loading.value = true;
  loaderState.value = "loading";
  const loadStart = Date.now();
  try {
    const targetId = props.targetRow.cohortId;
    const outcomeId = selectedOutcome.value.cohortId;

    const [data, targetUnique, outcomeUnique] = await Promise.all([
      fetchDechalRechalData(targetId, outcomeId),
      fetchIsUniquePeople(targetId),
      fetchIsUniquePeople(outcomeId),
    ]);

    tableData.value = data;
    targetWarning.value = targetUnique.isUnique;
    outcomeWarning.value = outcomeUnique.isUnique;
    if (Date.now() - loadStart >= 600) {
      loaderState.value = "success";
      await new Promise((r) => setTimeout(r, 1100));
    }
    loaderState.value = "idle";
    await new Promise((r) => setTimeout(r, 220));
    showResults.value = true;
    lastGeneratedConfig.value = {
      outcome: outcomeId,
      outcomeName: outcomeName.value,
    };
    emit("state-change", {
      outcomeId: selectedOutcome.value.cohortId,
      ctxItems: [outcomeName.value],
    });
  } catch {
    loaderState.value = "error";
  } finally {
    loading.value = false;
  }
}

async function showFails(rowData, index) {
  const data = await fetchFailData(
    props.targetRow.cohortId,
    selectedOutcome.value.cohortId,
    rowData.databaseId,
    rowData.dechallengeStopInterval,
    rowData.dechallengeEvaluationWindow
  );

  failPlotData.value = data?.length ? data : [];
  failsDialogVisible.value = true;
}

const generateDisabled = computed(() => {
  if (!selectedOutcome.value) return true;
  if (!lastGeneratedConfig.value) return false;
  return selectedOutcome.value.cohortId === lastGeneratedConfig.value.outcome;
});

function onKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    if (isFullscreen.value) exitFullscreen();
    else if (failsDialogVisible.value) failsDialogVisible.value = false;
  }
}

onMounted(async () => {
  window.addEventListener("keydown", onKeyDown);

  const url = props.initialUrlState;

  if (url?.outcomeId && outcomeOptions.value.length) {
    const match = outcomeOptions.value.find(
      (o) => o.cohortId === url.outcomeId
    );
    if (match) selectedOutcome.value = match;
  }

  await nextTick();
  if (selectedOutcome.value) await generate();
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
});
</script>

<style scoped>
@import "../shared/styles.css";

.dechal-rechal {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

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

.results-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 1001;
  border-radius: 0;
  max-width: none;
  padding: 1.25rem 1.75rem;
  background: var(--color-bg-page);
  overflow-y: auto;
  animation: dr-fs-enter 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.results-fullscreen.results-leaving {
  animation: dr-fs-leave 0.22s cubic-bezier(0.4, 0, 1, 1) forwards;
}

@keyframes dr-fs-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes dr-fs-leave {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
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
