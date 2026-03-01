<template>
  <div class="incidence-rates">
    <Panel header="Options" toggleable class="options-panel">
      <label class="field-label">Select Outcomes</label>
      <DataTable
        :value="outcomeOptions"
        v-model:selection="selectedOutcomes"
        selectionMode="multiple"
        dataKey="cohortId"
        :paginator="outcomeOptions.length > 10"
        :rows="10"
        filterDisplay="row"
        v-model:filters="outcomeFilters"
        stripedRows
        size="small"
        class="selector-table"
      >
        <Column selectionMode="multiple" headerStyle="width: 3rem" />
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

    <Panel header="Results">
      <TabView v-if="showResults" class="mt-3">
        <TabPanel header="Incidence Rate Table">
          <div class="table-filters">
            <div>
              <label class="field-label">Filter By Database</label>
              <MultiSelect
                v-model="tableDatabases"
                :options="uniqueDatabases"
                placeholder="All"
                filter
                display="chip"
                class="w-full"
              />
            </div>
            <div class="strat-checks">
              <div>
                <Checkbox
                  v-model="includeAge"
                  :binary="true"
                  inputId="ageStrat"
                /><label for="ageStrat">Include age stratified</label>
              </div>
              <div>
                <Checkbox
                  v-model="includeSex"
                  :binary="true"
                  inputId="sexStrat"
                /><label for="sexStrat">Include sex stratified</label>
              </div>
              <div>
                <Checkbox
                  v-model="includeYear"
                  :binary="true"
                  inputId="yearStrat"
                /><label for="yearStrat">Include year stratified</label>
              </div>
            </div>
          </div>

          <DataTable
            v-if="tableRows.length"
            :value="tableRows"
            :paginator="true"
            :rows="25"
            :rowsPerPageOptions="[10, 25, 50, 100]"
            filterDisplay="row"
            v-model:filters="tableFilters"
            sortMode="multiple"
            removableSort
            stripedRows
            size="small"
            class="result-table mt-3"
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
              field="outcomeName"
              header="Outcome"
              sortable
              :showFilterMenu="false"
            >
              <template #filter="{ filterModel, filterCallback }">
                <Dropdown
                  v-model="filterModel.value"
                  :options="uniqueOutcomeNames"
                  placeholder="All"
                  :showClear="true"
                  class="w-full"
                  @change="filterCallback()"
                />
              </template>
            </Column>
            <Column
              field="tar"
              header="Time-at-risk"
              sortable
              :showFilterMenu="false"
            >
              <template #filter="{ filterModel, filterCallback }">
                <Dropdown
                  v-model="filterModel.value"
                  :options="uniqueTars"
                  placeholder="All"
                  :showClear="true"
                  class="w-full"
                  @change="filterCallback()"
                />
              </template>
            </Column>
            <Column field="ageGroupName" header="Age Group" sortable />
            <Column field="genderName" header="Sex" sortable />
            <Column field="startYear" header="Index Year" sortable />
            <Column
              field="cleanWindow"
              header="Clean Window"
              sortable
              :showFilterMenu="false"
            >
              <template #filter="{ filterModel, filterCallback }">
                <Dropdown
                  v-model="filterModel.value"
                  :options="uniqueCleanWindows"
                  placeholder="All"
                  :showClear="true"
                  class="w-full"
                  @change="filterCallback()"
                />
              </template>
            </Column>
            <Column field="personsAtRisk" header="No. Persons" sortable />
            <Column field="personDays" header="Person Days" sortable />
            <Column field="outcomes" header="No. Outcomes" sortable />
            <Column
              field="incidenceProportionP100p"
              header="Inc. Proportion /100p"
              sortable
            >
              <template #body="{ data }">{{
                formatNum(data.incidenceProportionP100p)
              }}</template>
            </Column>
            <Column
              field="incidenceRateP100py"
              header="Inc. Rate /100py"
              sortable
            >
              <template #body="{ data }">{{
                formatNum(data.incidenceRateP100py)
              }}</template>
            </Column>
          </DataTable>
        </TabPanel>
        <Panel class="mt-3" header="Results">
          <TabPanel header="Incidence Rate Plots">
            <div class="plot-filters">
              <div>
                <label class="field-label">Database</label>
                <MultiSelect
                  v-model="plotDatabases"
                  :options="uniqueDatabases"
                  placeholder="All"
                  filter
                  display="chip"
                  class="w-full"
                />
              </div>
              <div>
                <label class="field-label">Outcome</label>
                <MultiSelect
                  v-model="plotOutcomes"
                  :options="uniqueOutcomeNames"
                  placeholder="All"
                  filter
                  display="chip"
                  class="w-full"
                />
              </div>
              <div>
                <label class="field-label">Report Type</label>
                <Dropdown
                  v-model="plotXAxis"
                  :options="['Age', 'Year']"
                  class="w-full"
                />
              </div>
              <div class="strat-checks">
                <div>
                  <Checkbox
                    v-model="plotSexStratify"
                    :binary="true"
                    inputId="plotSex"
                  /><label for="plotSex">Sex stratify</label>
                </div>
                <div>
                  <Checkbox
                    v-model="plotFixedY"
                    :binary="true"
                    inputId="plotFixed"
                  /><label for="plotFixed">Fixed y-scale</label>
                </div>
              </div>
              <Button label="View Plot" @click="renderPlot" size="small" />
            </div>
            <div ref="plotEl" class="inc-chart mt-3"></div>
          </TabPanel>
        </Panel>
      </TabView>

      <p
        v-else-if="(!selectedOutcomes.length || !showResults) && !loading"
        class="empty-hint"
      >
        Select an comparator, then click Generate to view risk factor results.
      </p>
    </Panel>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import * as echarts from "echarts";

import Panel from "primevue/panel";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import MultiSelect from "primevue/multiselect";
import Dropdown from "primevue/dropdown";
import Checkbox from "primevue/checkbox";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
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
const selectedOutcomes = ref([]);
const fullData = ref([]);

const tableDatabases = ref([]);
const includeAge = ref(false);
const includeSex = ref(false);
const includeYear = ref(false);
const tableRows = ref([]);

const plotDatabases = ref([]);
const plotOutcomes = ref([]);
const plotXAxis = ref("Age");
const plotSexStratify = ref(false);
const plotFixedY = ref(true);
const plotEl = ref(null);
let chartInstance = null;

const outcomeFilters = ref({
  parentName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  cohortName: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const tableFilters = ref({
  databaseName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  outcomeName: { value: null, matchMode: FilterMatchMode.EQUALS },
  tar: { value: null, matchMode: FilterMatchMode.EQUALS },
  cleanWindow: { value: null, matchMode: FilterMatchMode.EQUALS },
});

const outcomeOptions = computed(() =>
  (props.outcomeTable ?? []).filter((r) => r.cohortIncidence === 1)
);

const uniqueDatabases = computed(() =>
  [...new Set(fullData.value.map((r) => r.databaseName))].sort()
);
const uniqueOutcomeNames = computed(() =>
  [...new Set(fullData.value.map((r) => r.outcomeName))].sort()
);
const uniqueTars = computed(() => [
  ...new Set(fullData.value.map((r) => r.tar)),
]);
const uniqueCleanWindows = computed(() => [
  ...new Set(fullData.value.map((r) => String(r.cleanWindow))),
]);

watch(
  () => props.targetRow,
  () => {
    showResults.value = false;
    fullData.value = [];
  }
);

//todo: replace with existing shared one
function formatNum(val) {
  if (val == null) return "";
  return Number(val).toFixed(2);
}

async function fetchIncidenceData(targetId, outcomeIds) {
  const res = await StrategusService.characterization.getIncidenceRates(
    [targetId],
    outcomeIds
  );
  return res.data;
}

async function generate() {
  if (!selectedOutcomes.value.length || !props.targetRow) {
    showResults.value = false;
    return;
  }

  loading.value = true;
  try {
    const outcomeIds = selectedOutcomes.value.map((o) => o.cohortId);
    const data = await fetchIncidenceData(props.targetRow.cohortId, outcomeIds);
    fullData.value = data;

    tableDatabases.value = [...uniqueDatabases.value];
    plotDatabases.value = [...uniqueDatabases.value];
    plotOutcomes.value = [...uniqueOutcomeNames.value];

    tableRows.value = [];
    showResults.value = true;
    applyTableFilter();
  } finally {
    loading.value = false;
  }
}

function applyTableFilter() {
  let data = fullData.value;
  if (tableDatabases.value.length) {
    data = data.filter((r) => tableDatabases.value.includes(r.databaseName));
  }
  if (!includeAge.value) data = data.filter((r) => r.ageGroupName === "Any");
  if (!includeSex.value) data = data.filter((r) => r.genderName === "Any");
  if (!includeYear.value) data = data.filter((r) => r.startYear === "Any");
  tableRows.value = data;
}

watch([tableDatabases, includeAge, includeSex, includeYear], () => {
  if (showResults.value) applyTableFilter();
});

//todo: replace with internal one, will need to think how to adjust hight
async function renderPlot() {
  await nextTick();
  if (!plotEl.value) return;

  let data = fullData.value;
  const xField = plotXAxis.value === "Age" ? "ageGroupName" : "startYear";

  if (plotXAxis.value === "Age") {
    data = data.filter(
      (r) => r.ageGroupName !== "Any" && r.startYear === "Any"
    );
  } else {
    data = data.filter(
      (r) => r.ageGroupName === "Any" && r.startYear !== "Any"
    );
  }

  if (!plotSexStratify.value) {
    data = data.filter((r) => r.genderName === "Any");
  } else {
    data = data.filter((r) => r.genderName !== "Any");
  }

  if (plotDatabases.value.length)
    data = data.filter((r) => plotDatabases.value.includes(r.databaseName));
  if (plotOutcomes.value.length)
    data = data.filter((r) => plotOutcomes.value.includes(r.outcomeName));

  if (!data.length) {
    if (chartInstance) {
      chartInstance.dispose();
      chartInstance = null;
    }
    return;
  }

  const facetCol = [
    ...new Set(
      data.map((r) => `${r.outcomeName} (clean win ${r.cleanWindow}): ${r.tar}`)
    ),
  ];
  const facetRow = [...new Set(data.map((r) => r.databaseName))];
  const xCategories = [...new Set(data.map((r) => r[xField]))];
  const colorField = plotSexStratify.value ? "genderName" : "databaseName";
  const colorValues = [...new Set(data.map((r) => r[colorField]))];
  const colors = [
    "#4e79a7",
    "#f28e2b",
    "#e15759",
    "#76b7b2",
    "#59a14f",
    "#edc948",
    "#b07aa1",
    "#ff9da7",
  ];

  const cols = facetCol.length;
  const rows = facetRow.length;
  const cellW = 100 / Math.max(cols, 1);
  const cellH = 100 / Math.max(rows, 1);

  const grids = [],
    xAxes = [],
    yAxes = [],
    titles = [],
    seriesList = [];
  let gi = 0;

  const globalMax = Math.max(...data.map((r) => r.incidenceRateP100py), 1);

  for (let ri = 0; ri < rows; ri++) {
    for (let ci = 0; ci < cols; ci++) {
      const dbName = facetRow[ri];
      const facetLabel = facetCol[ci];

      grids.push({
        left: `${ci * cellW + 8}%`,
        top: `${ri * cellH + 8}%`,
        width: `${cellW - 12}%`,
        height: `${cellH - 18}%`,
      });

      xAxes.push({
        gridIndex: gi,
        type: "category",
        data: xCategories,
        axisLabel: { rotate: 30, fontSize: 10 },
      });
      yAxes.push({
        gridIndex: gi,
        type: "value",
        name: ri === 0 && ci === 0 ? "Rate /100py" : "",
        max: plotFixedY.value ? Math.ceil(globalMax * 1.1) : undefined,
      });

      titles.push({
        text: ri === 0 ? facetLabel : "",
        subtext: ci === 0 ? dbName : "",
        left: `${ci * cellW + cellW / 2 + 2}%`,
        top: `${ri * cellH}%`,
        textAlign: "center",
        textStyle: { fontSize: 11, fontWeight: "normal" },
        subtextStyle: { fontSize: 11, fontWeight: "bold" },
      });

      const facetData = data.filter(
        (r) =>
          r.databaseName === dbName &&
          `${r.outcomeName} (clean win ${r.cleanWindow}): ${r.tar}` ===
            facetLabel
      );

      for (let vi = 0; vi < colorValues.length; vi++) {
        const cv = colorValues[vi];
        const points = xCategories.map((x) => {
          const row = facetData.find(
            (r) => r[xField] === x && r[colorField] === cv
          );
          return row?.incidenceRateP100py ?? null;
        });

        seriesList.push({
          name: cv,
          type: "line",
          xAxisIndex: gi,
          yAxisIndex: gi,
          data: points,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { color: colors[vi % colors.length] },
          itemStyle: { color: colors[vi % colors.length] },
        });
      }
      gi++;
    }
  }

  if (chartInstance) chartInstance.dispose();
  chartInstance = echarts.init(plotEl.value);

  const chartHeight = Math.max(400, rows * 280);
  plotEl.value.style.height = `${chartHeight}px`;

  chartInstance.setOption({
    title: [
      {
        text: "Incidence Rates",
        left: "center",
        top: 0,
        textStyle: { fontSize: 14 },
      },
      ...titles,
    ],
    tooltip: {
      trigger: "item",
      formatter: (p) =>
        p.data != null ? `${p.seriesName}: ${p.data.toFixed(2)} /100py` : "",
    },
    legend: { bottom: 0, data: colorValues },
    grid: grids,
    xAxis: xAxes,
    yAxis: yAxes,
    series: seriesList,
  });

  const ro = new ResizeObserver(() => chartInstance?.resize());
  ro.observe(plotEl.value);
}
</script>

<style scoped>
.incidence-rates {
  padding: 1rem;
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
.result-table {
  font-size: 0.8125rem;
}
.table-filters {
  display: flex;
  gap: 1.5rem;
  align-items: end;
  flex-wrap: wrap;
}
.table-filters > div:first-child {
  min-width: 250px;
}
.plot-filters {
  display: flex;
  gap: 1rem;
  align-items: end;
  flex-wrap: wrap;
}
.plot-filters > div {
  min-width: 160px;
  flex: 1;
}
.strat-checks {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}
.strat-checks > div {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
}
.inc-chart {
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
