<template>
  <div class="time-to-event">
    <div class="section">
      <label class="field-label">Outcome</label>
      <OutcomeSelector v-model="selectedOutcome" :options="outcomeOptions" />

      <GenerateButton :disabled="generateDisabled" @click="generate" />
    </div>

    <ContextBar
      v-if="showResults"
      :items="[targetName, lastGeneratedConfig.outcomeName]"
    />

    <div v-if="showResults" class="section results-body">
      <ViewToggle v-model="activeResultTab" :tabs="resultTabs" />

      <Transition name="tab-fade" mode="out-in"
        ><div :key="activeResultTab">
          <div v-if="activeResultTab === 0">
            <div class="plot-filters">
              <div>
                <label class="field-label">Databases</label>
                <MultiSelect
                  v-model="plotDatabases"
                  :options="uniqueDatabases"
                  placeholder="All databases"
                  filter
                  display="chip"
                  class="w-full"
                />
              </div>
              <div>
                <label class="field-label">Timespan</label>
                <MultiSelect
                  v-model="plotTimeScales"
                  :options="uniqueTimeScales"
                  placeholder="All"
                  class="w-full"
                />
              </div>
              <div>
                <label class="field-label">Outcome type</label>
                <MultiSelect
                  v-model="plotOutcomeTypes"
                  :options="uniqueOutcomeTypes"
                  placeholder="All"
                  class="w-full"
                />
              </div>
              <div>
                <label class="field-label">Timing</label>
                <MultiSelect
                  v-model="plotTargetOutcomeTypes"
                  :options="uniqueTargetOutcomeTypes"
                  placeholder="All"
                  class="w-full"
                />
              </div>
            </div>
            <div ref="chartEl" class="tte-chart"></div>
          </div>

          <div v-else-if="activeResultTab === 1">
            <div class="table-controls">
              <div class="col-selector">
                <label class="field-label">Columns</label>
                <MultiSelect
                  v-model="tableSelectedColumns"
                  :options="tableColumnOptions"
                  option-label="label"
                  option-value="key"
                  placeholder="All columns"
                  display="chip"
                  :filter="true"
                  :pt="colSelectorPt"
                  class="w-full"
                />
              </div>
            </div>
            <DataTable
              :value="allData"
              :paginator="true"
              :rows="25"
              :rowsPerPageOptions="[10, 25, 50, 100]"
              filterDisplay="row"
              v-model:filters="tableFilters"
              sortMode="multiple"
              removableSort
              :striped-rows="store.getters.getSettings.strippedRows"
              size="small"
              class="result-table"
            >
              <Column
                :hidden="!tableSelectedColumns.includes('databaseName')"
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
                :hidden="!tableSelectedColumns.includes('targetName')"
                style="text-align: start"
                :pt="{ headerContent: 'justify-start' }"
                field="targetName"
                header="Target"
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
                :hidden="!tableSelectedColumns.includes('outcomeName')"
                style="text-align: start"
                :pt="{ headerContent: 'justify-start' }"
                field="outcomeName"
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
                :hidden="!tableSelectedColumns.includes('outcomeType')"
                style="text-align: start"
                :pt="{ headerContent: 'justify-start' }"
                field="outcomeType"
                header="Outcome Type"
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
                :hidden="!tableSelectedColumns.includes('targetOutcomeType')"
                style="text-align: start"
                :pt="{ headerContent: 'justify-start' }"
                field="targetOutcomeType"
                header="Timing"
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
                :hidden="!tableSelectedColumns.includes('timeToEvent')"
                style="text-align: end"
                :pt="{ headerContent: 'justify-end' }"
                field="timeToEvent"
                header="Days"
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
                :hidden="!tableSelectedColumns.includes('numEvents')"
                style="text-align: end"
                :pt="{ headerContent: 'justify-end' }"
                field="numEvents"
                header="# Events"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">{{
                  formatCensored(data.numEvents)
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
                :hidden="!tableSelectedColumns.includes('timeScale')"
                style="text-align: start"
                :pt="{ headerContent: 'justify-start' }"
                field="timeScale"
                header="Scale"
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
            </DataTable>
          </div></div
      ></Transition>
    </div>

    <div v-else-if="!loading" class="section empty-state">
      Select an outcome, then click Generate.
    </div>

    <ResultsLoader :loader-state="loaderState" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from "vue";
import * as echarts from "echarts";

import ResultsLoader from "./shared/ResultsLoader.vue";
import ViewToggle from "./shared/ViewToggle.vue";
import OutcomeSelector from "./shared/OutcomeSelector.vue";
import ContextBar from "./shared/ContextBar.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import MultiSelect from "primevue/multiselect";
import { colSelectorPt } from "./shared/colSelectorPt";
import GenerateButton from "@/pages/strategus/characterization/shared/GenerateButton.vue";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { useStore } from "vuex";
import { UPDATE_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";

const store = useStore();
const darkMode = computed(() => store.getters.getSettings.darkMode);

const STORAGE_KEY = "char:timeToEvent";

const tableColumnOptions = [
  { label: "Database", key: "databaseName" },
  { label: "Target", key: "targetName" },
  { label: "Outcome", key: "outcomeName" },
  { label: "Outcome Type", key: "outcomeType" },
  { label: "Timing", key: "targetOutcomeType" },
  { label: "Days", key: "timeToEvent" },
  { label: "# Events", key: "numEvents" },
  { label: "Scale", key: "timeScale" },
];
const TTE_DEFAULT_COLUMNS = [
  "databaseName",
  "outcomeName",
  "outcomeType",
  "targetOutcomeType",
  "timeToEvent",
  "numEvents",
];
const tableSelectedColumns = ref(
  store.getters.getSettings.persistColumnSelection &&
    store.getters.getSettings.columnSelection?.[STORAGE_KEY]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY]
    : TTE_DEFAULT_COLUMNS
);
watch(tableSelectedColumns, (val) => {
  store.dispatch(UPDATE_COLUMN_SELECTION, { [STORAGE_KEY]: val });
});

watch(darkMode, () => {
  if (showResults.value) renderChart();
});

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
const allData = ref([]);

const activeResultTab = ref(0);
const resultTabs = [
  { key: "plots", label: "Plots" },
  { key: "table", label: "Table" },
];

const plotDatabases = ref([]);
const plotTimeScales = ref([]);
const plotOutcomeTypes = ref([]);
const plotTargetOutcomeTypes = ref([]);
const lastGeneratedConfig = ref(null);

const chartEl = ref(null);
let chartInstance = null;

const tableFilters = ref({
  databaseName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  targetName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  outcomeName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  outcomeType: { value: null, matchMode: FilterMatchMode.CONTAINS },
  targetOutcomeType: { value: null, matchMode: FilterMatchMode.CONTAINS },
  timeToEvent: { value: null, matchMode: FilterMatchMode.CONTAINS },
  numEvents: { value: null, matchMode: FilterMatchMode.CONTAINS },
  timeScale: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const outcomeOptions = computed(() => props.outcomeTable ?? []);
const targetName = computed(() => props.targetRow?.cohortName ?? "");
const outcomeName = computed(() => selectedOutcome.value?.cohortName ?? "");

const uniqueDatabases = computed(() => [
  ...new Set(allData.value.map((r) => r.databaseName)),
]);
const uniqueTimeScales = computed(() => [
  ...new Set(allData.value.map((r) => r.timeScale)),
]);
const uniqueOutcomeTypes = computed(() => [
  ...new Set(allData.value.map((r) => r.outcomeType)),
]);
const uniqueTargetOutcomeTypes = computed(() => [
  ...new Set(allData.value.map((r) => r.targetOutcomeType)),
]);

const filteredPlotData = computed(() => {
  return allData.value.filter(
    (r) =>
      (plotDatabases.value.length === 0 ||
        plotDatabases.value.includes(r.databaseName)) &&
      (plotTimeScales.value.length === 0 ||
        plotTimeScales.value.includes(r.timeScale)) &&
      (plotOutcomeTypes.value.length === 0 ||
        plotOutcomeTypes.value.includes(r.outcomeType)) &&
      (plotTargetOutcomeTypes.value.length === 0 ||
        plotTargetOutcomeTypes.value.includes(r.targetOutcomeType)) &&
      r.numEvents > 0
  );
});

watch(
  () => props.targetRow,
  () => {
    showResults.value = false;
    allData.value = [];
  }
);

watch(
  [plotDatabases, plotTimeScales, plotOutcomeTypes, plotTargetOutcomeTypes],
  () => {
    if (showResults.value) renderChart();
  }
);

watch(activeResultTab, async () => {
  if (activeResultTab.value === 0 && showResults.value) {
    await renderChart();
  }
});

function formatCensored(val) {
  if (val == null) return "";
  return val < 0 ? `< ${Math.abs(val)}` : val;
}

async function fetchTimeToEventData(targetId, outcomeId) {
  const res = await StrategusService.characterization.getTimeToEvent(
    [targetId],
    [outcomeId]
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
    const data = await fetchTimeToEventData(
      props.targetRow.cohortId,
      selectedOutcome.value.cohortId
    );
    allData.value = data;

    plotDatabases.value = [...uniqueDatabases.value];
    plotTimeScales.value = [...uniqueTimeScales.value];
    plotOutcomeTypes.value = [...uniqueOutcomeTypes.value];
    plotTargetOutcomeTypes.value = [...uniqueTargetOutcomeTypes.value];

    if (Date.now() - loadStart >= 600) {
      loaderState.value = "success";
      await new Promise((r) => setTimeout(r, 1100));
    }
    loaderState.value = "idle";
    await new Promise((r) => setTimeout(r, 220));
    lastGeneratedConfig.value = {
      outcome: selectedOutcome.value.cohortId,
      outcomeName: outcomeName.value,
    };
    showResults.value = true;
    await nextTick();
    renderChart();
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

async function renderChart() {
  await nextTick();
  if (!chartEl.value) return;

  const data = filteredPlotData.value;
  if (!data.length) {
    if (chartInstance) {
      chartInstance.dispose();
      chartInstance = null;
    }
    return;
  }

  const facetKeys = [
    ...new Set(data.map((r) => `${r.timeScale}|${r.databaseName}`)),
  ];
  const fillGroups = [
    ...new Set(data.map((r) => `${r.outcomeType}-${r.targetOutcomeType}`)),
  ];

  const colors = [
    "#4e79a7",
    "#f28e2b",
    "#e15759",
    "#76b7b2",
    "#59a14f",
    "#edc948",
    "#b07aa1",
    "#ff9da7",
    "#9c755f",
    "#bab0ac",
  ];

  const grids = [],
    xAxes = [],
    yAxes = [],
    seriesList = [],
    titles = [];
  const cols = Math.min(facetKeys.length, 3);
  const rowCount = Math.ceil(facetKeys.length / cols);
  const cellW = 100 / cols;
  const cellH = 100 / rowCount;

  for (let fi = 0; fi < facetKeys.length; fi++) {
    const [ts, dbName] = facetKeys[fi].split("|");
    const col = fi % cols;
    const row = Math.floor(fi / cols);

    grids.push({
      left: `${col * cellW + 6}%`,
      top: `${row * cellH + 8}%`,
      width: `${cellW - 10}%`,
      height: `${cellH - 16}%`,
    });
    xAxes.push({
      gridIndex: fi,
      type: "value",
      name: "Days",
      nameLocation: "center",
      nameGap: 25,
    });
    yAxes.push({
      gridIndex: fi,
      type: "value",
      name: "# Events",
      nameLocation: "center",
      nameGap: 35,
    });
    titles.push({
      text: `${dbName} - ${ts}`,
      left: `${col * cellW + cellW / 2 + 1}%`,
      top: `${row * cellH + 1}%`,
      textAlign: "center",
      textStyle: { fontSize: 13, fontWeight: "normal" },
    });

    const facetData = data.filter(
      (r) => r.timeScale === ts && r.databaseName === dbName
    );
    for (let gi = 0; gi < fillGroups.length; gi++) {
      const fg = fillGroups[gi];
      const points = facetData
        .filter((r) => `${r.outcomeType}-${r.targetOutcomeType}` === fg)
        .map((r) => [r.timeToEvent, r.numEvents]);
      seriesList.push({
        name: fg,
        type: "bar",
        xAxisIndex: fi,
        yAxisIndex: fi,
        stack: `stack-${fi}`,
        barWidth: 15,
        data: points,
        itemStyle: { color: colors[gi % colors.length] },
      });
    }
  }

  if (chartInstance) chartInstance.dispose();
  chartInstance = echarts.init(chartEl.value, darkMode.value ? "dark" : null);

  const chartHeight = Math.max(400, rowCount * 300);
  chartEl.value.style.height = `${chartHeight}px`;

  chartInstance.setOption({
    backgroundColor: "transparent",
    title: titles,
    tooltip: {
      trigger: "item",
      formatter: (p) => {
        if (!p.data) return "";
        return `${p.seriesName}<br/>Day ${p.data[0]}: ${p.data[1]} events`;
      },
    },
    legend: { bottom: 0, data: fillGroups },
    grid: grids,
    xAxis: xAxes,
    yAxis: yAxes,
    series: seriesList,
  });

  const ro = new ResizeObserver(() => chartInstance?.resize());
  ro.observe(chartEl.value);
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

.time-to-event {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.plot-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: start;
  margin-bottom: 0.75rem;
}

.plot-filters > div {
  min-width: 160px;
  flex: 1;
}

.tte-chart {
  width: 100%;
  min-height: 400px;
}

.table-controls {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.col-selector {
  min-width: 200px;
  flex: 1 1 400px;
}
</style>
