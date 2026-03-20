<template>
  <div class="time-to-event">
    <Message :closable="false" severity="info">
      <p>
        View the timing of all outcomes relative to the target index date and
        whether the outcome was the first or subsequent.
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
        :striped-rows="store.getters.getSettings.strippedRows"
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
        :disabled="generateDisabled"
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
    <Panel class="mt-3" header="Results">
      <TabView v-if="showResults" class="mt-3">
        <TabPanel header="Time-to-event Plots">
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
              <label class="field-label">Outcome occurrence type</label>
              <MultiSelect
                v-model="plotOutcomeTypes"
                :options="uniqueOutcomeTypes"
                placeholder="All"
                class="w-full"
              />
            </div>
            <div>
              <label class="field-label">Timing of outcome</label>
              <MultiSelect
                v-model="plotTargetOutcomeTypes"
                :options="uniqueTargetOutcomeTypes"
                placeholder="All"
                class="w-full"
              />
            </div>
          </div>
          <div ref="chartEl" class="tte-chart mt-3"></div>
        </TabPanel>

        <TabPanel header="Time-to-event Table">
          <DataTable
            :value="allData"
            :paginator="true"
            :rows="25"
            :rowsPerPageOptions="[10, 25, 50, 100]"
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
              field="targetName"
              header="Target Name"
              sortable
              style="min-width: 200px"
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
              field="outcomeName"
              header="Outcome Name"
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
              field="targetOutcomeType"
              header="Target-Outcome Type"
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
              field="timeToEvent"
              header="Time (days) To Event"
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
              field="numEvents"
              header="# of Events"
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
              field="timeScale"
              header="Time Scale"
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
        </TabPanel>
      </TabView>
      <p
        v-else-if="(!selectedOutcome || !showResults) && !loading"
        class="empty-hint"
      >
        Select an outcome, then click Generate to view risk factor results.
      </p>
    </Panel>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from "vue";
import * as echarts from "echarts";

import Panel from "primevue/panel";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import MultiSelect from "primevue/multiselect";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import Message from "primevue/message";
import { useStore } from "vuex";

const store = useStore();

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
const allData = ref([]);

const plotDatabases = ref([]);
const plotTimeScales = ref([]);
const plotOutcomeTypes = ref([]);
const plotTargetOutcomeTypes = ref([]);
const lastGeneratedConfig = ref(null);

const chartEl = ref(null);
let chartInstance = null;

const outcomeFilters = ref({
  parentName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  cohortName: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
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

//todo: replace with shared
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

  loading.value = true;
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

    showResults.value = true;
    await nextTick();
    renderChart();
    lastGeneratedConfig.value = {
      outcome: selectedOutcome.value.cohortId,
    };
  } finally {
    loading.value = false;
  }
}
//todo: replace with shared component
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

  const grids = [];
  const xAxes = [];
  const yAxes = [];
  const seriesList = [];
  const titles = [];

  const cols = Math.min(facetKeys.length, 3);
  const rowCount = Math.ceil(facetKeys.length / cols);
  const cellW = 100 / cols;
  const cellH = 100 / rowCount;

  for (let fi = 0; fi < facetKeys.length; fi++) {
    const [ts, dbName] = facetKeys[fi].split("|");
    const col = fi % cols;
    const row = Math.floor(fi / cols);

    const barWidth = 15;

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
      text: `${dbName} — ${ts}`,
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
        barWidth,
        data: points,
        itemStyle: { color: colors[gi % colors.length] },
      });
    }
  }

  if (chartInstance) chartInstance.dispose();
  chartInstance = echarts.init(chartEl.value);

  const chartHeight = Math.max(400, rowCount * 300);
  chartEl.value.style.height = `${chartHeight}px`;

  chartInstance.setOption({
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
</script>

<style scoped>
.time-to-event {
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
.plot-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: start;
}
.plot-filters > div {
  min-width: 180px;
  flex: 1;
}
.tte-chart {
  width: 100%;
  min-height: 400px;
}
.w-full {
  width: 100%;
}

.empty-hint {
  text-align: center;
  color: #999;
  padding: 2rem 0;
}
</style>
