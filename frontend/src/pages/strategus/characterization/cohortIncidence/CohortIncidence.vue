<template>
  <div class="incidence-rates">
    <div class="section">
      <label class="field-label">Outcomes</label>
      <OutcomeSelector
        v-model="selectedOutcomes"
        :options="outcomeOptions"
        :multiple="true"
      />

      <GenerateButton :disabled="generateDisabled" @click="generate" />
    </div>

    <ContextBar
      v-if="showResults"
      :items="[targetName, lastGeneratedConfig.outcomeNames]"
    />

    <div v-if="showResults" class="section results-body">
      <ViewToggle v-model="activeResultTab" :tabs="resultTabs" />

      <Transition name="tab-fade" mode="out-in"
        ><div :key="activeResultTab">
          <div v-if="activeResultTab === 0">
            <div class="table-filters">
              <div>
                <label class="field-label">Database</label>
                <MultiSelect
                  v-model="tableDatabases"
                  :options="uniqueDatabases"
                  placeholder="All"
                  filter
                  :pt="colSelectorPt"
                  display="chip"
                  class="w-full"
                />
              </div>
              <div class="col-selector">
                <label class="field-label">Columns</label>
                <ColumnSelector v-model="selectedColumns" :options="columnOptions" />
              </div>
              <div class="strat-checks">
                <div>
                  <Checkbox
                    v-model="includeAge"
                    :binary="true"
                    inputId="ageStrat"
                  /><label for="ageStrat">Age stratified</label>
                </div>
                <div>
                  <Checkbox
                    v-model="includeSex"
                    :binary="true"
                    inputId="sexStrat"
                  /><label for="sexStrat">Sex stratified</label>
                </div>
                <div>
                  <Checkbox
                    v-model="includeYear"
                    :binary="true"
                    inputId="yearStrat"
                  /><label for="yearStrat">Year stratified</label>
                </div>
              </div>
              <Button
                :icon="showFilters ? 'pi pi-filter-slash' : 'pi pi-filter'"
                :severity="showFilters ? 'primary' : 'secondary'"
                text
                rounded
                class="filter-toggle-btn"
                :title="showFilters ? 'Hide filters' : 'Show filters'"
                @click="showFilters = !showFilters"
              />
            </div>

            <DataTable
              v-if="tableRows.length"
              :value="tableRows"
              :paginator="true"
              :rows="25"
              :rowsPerPageOptions="[10, 25, 50, 100]"
              :filterDisplay="showFilters ? 'row' : undefined"
              v-model:filters="tableFilters"
              sortMode="multiple"
              removableSort
              :striped-rows="store.getters.getSettings.strippedRows"
              size="small"
              class="result-table mt-3"
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
                :hidden="!selectedColumns.includes('outcomeName')"
                style="text-align: start"
                :pt="{ headerContent: 'justify-start' }"
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
                :hidden="!selectedColumns.includes('tar')"
                style="text-align: start"
                :pt="{ headerContent: 'justify-start' }"
                field="tar"
                header="TAR"
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
              <Column
                :hidden="!selectedColumns.includes('ageGroupName')"
                style="text-align: start"
                :pt="{ headerContent: 'justify-start' }"
                field="ageGroupName"
                header="Age"
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
                :hidden="!selectedColumns.includes('genderName')"
                style="text-align: start"
                :pt="{ headerContent: 'justify-start' }"
                field="genderName"
                header="Sex"
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
                :hidden="!selectedColumns.includes('startYear')"
                style="text-align: end"
                :pt="{ headerContent: 'justify-end' }"
                field="startYear"
                header="Year"
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
                :hidden="!selectedColumns.includes('cleanWindow')"
                style="text-align: end"
                :pt="{ headerContent: 'justify-end' }"
                field="cleanWindow"
                header="Clean Win."
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
              <Column
                :hidden="!selectedColumns.includes('personsAtRisk')"
                style="text-align: end"
                :pt="{ headerContent: 'justify-end' }"
                field="personsAtRisk"
                header="Persons"
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
                :hidden="!selectedColumns.includes('personDays')"
                style="text-align: end"
                :pt="{ headerContent: 'justify-end' }"
                field="personDays"
                header="Person Days"
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
                :hidden="!selectedColumns.includes('outcomes')"
                style="text-align: end"
                :pt="{ headerContent: 'justify-end' }"
                field="outcomes"
                header="Outcomes"
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
                :hidden="!selectedColumns.includes('incidenceProportionP100p')"
                style="text-align: end"
                :pt="{ headerContent: 'justify-end' }"
                field="incidenceProportionP100p"
                header="Prop. /100p"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">{{
                  formatNum(data.incidenceProportionP100p)
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
                :hidden="!selectedColumns.includes('incidenceRateP100py')"
                style="text-align: end"
                :pt="{ headerContent: 'justify-end' }"
                field="incidenceRateP100py"
                header="Rate /100py"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">{{
                  formatNum(data.incidenceRateP100py)
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
            </DataTable>
          </div>

          <div v-else-if="activeResultTab === 1">
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
                <label class="field-label">X-Axis</label>
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
              <div class="plot-action">
                <Button label="View Plot" @click="renderPlot" size="small" />
              </div>
            </div>
            <div ref="plotEl" class="inc-chart"></div>
          </div></div
      ></Transition>
    </div>

    <div v-else-if="!loading" class="section empty-state">
      Select one or more outcomes, then click Generate.
    </div>

    <ResultsLoader :loader-state="loaderState" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from "vue";
import * as echarts from "echarts";

import ResultsLoader from "../shared/resultsLoader";
import ViewToggle from "../shared/viewToggle";
import OutcomeSelector from "../shared/outcomeSelector";
import ContextBar from "../shared/contextBar";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import MultiSelect from "primevue/multiselect";
import ColumnSelector from "@/shared/ui/columnSelector";
import { colSelectorPt } from "../shared/colSelectorPt";
import Dropdown from "primevue/dropdown";
import Checkbox from "primevue/checkbox";
import Button from "primevue/button";
import GenerateButton from "@/pages/strategus/characterization/shared/generateButton";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { formatNum } from "@/shared/lib/formatters";
import { useStore } from "vuex";
import { UPDATE_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";

const store = useStore();
const darkMode = computed(() => store.getters.getSettings.darkMode);

const STORAGE_KEY = "char:cohortIncidence";

const columnOptions = [
  { label: "Database", key: "databaseName" },
  { label: "Outcome", key: "outcomeName" },
  { label: "TAR", key: "tar" },
  { label: "Age", key: "ageGroupName" },
  { label: "Sex", key: "genderName" },
  { label: "Year", key: "startYear" },
  { label: "Clean Win.", key: "cleanWindow" },
  { label: "Persons at Risk", key: "personsAtRisk" },
  { label: "Person Days", key: "personDays" },
  { label: "Outcomes", key: "outcomes" },
  { label: "Prop. /100p", key: "incidenceProportionP100p" },
  { label: "Rate /100py", key: "incidenceRateP100py" },
];
const CI_DEFAULT_COLUMNS = [
  "databaseName",
  "outcomeName",
  "tar",
  "personsAtRisk",
  "outcomes",
  "incidenceProportionP100p",
  "incidenceRateP100py",
];
const selectedColumns = ref(
  store.getters.getSettings.columnSelection?.[STORAGE_KEY]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY]
    : CI_DEFAULT_COLUMNS
);
watch(selectedColumns, (val) => {
  store.dispatch(UPDATE_COLUMN_SELECTION, { [STORAGE_KEY]: val });
});

watch(darkMode, () => {
  if (showResults.value && activeResultTab.value === 1) renderPlot();
});

const props = defineProps({
  targetRow: { type: Object },
  outcomeTable: { type: Array },
  initialUrlState: { type: Object, default: null },
});

const emit = defineEmits(["state-change"]);

const loading = ref(false);
const showResults = ref(false);
const showFilters = ref(false);
const loaderState = ref("idle");
const selectedOutcomes = ref([]);
const fullData = ref([]);
const lastGeneratedConfig = ref(null);

const activeResultTab = ref(0);
const resultTabs = [
  { key: "table", label: "Table" },
  { key: "plots", label: "Plots" },
];

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

const tableFilters = ref({
  databaseName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  outcomeName: { value: null, matchMode: FilterMatchMode.EQUALS },
  tar: { value: null, matchMode: FilterMatchMode.EQUALS },
  ageGroupName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  genderName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  startYear: { value: null, matchMode: FilterMatchMode.CONTAINS },
  cleanWindow: { value: null, matchMode: FilterMatchMode.EQUALS },
  personsAtRisk: { value: null, matchMode: FilterMatchMode.CONTAINS },
  personDays: { value: null, matchMode: FilterMatchMode.CONTAINS },
  outcomes: { value: null, matchMode: FilterMatchMode.CONTAINS },
  incidenceProportionP100p: {
    value: null,
    matchMode: FilterMatchMode.CONTAINS,
  },
  incidenceRateP100py: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const outcomeOptions = computed(() =>
  (props.outcomeTable ?? []).filter((r) => r.cohortIncidence === 1)
);
const targetName = computed(() => props.targetRow?.cohortName ?? "");

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

  showResults.value = false;
  loading.value = true;
  loaderState.value = "loading";
  const loadStart = Date.now();
  try {
    const outcomeIds = selectedOutcomes.value.map((o) => o.cohortId);
    const data = await fetchIncidenceData(props.targetRow.cohortId, outcomeIds);
    fullData.value = data;

    tableDatabases.value = [...uniqueDatabases.value];
    plotDatabases.value = [...uniqueDatabases.value];
    plotOutcomes.value = [...uniqueOutcomeNames.value];

    tableRows.value = [];
    if (Date.now() - loadStart >= 600) {
      loaderState.value = "success";
      await new Promise((r) => setTimeout(r, 1100));
    }
    loaderState.value = "idle";
    await new Promise((r) => setTimeout(r, 220));
    showResults.value = true;
    applyTableFilter();

    lastGeneratedConfig.value = {
      selectedOutcomes: selectedOutcomes.value,
      outcomeNames: selectedOutcomes.value.map((o) => o.cohortName).join(", "),
    };
    emit("state-change", {
      outcomeIds: selectedOutcomes.value.map((o) => o.cohortId),
      ctxItems: [selectedOutcomes.value.map((o) => o.cohortName).join(", ")],
    });
  } catch {
    loaderState.value = "error";
  } finally {
    loading.value = false;
  }
}

function applyTableFilter() {
  let data = fullData.value;
  if (tableDatabases.value.length)
    data = data.filter((r) => tableDatabases.value.includes(r.databaseName));
  if (!includeAge.value) data = data.filter((r) => r.ageGroupName === "Any");
  if (!includeSex.value) data = data.filter((r) => r.genderName === "Any");
  if (!includeYear.value) data = data.filter((r) => r.startYear === "Any");
  tableRows.value = data;
}

watch([tableDatabases, includeAge, includeSex, includeYear], () => {
  if (showResults.value) applyTableFilter();
});

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

  if (!plotSexStratify.value) data = data.filter((r) => r.genderName === "Any");
  else data = data.filter((r) => r.genderName !== "Any");

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
  chartInstance = echarts.init(plotEl.value, darkMode.value ? "dark" : null);

  const chartHeight = Math.max(400, rows * 280);
  plotEl.value.style.height = `${chartHeight}px`;

  chartInstance.setOption({
    backgroundColor: "transparent",
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

const generateDisabled = computed(() => {
  if (!selectedOutcomes.value.length) return true;
  if (!lastGeneratedConfig.value) return false;
  return selectedOutcomes.value.every((id) =>
    lastGeneratedConfig.value.selectedOutcomes.includes(id)
  );
});

onMounted(async () => {
  const url = props.initialUrlState;
  if (url?.outcomeIds?.length && outcomeOptions.value.length) {
    const matches = outcomeOptions.value.filter((o) =>
      url.outcomeIds.includes(o.cohortId)
    );
    if (matches.length) selectedOutcomes.value = matches;
  }
  await nextTick();
  if (selectedOutcomes.value.length) {
    await generate();
    applyTableFilter();
  }
});
</script>

<style scoped>
@import "../shared/styles.css";

.incidence-rates {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.table-filters {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.table-filters > div:first-child {
  min-width: 250px;
}

.col-selector {
  min-width: 200px;
  flex: 1 1 400px;
}

.filter-toggle-btn {
  flex-shrink: 0;
  margin-bottom: 2px;
  width: 2.25rem;
  height: 2.25rem;
  font-size: 1rem;
}

:deep(.p-sortable-column-icon) {
  opacity: 0.15;
  transition: opacity 0.15s;
}
:deep(.p-sortable-column:hover .p-sortable-column-icon),
:deep(.p-highlight .p-sortable-column-icon) {
  opacity: 1;
}

.plot-filters {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.plot-filters > div {
  min-width: 150px;
  flex: 1;
}

.plot-action {
  flex: none;
  padding-bottom: 1px;
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
  font-size: 0.8125rem;
}

.inc-chart {
  width: 100%;
  min-height: 400px;
}

.mt-3 {
  margin-top: 0.75rem;
}
</style>
