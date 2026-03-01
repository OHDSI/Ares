<template>
  <div class="cohort-comparison">
    <Message :closable="false" severity="info">
      <div class="flex flex-col gap-1">
        <p>
          Compare covariates at index between two cohorts within the same
          database.
        </p>
      </div>
    </Message>

    <Panel header="Options" toggleable class="options-panel">
      <label class="field-label">Select Comparator</label>
      <DataTable
        :value="comparatorOptions"
        v-model:selection="selectedComparator"
        selectionMode="single"
        dataKey="cohortId"
        :paginator="comparatorOptions.length > 10"
        :rows="10"
        filterDisplay="row"
        v-model:filters="comparatorFilters"
        stripedRows
        size="small"
        class="comparator-table"
      >
        <Column selectionMode="single" headerStyle="width: 3rem" />

        <Column
          field="parentName"
          header="Comparator"
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

      <div class="options-row mt-3">
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
        <div class="generate-btn">
          <Button label="Generate" :loading="loading" @click="generate" />
        </div>
      </div>
    </Panel>

    <Panel v-if="showResults" header="Selected" toggleable class="mt-3">
      <div class="selected-summary">
        <span><strong>Target:</strong> {{ targetName }}</span>
        <span><strong>Comparator:</strong> {{ comparatorName }}</span>
        <span><strong>Database:</strong> {{ selectedDatabaseName }}</span>
      </div>
    </Panel>

    <Panel class="mt-3" header="Results">
      <TabView v-if="showResults" class="mt-3">
        <TabPanel header="Binary Table">
          <p class="help-text" v-if="covRef.length">
            This analysis shows the fraction of patients in the cohorts
            (restricted to first index date and requiring
            {{ covRef[0]?.minPriorObservation }} days observation prior to
            index) with a history of each binary feature across databases.
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
            stripedRows
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
                <Column v-if="covRef.length === 2" header="SMD" :rowspan="2" />
                <Column
                  v-if="covRef.length === 2"
                  header="|SMD|"
                  :rowspan="2"
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
              <template #body="{ data }">{{ formatSmd(data.absSMD) }}</template>
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
        </TabPanel>

        <TabPanel header="Binary Plot">
          <p class="help-text">
            Compare binary features between target and comparator cohorts.
          </p>
          <div v-if="covRef.length === 2" class="scatter-container">
            <div ref="scatterEl" class="scatter-chart"></div>
          </div>
          <p v-else class="help-text">
            Need exactly 2 cohorts with data to plot.
          </p>
        </TabPanel>

        <TabPanel header="Continuous">
          <p class="help-text" v-if="covRef.length">
            This analysis shows continuous feature distributions in the cohorts
            (restricted to first index date and requiring
            {{ covRef[0]?.minPriorObservation }} days observation prior to
            index) across databases.
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
            stripedRows
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
                <Column v-if="covRef.length === 2" header="SMD" :rowspan="2" />
                <Column
                  v-if="covRef.length === 2"
                  header="|SMD|"
                  :rowspan="2"
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
              <template #body="{ data }">{{ formatSmd(data.absSMD) }}</template>
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
        </TabPanel>
      </TabView>
      <p
        v-else-if="(!selectedComparator || !showResults) && !loading"
        class="empty-hint"
      >
        Select a comparator, database, then click Generate to view risk factor
        results.
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
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import Dropdown from "primevue/dropdown";
import Slider from "primevue/slider";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";

import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import Message from "primevue/message";

const props = defineProps({
  targetRow: {
    type: Object,
  },
  targetTable: {
    type: Array,
  },
});

const loading = ref(false);
const showResults = ref(false);

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

const comparatorFilters = ref({
  parentName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  cohortName: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const binaryFilters = ref({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const continuousFilters = ref({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const availableDatabases = computed(() => {
  if (!props.targetRow) return [];
  const names = props.targetRow.databaseString.split(", ");
  const ids = props.targetRow.databaseIdString.split(", ");
  return names.map((name, i) => ({ name, id: ids[i] }));
});

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

function formatPercent(val) {
  if (val == null) return "";
  return val >= 0 ? `${(val * 100).toFixed(3)} %` : "< min threshold";
}
function formatCount(val) {
  if (val == null) return "";
  return val >= 0 ? val : "< min threshold";
}
function formatNum(val) {
  if (val == null) return "";
  return val >= 0 ? val.toFixed(3) : `< ${Math.abs(val).toFixed(3)}`;
}
function formatSmd(val) {
  if (val == null) return "";
  return val.toFixed(3);
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

  loading.value = true;
  try {
    const targetIds = [
      props.targetRow.cohortId,
      selectedComparator.value.cohortId,
    ];
    const dbId = selectedDatabase.value;

    const binaryResult = await fetchBinaryData(targetIds, dbId);

    if (!binaryResult.covRef?.length) {
      showResults.value = false;
      return;
    }
    if (binaryResult.covRef.length < 2) {
      showResults.value = false;
      return;
    }

    covRef.value = binaryResult.covRef;
    binaryRows.value = binaryResult.covariates;

    const continuousResult = await fetchContinuousData(targetIds, dbId);
    continuousRows.value = continuousResult.covariates ?? [];

    showResults.value = true;

    binaryAbsSmdMin.value = 0;
    continuousAbsSmdMin.value = 0;

    await nextTick();
    renderScatterPlot();
  } finally {
    loading.value = false;
  }
}

function classifyDomain(name) {
  const lower = name?.toLowerCase() ?? "";
  const first = lower.split(/\s/)[0];
  if (lower.includes("condition_") || first === "condition") return "Condition";
  if (lower.includes("drug_") || first === "drug") return "Drug";
  if (lower.includes("procedure_") || first === "procedure") return "Procedure";
  if (lower.includes("measurement_") || first === "measurement")
    return "Measurement";
  if (lower.includes("observation_") || first === "observation")
    return "Observation";
  if (lower.includes("device_") || first === "device") return "Device";
  if (lower.includes("cohort_") || first === "cohort") return "Cohort";
  if (lower.includes("visit_") || first === "visit") return "Visit";
  return "Demographic";
}

const domainColors = {
  Condition: "#4e79a7",
  Drug: "#f28e2b",
  Procedure: "#e15759",
  Measurement: "#76b7b2",
  Observation: "#59a14f",
  Device: "#edc948",
  Cohort: "#b07aa1",
  Visit: "#ff9da7",
  Demographic: "#9c755f",
};

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
      textStyle: { fontSize: 16 },
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
</script>

<style scoped>
.cohort-comparison {
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
.comparator-table {
  margin-bottom: 1rem;
  font-size: 0.8125rem;
}
.options-row {
  display: flex;
  gap: 1.5rem;
  align-items: end;
}
.options-row > div:first-child {
  min-width: 250px;
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
.scatter-container {
  max-width: 700px;
  margin-top: 0.75rem;
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
.w-full {
  width: 100%;
}

.empty-hint {
  text-align: center;
  color: #999;
  padding: 2rem 0;
}
</style>
