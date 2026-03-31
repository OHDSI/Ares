<template>
  <div class="cohort-comparison">
    <div class="section">
      <label class="field-label">Comparator</label>
      <OutcomeSelector
        v-model="selectedComparator"
        :options="comparatorOptions"
      />

      <div class="controls-row">
        <div>
          <label class="field-label">Database</label>
          <Dropdown
            v-model="selectedDatabase"
            :options="availableDatabases"
            optionLabel="name"
            optionValue="id"
            placeholder="Select database"
            class="w-full"
          />
        </div>
        <div class="control-action">
          <Button
            :disabled="generateDisabled"
            label="Generate"
            @click="generate"
          />
        </div>
      </div>
    </div>

    <ContextBar
      v-if="showResults"
      :items="[targetName, `vs ${comparatorName}`, selectedDatabaseName]"
    />

    <div v-if="showResults" class="section results-body">
      <ViewToggle v-model="activeResultTab" :tabs="resultTabs" />

      <Transition name="tab-fade" mode="out-in"
        ><div :key="activeResultTab">
          <div v-if="activeResultTab === 0">
            <p class="table-note" v-if="covRef.length">
              Fraction of patients ({{ covRef[0]?.minPriorObservation }}d prior
              obs.) with each binary feature.
            </p>
            <DataTable
              :value="filteredBinaryRows"
              :paginator="true"
              :rows="25"
              :rowsPerPageOptions="[10, 25, 50, 100]"
              filterDisplay="row"
              v-model:filters="binaryFilters"
              sortMode="multiple"
              removableSort
              :striped-rows="store.getters.getSettings.strippedRows"
              size="small"
              class="result-table"
            >
              <ColumnGroup type="header">
                <Row>
                  <Column header="Covariate" :rowspan="2" />
                  <Column header="ID" :rowspan="2" />
                  <Column
                    v-for="ref in covRef"
                    :key="'bhdr-' + ref.id"
                    :header="columnGroupLabel(ref)"
                    :colspan="2"
                  />

                  <Column
                    v-if="covRef.length === 2"
                    header="SMD"
                    :rowspan="2"
                    sortField="SMD"
                    sortable
                  />
                  <Column
                    v-if="covRef.length === 2"
                    header="|SMD|"
                    :rowspan="2"
                    sortField="absSMD"
                    sortable
                  />
                </Row>
                <Row>
                  <template v-for="ref in covRef" :key="'bsub-' + ref.id">
                    <Column header="Count" />
                    <Column header="%" />
                  </template>
                </Row>
              </ColumnGroup>

              <Column field="covariateName" :showFilterMenu="false">
                <template #filter="{ filterModel, filterCallback }">
                  <InputText
                    v-model="filterModel.value"
                    @input="filterCallback()"
                    placeholder="Search..."
                    size="small"
                  />
                </template>
              </Column>
              <Column field="covariateId" />
              <template v-for="ref in covRef" :key="'bcol-' + ref.id">
                <Column :field="'sumValue_' + ref.id">
                  <template #body="{ data }">{{
                    formatCount(data["sumValue_" + ref.id])
                  }}</template>
                </Column>
                <Column :field="'averageValue_' + ref.id" sortable>
                  <template #body="{ data }">{{
                    formatPercent(data["averageValue_" + ref.id])
                  }}</template>
                </Column>
              </template>
              <Column v-if="covRef.length === 2" field="SMD" sortable>
                <template #body="{ data }">{{ formatSmd(data.SMD) }}</template>
              </Column>
              <Column
                v-if="covRef.length === 2"
                field="absSMD"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">{{
                  formatSmd(data.absSMD)
                }}</template>
                <template #filter="{}">
                  <div class="smd-filter">
                    <Slider
                      v-model="binaryAbsSmdMin"
                      :min="0"
                      :max="smdMax"
                      :step="0.01"
                      class="smd-slider"
                    />
                    <span class="smd-val"
                      >≥ {{ binaryAbsSmdMin.toFixed(2) }}</span
                    >
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
          <div v-if="activeResultTab === 1">
            <div v-if="covRef.length === 2" class="scatter-container">
              <div ref="scatterEl" class="scatter-chart"></div>
            </div>
            <p v-else class="table-note">
              Need exactly 2 cohorts with data to plot.
            </p>
          </div>
          <div v-if="activeResultTab === 2">
            <p class="table-note" v-if="covRef.length">
              Continuous feature distributions ({{
                covRef[0]?.minPriorObservation
              }}d prior obs.) across cohorts.
            </p>
            <DataTable
              :value="filteredContinuousRows"
              :paginator="true"
              :rows="25"
              :rowsPerPageOptions="[10, 25, 50, 100]"
              filterDisplay="row"
              v-model:filters="continuousFilters"
              sortMode="multiple"
              removableSort
              :striped-rows="store.getters.getSettings.strippedRows"
              size="small"
              class="result-table"
            >
              <ColumnGroup type="header">
                <Row>
                  <Column header="Covariate" :rowspan="2" />
                  <Column header="ID" :rowspan="2" />
                  <Column
                    v-for="ref in covRef"
                    :key="'chdr-' + ref.id"
                    :header="columnGroupLabel(ref)"
                    :colspan="6"
                  />
                  <Column
                    v-if="covRef.length === 2"
                    header="SMD"
                    :rowspan="2"
                    sortField="SMD"
                    sortable
                  />
                  <Column
                    v-if="covRef.length === 2"
                    header="|SMD|"
                    :rowspan="2"
                    sortField="absSMD"
                    sortable
                  />
                </Row>
                <Row>
                  <template v-for="ref in covRef" :key="'csub-' + ref.id">
                    <Column header="Count" />
                    <Column header="Mean" />
                    <Column header="StDev" />
                    <Column header="Median" />
                    <Column header="Min" />
                    <Column header="Max" />
                  </template>
                </Row>
              </ColumnGroup>

              <Column field="covariateName" :showFilterMenu="false">
                <template #filter="{ filterModel, filterCallback }">
                  <InputText
                    v-model="filterModel.value"
                    @input="filterCallback()"
                    placeholder="Search..."
                    size="small"
                  />
                </template>
              </Column>
              <Column field="covariateId" />
              <template v-for="ref in covRef" :key="'ccol-' + ref.id">
                <Column :field="'countValue_' + ref.id">
                  <template #body="{ data }">{{
                    formatCount(data["countValue_" + ref.id])
                  }}</template>
                </Column>
                <Column :field="'averageValue_' + ref.id">
                  <template #body="{ data }">{{
                    formatNum(data["averageValue_" + ref.id])
                  }}</template>
                </Column>
                <Column :field="'standardDeviation_' + ref.id">
                  <template #body="{ data }">{{
                    formatNum(data["standardDeviation_" + ref.id])
                  }}</template>
                </Column>
                <Column :field="'medianValue_' + ref.id">
                  <template #body="{ data }">{{
                    formatNum(data["medianValue_" + ref.id])
                  }}</template>
                </Column>
                <Column :field="'minValue_' + ref.id">
                  <template #body="{ data }">{{
                    formatNum(data["minValue_" + ref.id])
                  }}</template>
                </Column>
                <Column :field="'maxValue_' + ref.id">
                  <template #body="{ data }">{{
                    formatNum(data["maxValue_" + ref.id])
                  }}</template>
                </Column>
              </template>
              <Column v-if="covRef.length === 2" field="SMD" sortable>
                <template #body="{ data }">{{ formatSmd(data.SMD) }}</template>
              </Column>
              <Column
                v-if="covRef.length === 2"
                field="absSMD"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">{{
                  formatSmd(data.absSMD)
                }}</template>
                <template #filter="{}">
                  <div class="smd-filter">
                    <Slider
                      v-model="continuousAbsSmdMin"
                      :min="0"
                      :max="smdMax"
                      :step="0.01"
                      class="smd-slider"
                    />
                    <span class="smd-val"
                      >≥ {{ continuousAbsSmdMin.toFixed(2) }}</span
                    >
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </div></Transition
      >
    </div>

    <div v-else-if="!loading" class="section empty-state">
      Select a comparator and database, then click Generate.
    </div>

    <ResultsLoader :loader-state="loaderState" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, toRef } from "vue";
import * as echarts from "echarts";

import ResultsLoader from "./shared/ResultsLoader.vue";
import ViewToggle from "./shared/ViewToggle.vue";
import OutcomeSelector from "./shared/OutcomeSelector.vue";
import ContextBar from "./shared/ContextBar.vue";
import { useAvailableDatabases } from "./shared/useAvailableDatabases";
import { formatPercent, formatCount, formatSmd } from "./shared/formatters";
import { classifyDomain, domainColors } from "./shared/domainColors";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import Dropdown from "primevue/dropdown";
import Slider from "primevue/slider";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";

import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { useStore } from "vuex";

const store = useStore();

const props = defineProps({
  targetRow: { type: Object },
  targetTable: { type: Array },
  initialUrlState: { type: Object, default: null },
});

const emit = defineEmits(["state-change"]);

const loading = ref(false);
const showResults = ref(false);
const loaderState = ref("idle");
const lastGeneratedConfig = ref(null);

const activeResultTab = ref(0);
const resultTabs = [
  { key: "binary", label: "Binary Table" },
  { key: "plot", label: "Binary Plot" },
  { key: "continuous", label: "Continuous Table" },
];

const selectedComparator = ref(null);
const selectedDatabase = ref(null);

const binaryRows = ref([]);
const continuousRows = ref([]);
const covRef = ref([]);

const binaryAbsSmdMin = ref(0);
const continuousAbsSmdMin = ref(0);
const smdMax = ref(2);

const filteredBinaryRows = computed(() => {
  if (binaryAbsSmdMin.value <= 0) return binaryRows.value;
  return binaryRows.value.filter(
    (r) => (r.absSMD ?? 0) >= binaryAbsSmdMin.value
  );
});

const filteredContinuousRows = computed(() => {
  if (continuousAbsSmdMin.value <= 0) return continuousRows.value;
  return continuousRows.value.filter(
    (r) => (r.absSMD ?? 0) >= continuousAbsSmdMin.value
  );
});

const scatterEl = ref(null);
let chartInstance = null;

const binaryFilters = ref({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const continuousFilters = ref({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const availableDatabases = useAvailableDatabases(toRef(props, "targetRow"));

const comparatorOptions = computed(() =>
  (props.targetTable ?? []).filter(
    (r) => r.cohortComparator === 1 && r.cohortId !== props.targetRow?.cohortId
  )
);

const targetName = computed(() => props.targetRow?.cohortName ?? "");
const comparatorName = computed(
  () => selectedComparator.value?.cohortName ?? ""
);
const selectedDatabaseName = computed(
  () =>
    availableDatabases.value.find((d) => d.id === selectedDatabase.value)
      ?.name ?? ""
);

function columnGroupLabel(ref) {
  const role =
    ref.cohortId === props.targetRow?.cohortId ? "Target" : "Comparator";
  return `${role} (${ref.minPriorObservation}d prior, N=${ref.n})`;
}

watch(
  () => props.targetRow,
  () => {
    showResults.value = false;
    binaryRows.value = [];
    continuousRows.value = [];
    covRef.value = [];
    selectedComparator.value = null;
  }
);

watch(activeResultTab, () => {
  if (activeResultTab.value === 1) {
    renderScatterPlot();
  }
});

function formatNum(val) {
  if (val == null) return "";
  return val >= 0 ? val.toFixed(3) : `< ${Math.abs(val).toFixed(3)}`;
}

async function fetchBinaryData(targetIds, databaseId) {
  const res = await StrategusService.characterization.getCohortBinary(
    targetIds,
    [databaseId]
  );
  return res.data;
}

async function fetchContinuousData(targetIds, databaseId) {
  const res = await StrategusService.characterization.getCohortContinuous(
    targetIds,
    [databaseId]
  );
  return res.data;
}

async function generate() {
  if (
    !selectedComparator.value ||
    !selectedDatabase.value ||
    !props.targetRow
  ) {
    showResults.value = false;
    return;
  }

  showResults.value = false;
  loading.value = true;
  loaderState.value = "loading";
  const loadStart = Date.now();
  try {
    const targetIds = [
      props.targetRow.cohortId,
      selectedComparator.value.cohortId,
    ];
    const dbId = selectedDatabase.value;

    const binaryResult = await fetchBinaryData(targetIds, dbId);

    if (!binaryResult.covRef?.length || binaryResult.covRef.length < 2) {
      showResults.value = false;
      loaderState.value = "idle";
      return;
    }

    covRef.value = binaryResult.covRef;
    binaryRows.value = binaryResult.covariates;

    const continuousResult = await fetchContinuousData(targetIds, dbId);
    continuousRows.value = continuousResult.covariates ?? [];

    if (Date.now() - loadStart >= 600) {
      loaderState.value = "success";
      await new Promise((r) => setTimeout(r, 1100));
    }
    loaderState.value = "idle";
    await new Promise((r) => setTimeout(r, 220));
    showResults.value = true;

    emit("state-change", {
      comparatorId: selectedComparator.value.cohortId,
      databaseId: selectedDatabase.value,
    });

    binaryAbsSmdMin.value = 0;
    continuousAbsSmdMin.value = 0;

    await nextTick();
    renderScatterPlot();
    lastGeneratedConfig.value = {
      database: selectedDatabaseName.value,
      comparator: comparatorName.value,
    };
  } catch {
    loaderState.value = "error";
  } finally {
    loading.value = false;
  }
}

async function renderScatterPlot() {
  if (covRef.value.length < 2) return;
  await nextTick();
  if (!scatterEl.value) return;

  const domainMap = {};
  for (const row of binaryRows.value) {
    const x = Math.max(row.averageValue_1 ?? 0, 0);
    const y = Math.max(row.averageValue_2 ?? 0, 0);
    const domain = classifyDomain(row.covariateName);
    if (!domainMap[domain]) domainMap[domain] = [];
    domainMap[domain].push([x, y, row.covariateName]);
  }

  const series = Object.entries(domainMap).map(([domain, points]) => ({
    name: domain,
    type: "scatter",
    data: points,
    symbolSize: 8,
    itemStyle: { color: domainColors[domain] ?? "#999" },
  }));

  series.push({
    name: "x = y",
    type: "line",
    data: [
      [0, 0],
      [1, 1],
    ],
    symbol: "none",
    lineStyle: { type: "dashed", color: "#000", width: 1 },
    tooltip: { show: false },
  });

  if (chartInstance) chartInstance.dispose();
  chartInstance = echarts.init(scatterEl.value);

  chartInstance.setOption({
    title: {
      text: `Database: ${selectedDatabaseName.value}`,
      left: "center",
      textStyle: { fontSize: 14 },
    },
    legend: {
      right: 0,
      orient: "vertical",
      top: 30,
      data: Object.keys(domainMap),
    },
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        if (params.seriesName === "x = y") return "";
        const [x, y, name] = params.data;
        return `<strong>${name}</strong><br/>Target: ${(x * 100).toFixed(
          1
        )}%<br/>Comparator: ${(y * 100).toFixed(1)}%`;
      },
    },
    xAxis: {
      name: "Target %",
      nameLocation: "center",
      nameGap: 30,
      min: 0,
      max: 1,
      axisLabel: { formatter: (v) => `${(v * 100).toFixed(0)}%` },
    },
    yAxis: {
      name: "Comparator %",
      nameLocation: "center",
      nameGap: 40,
      min: 0,
      max: 1,
      axisLabel: { formatter: (v) => `${(v * 100).toFixed(0)}%` },
    },
    series,
  });

  const ro = new ResizeObserver(() => chartInstance?.resize());
  ro.observe(scatterEl.value);
}

const generateDisabled = computed(() => {
  if (!selectedComparator.value) return true;
  if (!selectedDatabaseName.value) return true;
  if (!lastGeneratedConfig.value) return false;
  return (
    comparatorName.value === lastGeneratedConfig.value.comparator &&
    selectedDatabaseName.value === lastGeneratedConfig.value.database
  );
});

onMounted(async () => {
  const url = props.initialUrlState;
  await nextTick();

  if (
    url?.databaseId &&
    availableDatabases.value.some((d) => d.id === url.databaseId)
  ) {
    selectedDatabase.value = url.databaseId;
  }

  if (url?.comparatorId && comparatorOptions.value.length) {
    const match = comparatorOptions.value.find(
      (c) => c.cohortId === url.comparatorId
    );
    if (match) selectedComparator.value = match;
  }

  if (selectedDatabase.value && selectedComparator.value) {
    await generate();
  }
});
</script>

<style scoped>
@import "./shared/styles.css";

.cohort-comparison {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.controls-row {
  display: flex;
  gap: 1.25rem;
  align-items: flex-end;
}

.controls-row > div:first-child {
  min-width: 250px;
}

.scatter-container {
  max-width: 700px;
}

.scatter-chart {
  width: 100%;
  height: 500px;
}

.smd-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
}

.smd-slider {
  flex: 1;
  min-width: 70px;
}

.smd-val {
  font-size: 0.75rem;
  white-space: nowrap;
  color: var(--text-color-secondary, #6b7280);
}
</style>
