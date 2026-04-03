<template>
  <div class="dechal-rechal">
    <div class="section">
      <label class="field-label">Outcome</label>
      <OutcomeSelector v-model="selectedOutcome" :options="outcomeOptions" />

      <Button :disabled="generateDisabled" label="Generate" @click="generate" />
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

    <div v-if="showResults" class="section results-body">
      <DataTable
        :value="tableData"
        :paginator="tableData.length > 25"
        :rows="25"
        filterDisplay="row"
        v-model:filters="tableFilters"
        sortMode="multiple"
        removableSort
        :striped-rows="store.getters.getSettings.strippedRows"
        size="small"
        class="result-table"
      >
        <Column
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
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="numExposureEras"
          header="# Exp Eras"
          sortable
        >
          <template #body="{ data }">{{
            formatCensored(data.numExposureEras)
          }}</template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="numPersonsExposed"
          header="# Exposed"
          sortable
        >
          <template #body="{ data }">{{
            formatCensored(data.numPersonsExposed)
          }}</template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="numCases"
          header="# Cases"
          sortable
        >
          <template #body="{ data }">{{
            formatCensored(data.numCases)
          }}</template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="dechallengeAttempt"
          header="# D.Attempt"
          sortable
        >
          <template #body="{ data }">{{
            formatCensored(data.dechallengeAttempt)
          }}</template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="dechallengeFail"
          header="# D.Fail"
          sortable
        >
          <template #body="{ data }">{{
            formatCensored(data.dechallengeFail)
          }}</template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="dechallengeSuccess"
          header="# D.Success"
          sortable
        >
          <template #body="{ data }">{{
            formatCensored(data.dechallengeSuccess)
          }}</template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="pctDechallengeAttempt"
          header="% D.Attempt"
          sortable
        >
          <template #body="{ data }">{{
            formatPct(data.pctDechallengeAttempt)
          }}</template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="pctDechallengeSuccess"
          header="% D.Success"
          sortable
        >
          <template #body="{ data }">{{
            formatPct(data.pctDechallengeSuccess)
          }}</template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="pctDechallengeFail"
          header="% D.Fail"
          sortable
        >
          <template #body="{ data }">{{
            formatPct(data.pctDechallengeFail)
          }}</template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="rechallengeAttempt"
          header="# R.Attempt"
          sortable
        >
          <template #body="{ data }">{{
            formatCensored(data.rechallengeAttempt)
          }}</template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="rechallengeFail"
          header="# R.Fail"
          sortable
        >
          <template #body="{ data }">{{
            formatCensored(data.rechallengeFail)
          }}</template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="rechallengeSuccess"
          header="# R.Success"
          sortable
        >
          <template #body="{ data }">{{
            formatCensored(data.rechallengeSuccess)
          }}</template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="pctRechallengeAttempt"
          header="% R.Attempt"
          sortable
        >
          <template #body="{ data }">{{
            formatPct(data.pctRechallengeAttempt)
          }}</template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="pctRechallengeSuccess"
          header="% R.Success"
          sortable
        >
          <template #body="{ data }">{{
            formatPct(data.pctRechallengeSuccess)
          }}</template>
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          field="pctRechallengeFail"
          header="% R.Fail"
          sortable
        >
          <template #body="{ data }">{{
            formatPct(data.pctRechallengeFail)
          }}</template>
        </Column>
        <Column header="" style="width: 70px">
          <template #body="{ data, index }">
            <Button
              label="Fails"
              size="small"
              severity="secondary"
              text
              @click="showFails(data, index)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <div v-else-if="!loading" class="section empty-state">
      Select an outcome, then click Generate.
    </div>

    <ResultsLoader :loader-state="loaderState" />

    <Dialog
      v-model:visible="failsDialogVisible"
      header="Failed Dechallenge Cases"
      :modal="true"
      :style="{ width: '80vw' }"
    >
      <div v-if="failPlotData" class="fails-chart-container">
        <div ref="failsChartEl" class="fails-chart"></div>
      </div>
      <p v-else class="table-note">No fails to display.</p>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from "vue";
import * as echarts from "echarts";

import ResultsLoader from "./shared/ResultsLoader.vue";
import OutcomeSelector from "./shared/OutcomeSelector.vue";
import ContextBar from "./shared/ContextBar.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Dialog from "primevue/dialog";
import { FilterMatchMode } from "primevue/api";

import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { useStore } from "vuex";

const store = useStore();
const darkMode = computed(() => store.getters.getSettings.darkMode);

const props = defineProps({
  targetRow: { type: Object },
  outcomeTable: { type: Array },
  initialUrlState: { type: Object, default: null },
});

const emit = defineEmits(["state-change"]);

const loading = ref(false);
const showResults = ref(false);
const loaderState = ref("idle");
const selectedOutcome = ref(null);
const tableData = ref([]);
const targetWarning = ref(false);
const outcomeWarning = ref(false);
const lastGeneratedConfig = ref(null);

const failsDialogVisible = ref(false);
const failPlotData = ref(null);
const failsChartEl = ref(null);
let failsChart = null;

const tableFilters = ref({
  databaseName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  dechallengeStopInterval: { value: null, matchMode: FilterMatchMode.CONTAINS },
  dechallengeEvaluationWindow: {
    value: null,
    matchMode: FilterMatchMode.CONTAINS,
  },
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

function formatCensored(val) {
  if (val == null) return "";
  return val < 0 ? `< ${Math.abs(val)}` : val;
}
function formatPct(val) {
  if (val == null) return "";
  return `${(val * 100).toFixed(2)}%`;
}

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

  if (!data || data.length === 0) {
    failPlotData.value = null;
    failsDialogVisible.value = true;
    return;
  }

  failPlotData.value = data;
  failsDialogVisible.value = true;
  await nextTick();
  renderFailsChart(data);
}

function renderFailsChart(data) {
  if (!failsChartEl.value) return;

  const sorted = [...data].sort(
    (a, b) =>
      a.dechallengeExposureStartDateOffset -
        b.dechallengeExposureStartDateOffset ||
      a.dechallengeOutcomeStartDateOffset -
        b.dechallengeOutcomeStartDateOffset ||
      (a.rechallengeExposureStartDateOffset ?? 0) -
        (b.rechallengeExposureStartDateOffset ?? 0)
  );

  const persons = [...new Set(sorted.map((r) => r.personKey))];
  const pidMap = new Map(persons.map((pk, i) => [pk, persons.length - i]));

  const dechalExposure = [];
  const rechalExposure = [];
  const dechalOutcome = [];
  const rechalOutcome = [];

  for (const r of sorted) {
    const y = pidMap.get(r.personKey);
    dechalExposure.push(
      [r.dechallengeExposureStartDateOffset, y, r.dechallengeExposureNumber],
      [r.dechallengeExposureEndDateOffset, y, r.dechallengeExposureNumber],
      [null, null, null]
    );
    if (r.dechallengeOutcomeStartDateOffset != null) {
      dechalOutcome.push([
        r.dechallengeOutcomeStartDateOffset,
        y,
        r.dechallengeOutcomeNumber,
      ]);
    }
    if (r.rechallengeExposureStartDateOffset != null) {
      rechalExposure.push(
        [r.rechallengeExposureStartDateOffset, y, r.rechallengeExposureNumber],
        [r.rechallengeExposureEndDateOffset, y, r.rechallengeExposureNumber],
        [null, null, null]
      );
    }
    if (r.rechallengeOutcomeStartDateOffset != null) {
      rechalOutcome.push([
        r.rechallengeOutcomeStartDateOffset,
        y,
        r.rechallengeOutcomeNumber,
      ]);
    }
  }

  if (failsChart) failsChart.dispose();
  failsChart = echarts.init(failsChartEl.value, darkMode.value ? "dark" : null);

  failsChart.setOption({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      formatter: (p) => {
        if (!p.data || p.data[0] == null) return "";
        return `Day: ${p.data[0]}, Person: ${persons.length - p.data[1] + 1}`;
      },
    },
    xAxis: {
      name: "Time from first exposure",
      nameLocation: "center",
      nameGap: 30,
      type: "value",
    },
    yAxis: {
      name: "Each line is one person",
      nameLocation: "center",
      nameGap: 40,
      type: "value",
      min: 0,
      max: persons.length + 1,
      axisLabel: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    legend: {
      bottom: 0,
      data: [
        "Dechallenge Exposure",
        "Rechallenge Exposure",
        "Dechallenge Outcome",
        "Rechallenge Outcome",
      ],
    },
    series: [
      {
        name: "Dechallenge Exposure",
        type: "line",
        data: dechalExposure,
        symbol: "none",
        lineStyle: { width: 4, color: "#4169E1" },
        connectNulls: false,
      },
      {
        name: "Rechallenge Exposure",
        type: "line",
        data: rechalExposure,
        symbol: "none",
        lineStyle: { width: 4, color: "#191970" },
        connectNulls: false,
      },
      {
        name: "Dechallenge Outcome",
        type: "scatter",
        data: dechalOutcome,
        symbol: "diamond",
        symbolSize: 10,
        itemStyle: { color: "#FF8C00" },
      },
      {
        name: "Rechallenge Outcome",
        type: "scatter",
        data: rechalOutcome,
        symbol: "diamond",
        symbolSize: 10,
        itemStyle: { color: "#FF4500" },
      },
    ],
  });

  const ro = new ResizeObserver(() => failsChart?.resize());
  ro.observe(failsChartEl.value);
}

const generateDisabled = computed(() => {
  if (!selectedOutcome.value) return true;
  if (!lastGeneratedConfig.value) return false;
  return selectedOutcome.value.cohortId === lastGeneratedConfig.value.outcome;
});

onMounted(async () => {
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
</script>

<style scoped>
@import "./shared/styles.css";

.dechal-rechal {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.fails-chart-container {
  width: 100%;
}

.fails-chart {
  width: 100%;
  height: 450px;
}
</style>
