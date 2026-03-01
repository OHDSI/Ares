<template>
  <div class="dechal-rechal">
    <Message :closable="false" severity="info">
      <p>
        View how often the outcome occurs just before the target stops (a
        positive dechallenge) and how often the outcome restarts shortly after
        the target restarts (positive rechallenge).
      </p>
    </Message>

    <Panel header="Options" toggleable class="options-panel">
      <label class="field-label">Select Outcome</label>
      <DataTable
        :value="outcomeOptions"
        v-model:selection="selectedOutcome"
        selectionMode="single"
        dataKey="cohortId"
        :paginator="outcomeOptions.length > 10"
        :rows="10"
        filterDisplay="row"
        v-model:filters="outcomeFilters"
        stripedRows
        size="small"
        class="selector-table"
      >
        <Column selectionMode="single" headerStyle="width: 3rem" />

        <Column
          field="parentName"
          header="Outcome"
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
          field="cohortName"
          header="Subset"
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
          field="cohortId"
          header="Cohort ID"
          sortable
          style="width: 100px"
        />
      </DataTable>

      <Button
        label="Generate"
        :loading="loading"
        @click="generate"
        class="mt-3"
      />
    </Panel>

    <Panel v-if="showResults" header="Selected" toggleable class="mt-3">
      <div class="selected-summary">
        <span><strong>Target:</strong> {{ targetName }}</span>
        <span><strong>Outcome:</strong> {{ outcomeName }}</span>
      </div>
    </Panel>

    <Message
      v-if="showResults && targetWarning"
      severity="warn"
      class="mt-3"
      :closable="false"
    >
      WARNING: The target cohort does not have multiple records per person, so
      observing rechallenge attempts is not possible.
    </Message>
    <Message
      v-if="showResults && outcomeWarning"
      severity="warn"
      class="mt-3"
      :closable="false"
    >
      WARNING: The outcome cohort does not have multiple records per person, so
      observing rechallenge attempts is not possible.
    </Message>

    <Panel header="Results" class="mt-3">
      <DataTable
        v-if="showResults"
        :value="tableData"
        :paginator="tableData.length > 25"
        :rows="25"
        filterDisplay="row"
        v-model:filters="tableFilters"
        sortMode="multiple"
        removableSort
        stripedRows
        size="small"
        class="result-table"
      >
        <Column
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
          field="dechallengeStopInterval"
          header="Dechallenge Stop Interval"
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
          field="dechallengeEvaluationWindow"
          header="Dechallenge Eval Window"
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
        <Column field="numExposureEras" header="# Exposure Eras" sortable>
          <template #body="{ data }">{{
            formatCensored(data.numExposureEras)
          }}</template>
        </Column>
        <Column field="numPersonsExposed" header="# Exposed Persons" sortable>
          <template #body="{ data }">{{
            formatCensored(data.numPersonsExposed)
          }}</template>
        </Column>
        <Column field="numCases" header="# Cases" sortable>
          <template #body="{ data }">{{
            formatCensored(data.numCases)
          }}</template>
        </Column>
        <Column field="dechallengeAttempt" header="# Dechal Attempts" sortable>
          <template #body="{ data }">{{
            formatCensored(data.dechallengeAttempt)
          }}</template>
        </Column>
        <Column field="dechallengeFail" header="# Dechal Fails" sortable>
          <template #body="{ data }">{{
            formatCensored(data.dechallengeFail)
          }}</template>
        </Column>
        <Column field="dechallengeSuccess" header="# Dechal Successes" sortable>
          <template #body="{ data }">{{
            formatCensored(data.dechallengeSuccess)
          }}</template>
        </Column>
        <Column
          field="pctDechallengeAttempt"
          header="% Dechal Attempt"
          sortable
        >
          <template #body="{ data }">{{
            formatPct(data.pctDechallengeAttempt)
          }}</template>
        </Column>
        <Column
          field="pctDechallengeSuccess"
          header="% Dechal Success"
          sortable
        >
          <template #body="{ data }">{{
            formatPct(data.pctDechallengeSuccess)
          }}</template>
        </Column>
        <Column field="pctDechallengeFail" header="% Dechal Fail" sortable>
          <template #body="{ data }">{{
            formatPct(data.pctDechallengeFail)
          }}</template>
        </Column>
        <Column field="rechallengeAttempt" header="# Rechal Attempts" sortable>
          <template #body="{ data }">{{
            formatCensored(data.rechallengeAttempt)
          }}</template>
        </Column>
        <Column field="rechallengeFail" header="# Rechal Fails" sortable>
          <template #body="{ data }">{{
            formatCensored(data.rechallengeFail)
          }}</template>
        </Column>
        <Column field="rechallengeSuccess" header="# Rechal Successes" sortable>
          <template #body="{ data }">{{
            formatCensored(data.rechallengeSuccess)
          }}</template>
        </Column>
        <Column
          field="pctRechallengeAttempt"
          header="% Rechal Attempt"
          sortable
        >
          <template #body="{ data }">{{
            formatPct(data.pctRechallengeAttempt)
          }}</template>
        </Column>
        <Column
          field="pctRechallengeSuccess"
          header="% Rechal Success"
          sortable
        >
          <template #body="{ data }">{{
            formatPct(data.pctRechallengeSuccess)
          }}</template>
        </Column>
        <Column field="pctRechallengeFail" header="% Rechal Fail" sortable>
          <template #body="{ data }">{{
            formatPct(data.pctRechallengeFail)
          }}</template>
        </Column>
        <Column header="Actions" style="width: 80px">
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
      <p
        v-else-if="(!selectedOutcome || !showResults) && !loading"
        class="empty-hint"
      >
        Select an outcome, then click Generate to view risk factor results.
      </p>
    </Panel>

    <Dialog
      v-model:visible="failsDialogVisible"
      header="Failed Dechallenge Cases"
      :modal="true"
      :style="{ width: '80vw' }"
    >
      <div v-if="failPlotData" class="fails-chart-container">
        <div ref="failsChartEl" class="fails-chart"></div>
      </div>
      <p v-else class="help-text">No fails to display.</p>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from "vue";
import * as echarts from "echarts";

import Panel from "primevue/panel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Dialog from "primevue/dialog";
import { FilterMatchMode } from "primevue/api";

import { StrategusService } from "@/shared/api/aresApi/services/strategusService";

const props = defineProps({
  targetRow: {
    type: Object,
  },
  outcomeTable: {
    type: Array,
  },
});

const loading = ref(false);
const showResults = ref(false);
const selectedOutcome = ref(null);
const tableData = ref([]);
const targetWarning = ref(false);
const outcomeWarning = ref(false);

const failsDialogVisible = ref(false);
const failPlotData = ref(null);
const failsChartEl = ref(null);
let failsChart = null;

const outcomeFilters = ref({
  parentName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  cohortName: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
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

//todo: use shared
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

  loading.value = true;
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
    showResults.value = true;
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

//todo: use shared component
function renderFailsChart(data) {
  if (!failsChartEl.value) return;

  // sort by exposure start → outcome start
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

  const dechalExposure = []; // line segments
  const rechalExposure = [];
  const dechalOutcome = []; // scatter points
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
  failsChart = echarts.init(failsChartEl.value);

  failsChart.setOption({
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
</script>

<style scoped>
.dechal-rechal {
  padding: 1rem;
}
.help-text {
  color: var(--text-color-secondary, #6b7280);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}
.field-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.375rem;
  font-size: 0.875rem;
}
.options-panel {
  margin-top: 0.75rem;
}
.selector-table {
  margin-bottom: 1rem;
  font-size: 0.8125rem;
}
.selected-summary {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
}
.result-table {
  font-size: 0.8125rem;
}
.fails-chart-container {
  width: 100%;
}
.fails-chart {
  width: 100%;
  height: 450px;
}
.empty-hint {
  text-align: center;
  color: #999;
  padding: 2rem 0;
}
</style>
