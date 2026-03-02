<template>
  <div class="db-comparison">

    <Message :closable="false" severity="info">
      <div class="flex flex-col gap-1">
        <p>Compare covariates at index between two databases for the same cohort.</p>
      </div>
    </Message>

    <Panel header="Options" toggleable class="options-panel">
      <div class="options-grid">
        <div class="option-databases">
          <label>Databases</label>
          <MultiSelect
              v-model="selectedDatabases"
              :options="availableDatabases"
              optionLabel="name"
              optionValue="id"
              placeholder="Select databases"
              filter
              display="chip"
              class="w-full"
          />
        </div>
        <div class="option-threshold">
          <label>Covariate Threshold: {{ minThreshold }}</label>
          <Slider v-model="minThreshold" :min="minCharVal" :max="1" :step="0.01" class="w-full" />
        </div>
      </div>
      <Button label="Generate" :loading="loading" @click="generate" class="mt-3" />
    </Panel>

    <Panel v-if="showResults" header="Selected" toggleable class="selected-panel mt-3">
      <div class="selected-summary">
        <span><strong>Target:</strong> {{ targetName }}</span>
        <span><strong>Databases:</strong> {{ selectedDatabaseNames.join(', ') }}</span>
        <span><strong>Min Threshold:</strong> {{ minThreshold }}</span>
      </div>
    </Panel>

    <Panel  class="mt-3" header="Results">
      <TabView  v-if="showResults">

        <!-- Binary Table -->
        <TabPanel header="Binary Table">
          <p class="help-text" v-if="covRef.length">
            This analysis shows the fraction of patients in the target cohort
            (restricted to first index date and requiring {{ covRef[0]?.minPriorObservation }} days
            observation prior to index) with a history of each binary feature across databases.
          </p>
          <DataTable
              :value="binaryRows"
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
              :exportFilename="'database_comparison_binary'"
          >
            <!-- Dynamic columns per database -->
            <ColumnGroup type="header">
              <Row>
                <Column header="Covariate" :rowspan="2" />
                <Column header="ID" :rowspan="2" />
                <Column
                    v-for="ref in covRef"
                    :key="'hdr-' + ref.id"
                    :header="`${ref.databaseName} (${ref.minPriorObservation}d prior, N=${ref.n})`"
                    :colspan="2"
                />
                <Column v-if="covRef.length === 2" header="SMD" :rowspan="2" />
              </Row>
              <Row>
                <template v-for="ref in covRef" :key="'sub-' + ref.id">
                  <Column :header="'Count'" />
                  <Column :header="'%'" />
                </template>
              </Row>
            </ColumnGroup>

            <Column field="covariateName" />
            <Column field="covariateId" />
            <template v-for="ref in covRef" :key="'col-' + ref.id">
              <Column :field="'sumValue_' + ref.id">
                <template #body="{ data }">
                  {{ formatCount(data['sumValue_' + ref.id]) }}
                </template>
              </Column>
              <Column :field="'averageValue_' + ref.id" sortable>
                <template #body="{ data }">
                  {{ formatPercent(data['averageValue_' + ref.id]) }}
                </template>
              </Column>
            </template>
            <Column v-if="covRef.length === 2" field="SMD" sortable>
              <template #body="{ data }">
                {{ data.SMD != null ? data.SMD.toFixed(4) : '' }}
              </template>
            </Column>
          </DataTable>
        </TabPanel>

        <!-- Binary Plot -->
        <TabPanel header="Binary Plot">
          <p class="help-text">Pick two databases and compare binary features across the databases.</p>
          <div class="plot-controls" v-if="covRef.length >= 2">
            <div class="plot-dropdowns">
              <div>
                <label>X-Axis Database</label>
                <Dropdown v-model="plotXAxis" :options="covRef" optionLabel="databaseName" optionValue="id" class="w-full" />
              </div>
              <div>
                <label>Y-Axis Database</label>
                <Dropdown v-model="plotYAxis" :options="covRef" optionLabel="databaseName" optionValue="id" class="w-full" />
              </div>
            </div>
            <Button label="Generate Plot" @click="generatePlot" class="mt-2" />
          </div>
          <div v-if="plotData" class="scatter-container mt-3">
            <div ref="scatterEl" class="scatter-chart"></div>
          </div>
          <p v-else-if="covRef.length < 2" class="help-text">Need at least 2 databases to plot.</p>
        </TabPanel>

        <!-- Continuous Table -->
        <TabPanel header="Continuous Table">
          <p class="help-text" v-if="covRef.length">
            This analysis shows the continuous feature distributions in the target cohort
            (restricted to first index date and requiring {{ covRef[0]?.minPriorObservation }} days
            observation prior to index) across databases.
          </p>
          <DataTable
              :value="continuousRows"
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
              :exportFilename="'database_comparison_continuous'"
          >
            <ColumnGroup type="header">
              <Row>
                <Column header="Covariate" :rowspan="2" />
                <Column header="ID" :rowspan="2" />
                <Column
                    v-for="ref in covRef"
                    :key="'chdr-' + ref.id"
                    :header="`${ref.databaseName} (${ref.minPriorObservation}d prior, N=${ref.n})`"
                    :colspan="6"
                />
                <Column v-if="covRef.length === 2" header="SMD" :rowspan="2" />
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

            <Column field="covariateName" />
            <Column field="covariateId" />
            <template v-for="ref in covRef" :key="'ccol-' + ref.id">
              <Column :field="'countValue_' + ref.id">
                <template #body="{ data }">
                  {{ formatCount(data['countValue_' + ref.id]) }}
                </template>
              </Column>
              <Column :field="'averageValue_' + ref.id">
                <template #body="{ data }">
                  {{ formatNum(data['averageValue_' + ref.id]) }}
                </template>
              </Column>
              <Column :field="'standardDeviation_' + ref.id">
                <template #body="{ data }">
                  {{ formatNum(data['standardDeviation_' + ref.id]) }}
                </template>
              </Column>
              <Column :field="'medianValue_' + ref.id">
                <template #body="{ data }">
                  {{ formatNum(data['medianValue_' + ref.id]) }}
                </template>
              </Column>
              <Column :field="'minValue_' + ref.id">
                <template #body="{ data }">
                  {{ formatNum(data['minValue_' + ref.id]) }}
                </template>
              </Column>
              <Column :field="'maxValue_' + ref.id">
                <template #body="{ data }">
                  {{ formatNum(data['maxValue_' + ref.id]) }}
                </template>
              </Column>
            </template>
            <Column v-if="covRef.length === 2" field="SMD" sortable>
              <template #body="{ data }">
                {{ data.SMD != null ? data.SMD.toFixed(4) : '' }}
              </template>
            </Column>
          </DataTable>
        </TabPanel>

      </TabView>
      <p v-else-if="(!selectedDatabases.length || !showResults) && !loading" class="empty-hint">
        Select databases, then click Generate to view comparison results.
      </p>
    </Panel>

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

import Panel from 'primevue/panel'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import MultiSelect from 'primevue/multiselect'
import Dropdown from 'primevue/dropdown'
import Slider from 'primevue/slider'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import { FilterMatchMode } from 'primevue/api'
import { onMounted } from 'vue'
import Message from "primevue/message";

import { StrategusService } from "@/shared/api/aresApi/services/strategusService";

const props = defineProps({
  targetRow: {
    type: Object,
  },
})

const loading = ref(false)
const showResults = ref(false)

const minCharVal = ref(0)
const minThreshold = ref(0.01)
const selectedDatabases = ref([])

const binaryRows = ref([])
const continuousRows = ref([])
const covRef = ref([])

const plotXAxis = ref(null)
const plotYAxis = ref(null)
const plotData = ref(null)
const scatterEl = ref(null)
let chartInstance = null

const binaryFilters = ref({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
})
const continuousFilters = ref({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const availableDatabases = computed(() => {
  if (!props.targetRow) return []
  const names = props.targetRow.databaseString.split(', ')
  const ids = props.targetRow.databaseIdString.split(', ')
  return names.map((name, i) => ({ name, id: ids[i] }))
})

const targetName = computed(() => props.targetRow?.cohortName ?? '')

const selectedDatabaseNames = computed(() =>
    availableDatabases.value
        .filter((d) => selectedDatabases.value.includes(d.id))
        .map((d) => d.name)
)

watch(() => props.targetRow, () => {
  showResults.value = false
  binaryRows.value = []
  continuousRows.value = []
  covRef.value = []
  plotData.value = null
})

// TODO: call on mount
fetchMinThreshold()

//todo: use shared ones
function formatPercent(val) {
  if (val == null) return ''
  return val >= 0 ? `${(val * 100).toFixed(3)} %` : '< min threshold'
}

function formatCount(val) {
  if (val == null) return ''
  return val >= 0 ? val : '< min threshold'
}

function formatNum(val) {
  if (val == null) return ''
  return val >= 0 ? val.toFixed(3) : `< ${Math.abs(val).toFixed(3)}`
}


//todo: check why we don't have api endpoint for this one
async function fetchMinThreshold() {
  try {
    // TODO: replace with real API call
    // const res = await fetch('/api/characterization/min-threshold')
    // const data = await res.json()
    // minCharVal.value = data.val ?? 0

    minCharVal.value = 0.01
  } catch {
    minCharVal.value = 0
  }
}

async function fetchBinaryData(targetIds, databaseIds, threshold) {
  const res = await StrategusService.characterization.getCohortBinary(targetIds, databaseIds, threshold)
  return res.data
}

async function fetchContinuousData(targetIds, databaseIds, threshold) {
  const res = await StrategusService.characterization.getCohortContinuous(targetIds, databaseIds, threshold)
  return res.data
}

async function generate() {
  if (!selectedDatabases.value.length || !props.targetRow) {
    showResults.value = false
    return
  }

  loading.value = true
  try {
    const targetIds = [props.targetRow.cohortId]
    const dbIds = selectedDatabases.value

    const binaryResult = await fetchBinaryData(targetIds, dbIds, minThreshold.value)

    if (!binaryResult.covRef?.length) {
      showResults.value = false
      return
    }

    covRef.value = binaryResult.covRef
    binaryRows.value = binaryResult.covariates

    if (covRef.value.length >= 2) {
      plotXAxis.value = covRef.value[0].id
      plotYAxis.value = covRef.value[1].id
    }

    const continuousResult = await fetchContinuousData(targetIds, dbIds, minThreshold.value)
    continuousRows.value = continuousResult.covariates ?? []

    showResults.value = true
    plotData.value = null
  } finally {
    loading.value = false
  }
}

//todo: replace with internal one
function classifyDomain(name) {
  const lower = name?.toLowerCase() ?? ''
  const first = lower.split(/\s/)[0]
  if (lower.includes('condition_') || first === 'condition') return 'Condition'
  if (lower.includes('drug_') || first === 'drug') return 'Drug'
  if (lower.includes('procedure_') || first === 'procedure') return 'Procedure'
  if (lower.includes('measurement_') || first === 'measurement') return 'Measurement'
  if (lower.includes('observation_') || first === 'observation') return 'Observation'
  if (lower.includes('device_') || first === 'device') return 'Device'
  if (lower.includes('cohort_') || first === 'cohort') return 'Cohort'
  if (lower.includes('visit_') || first === 'visit') return 'Visit'
  return 'Demographic'
}

const domainColors = {
  Condition: '#4e79a7',
  Drug: '#f28e2b',
  Procedure: '#e15759',
  Measurement: '#76b7b2',
  Observation: '#59a14f',
  Device: '#edc948',
  Cohort: '#b07aa1',
  Visit: '#ff9da7',
  Demographic: '#9c755f',
}

async function generatePlot() {
  if (plotXAxis.value == null || plotYAxis.value == null) return

  const xField = `averageValue_${plotXAxis.value}`
  const yField = `averageValue_${plotYAxis.value}`

  const xRef = covRef.value.find((r) => r.id === plotXAxis.value)
  const yRef = covRef.value.find((r) => r.id === plotYAxis.value)

  const domainMap = {}
  for (const row of binaryRows.value) {
    const domain = classifyDomain(row.covariateName)
    if (!domainMap[domain]) domainMap[domain] = []
    domainMap[domain].push([
      row[xField] ?? 0,
      row[yField] ?? 0,
      row.covariateName,
    ])
  }

  const series = Object.entries(domainMap).map(([domain, points]) => ({
    name: domain,
    type: 'scatter',
    data: points,
    symbolSize: 8,
    itemStyle: { color: domainColors[domain] ?? '#999' },
  }))

  series.push({
    name: 'x = y',
    type: 'line',
    data: [[0, 0], [1, 1]],
    symbol: 'none',
    lineStyle: { type: 'dashed', color: '#000', width: 1 },
    tooltip: { show: false },
  })

  plotData.value = true

  await nextTick()

  if (chartInstance) chartInstance.dispose()
  if (!scatterEl.value) return

  chartInstance = echarts.init(scatterEl.value)
  chartInstance.setOption({
    legend: {
      right: 0,
      orient: 'vertical',
      data: Object.keys(domainMap),
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.seriesName === 'x = y') return ''
        const [x, y, name] = params.data
        return `<strong>${name}</strong><br/>
          ${xRef?.databaseName}: ${(x * 100).toFixed(1)}%<br/>
          ${yRef?.databaseName}: ${(y * 100).toFixed(1)}%`
      },
    },
    xAxis: {
      name: `${xRef?.databaseName ?? ''} %`,
      nameLocation: 'center',
      nameGap: 30,
      min: 0,
      max: 1,
      axisLabel: { formatter: (v) => `${(v * 100).toFixed(0)}%` },
    },
    yAxis: {
      name: `${yRef?.databaseName ?? ''} %`,
      nameLocation: 'center',
      nameGap: 40,
      min: 0,
      max: 1,
      axisLabel: { formatter: (v) => `${(v * 100).toFixed(0)}%` },
    },
    series,
  })

  const ro = new ResizeObserver(() => chartInstance?.resize())
  ro.observe(scatterEl.value)
}
</script>

<style scoped>
.db-comparison {
  padding: 1rem;
}

.help-text {
  color: var(--text-color-secondary, #6b7280);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.options-panel {
  margin-top: 0.75rem;
}

.options-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

.options-grid label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.375rem;
  font-size: 0.875rem;
}

.selected-panel .selected-summary {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
}

.result-table {
  font-size: 0.8125rem;
}

.plot-controls {
  max-width: 600px;
}

.plot-dropdowns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.plot-dropdowns label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.375rem;
  font-size: 0.875rem;
}

.scatter-container {
  max-width: 700px;
}

.scatter-chart {
  width: 100%;
  height: 500px;
}

.w-full { width: 100%; }

.empty-hint {
  text-align: center;
  color: #999;
  padding: 2rem 0;
}
</style>