<template>
  <div class="risk-factors">
    <Message :closable="false" severity="info">
      <p>
        View features that are associated with having or not having the outcome
        during the time-at-risk.
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

      <div class="options-row mt-3">
        <div>
          <label class="field-label">Database</label>
          <Dropdown
            v-model="selectedDatabase"
            :options="availableDatabases"
            optionLabel="name"
            optionValue="id"
            class="w-full"
          />
        </div>
        <div>
          <label class="field-label">Time-at-risk</label>
          <Dropdown
            v-model="selectedTar"
            :options="tarOptions"
            class="w-full"
            :disabled="!tarOptions.length"
          />
        </div>
        <div>
          <label class="field-label">Outcome washout</label>
          <Dropdown
            v-model="selectedWashout"
            :options="washoutOptions"
            class="w-full"
            :disabled="!washoutOptions.length"
          />
        </div>
      </div>

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
        <span><strong>Database:</strong> {{ selectedDatabaseName }}</span>
        <span><strong>TAR:</strong> {{ selectedTar }}</span>
        <span><strong>Washout:</strong> {{ selectedWashout }} days</span>
      </div>
    </Panel>
    <Panel class="mt-3" header="Results">
      <TabView v-if="showResults" class="mt-3">
        <TabPanel header="Binary Feature Table">
          <p class="help-text" v-if="helpTextObs">
            This analysis shows the fraction of patients in the cohorts
            (restricted to first index date and requiring {{ helpTextObs }} days
            observation prior to index) stratified by whether they had the
            outcome during the time-at-risk with a history of each binary
            feature.
          </p>
          <DataTable
            :value="filteredBinaryRows"
            :paginator="true"
            :rows="25"
            :rowsPerPageOptions="[10, 25, 50, 100]"
            filterDisplay="row"
            v-model:filters="binaryTableFilters"
            sortMode="multiple"
            removableSort
            stripedRows
            size="small"
            class="result-table"
          >
            <ColumnGroup type="header">
              <Row>
                <Column header="Covariate" :rowspan="2" />
                <Column :header="`Case (N=${caseN})`" :colspan="2" />
                <Column :header="`Non-Case (N=${nonCaseN})`" :colspan="2" />
                <Column header="SMD" :rowspan="2" />
                <Column header="|SMD|" :rowspan="2" />
              </Row>
              <Row>
                <Column header="Count" />
                <Column header="%" />
                <Column header="Count" />
                <Column header="%" />
              </Row>
            </ColumnGroup>

            <Column
              field="covariateName"
              :showFilterMenu="false"
              style="min-width: 300px"
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
            <Column field="caseCount">
              <template #body="{ data }">{{
                formatCensored(data.caseCount)
              }}</template>
            </Column>
            <Column field="caseAverage" sortable>
              <template #body="{ data }">{{
                formatPct(data.caseAverage)
              }}</template>
            </Column>
            <Column field="nonCaseCount">
              <template #body="{ data }">{{
                formatCensored(data.nonCaseCount)
              }}</template>
            </Column>
            <Column field="nonCaseAverage" sortable>
              <template #body="{ data }">{{
                formatPct(data.nonCaseAverage)
              }}</template>
            </Column>
            <Column field="SMD" sortable>
              <template #body="{ data }">{{ formatNum(data.SMD) }}</template>
            </Column>
            <Column field="absSMD" sortable :showFilterMenu="false">
              <template #body="{ data }">{{ formatNum(data.absSMD) }}</template>
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

        <TabPanel header="Continuous Feature Table">
          <p class="help-text" v-if="helpTextObs">
            This analysis shows the continuous feature distributions in the
            cohorts (restricted to first index date and requiring
            {{ helpTextObs }} days observation prior to index) stratified by
            whether they had the outcome during the time-at-risk.
          </p>
          <DataTable
            :value="filteredContinuousRows"
            :paginator="true"
            :rows="25"
            :rowsPerPageOptions="[10, 25, 50, 100]"
            filterDisplay="row"
            v-model:filters="continuousTableFilters"
            sortMode="multiple"
            removableSort
            stripedRows
            size="small"
            class="result-table"
          >
            <ColumnGroup type="header">
              <Row>
                <Column header="Covariate" :rowspan="2" />
                <Column :header="`Case (N=${caseN})`" :colspan="6" />
                <Column :header="`Target (N=${targetN})`" :colspan="6" />
                <Column header="SMD" :rowspan="2" />
                <Column header="|SMD|" :rowspan="2" />
              </Row>
              <Row>
                <Column header="Count" />
                <Column header="Min" />
                <Column header="Max" />
                <Column header="Mean" />
                <Column header="StDev" />
                <Column header="Median" />
                <Column header="Count" />
                <Column header="Min" />
                <Column header="Max" />
                <Column header="Mean" />
                <Column header="StDev" />
                <Column header="Median" />
              </Row>
            </ColumnGroup>

            <Column
              field="covariateName"
              :showFilterMenu="false"
              style="min-width: 300px"
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
            <Column field="caseCountValue"
              ><template #body="{ data }">{{
                formatCensored(data.caseCountValue)
              }}</template></Column
            >
            <Column field="caseMinValue"
              ><template #body="{ data }">{{
                formatNum(data.caseMinValue)
              }}</template></Column
            >
            <Column field="caseMaxValue"
              ><template #body="{ data }">{{
                formatNum(data.caseMaxValue)
              }}</template></Column
            >
            <Column field="caseAverageValue"
              ><template #body="{ data }">{{
                formatNum(data.caseAverageValue)
              }}</template></Column
            >
            <Column field="caseStandardDeviation"
              ><template #body="{ data }">{{
                formatNum(data.caseStandardDeviation)
              }}</template></Column
            >
            <Column field="caseMedianValue"
              ><template #body="{ data }">{{
                formatNum(data.caseMedianValue)
              }}</template></Column
            >
            <Column field="targetCountValue"
              ><template #body="{ data }">{{
                formatCensored(data.targetCountValue)
              }}</template></Column
            >
            <Column field="targetMinValue"
              ><template #body="{ data }">{{
                formatNum(data.targetMinValue)
              }}</template></Column
            >
            <Column field="targetMaxValue"
              ><template #body="{ data }">{{
                formatNum(data.targetMaxValue)
              }}</template></Column
            >
            <Column field="targetAverageValue"
              ><template #body="{ data }">{{
                formatNum(data.targetAverageValue)
              }}</template></Column
            >
            <Column field="targetStandardDeviation"
              ><template #body="{ data }">{{
                formatNum(data.targetStandardDeviation)
              }}</template></Column
            >
            <Column field="targetMedianValue"
              ><template #body="{ data }">{{
                formatNum(data.targetMedianValue)
              }}</template></Column
            >
            <Column field="SMD" sortable
              ><template #body="{ data }">{{
                formatNum(data.SMD)
              }}</template></Column
            >
            <Column field="absSMD" sortable :showFilterMenu="false">
              <template #body="{ data }">{{ formatNum(data.absSMD) }}</template>
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
        v-else-if="(!selectedOutcome || !showResults) && !loading"
        class="empty-hint"
      >
        Select an outcome, database, TAR, and washout above, then click Generate
        to view risk factor results.
      </p>
    </Panel>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from "vue";

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
const lastGeneratedConfig = ref(null);

const selectedOutcome = ref(null);
const selectedDatabase = ref(null);
const selectedTar = ref(null);
const selectedWashout = ref(null);

const binaryRows = ref([]);
const continuousRows = ref([]);
const caseN = ref(0);
const nonCaseN = ref(0);
const targetN = ref(0);
const helpTextObs = ref(null);

const binaryAbsSmdMin = ref(0);
const continuousAbsSmdMin = ref(0);
const smdMax = ref(2);

const outcomeFilters = ref({
  parentName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  cohortName: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const binaryTableFilters = ref({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const continuousTableFilters = ref({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const outcomeOptions = computed(() => props.outcomeTable ?? []);

const availableDatabases = computed(() => {
  if (!props.targetRow) return [];
  const names = props.targetRow.databaseString.split(", ");
  const ids = props.targetRow.databaseIdString.split(", ");
  return names.map((name, i) => ({ name, id: ids[i] }));
});

const targetName = computed(() => props.targetRow?.cohortName ?? "");
const outcomeName = computed(() => selectedOutcome.value?.cohortName ?? "");
const selectedDatabaseName = computed(
  () =>
    availableDatabases.value.find((d) => d.id === selectedDatabase.value)
      ?.name ?? ""
);

const tarOptions = computed(() => {
  const o = selectedOutcome.value;
  if (!o?.tarNames) return [];
  return o.tarNames.split(":");
});

const tarValues = computed(() => {
  const o = selectedOutcome.value;
  if (!o?.tarStrings) return [];
  return o.tarStrings.split(":").map((s) => {
    const [riskWindowStart, startAnchor, riskWindowEnd, endAnchor] =
      s.split("/");
    return { riskWindowStart, startAnchor, riskWindowEnd, endAnchor };
  });
});

const washoutOptions = computed(() => {
  const o = selectedOutcome.value;
  if (!o?.outcomeWashoutDays) return [];
  return o.outcomeWashoutDays.split(":");
});

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

watch(selectedOutcome, (o) => {
  showResults.value = false;
  if (tarOptions.value.length) selectedTar.value = tarOptions.value[0];
  else selectedTar.value = null;
  if (washoutOptions.value.length)
    selectedWashout.value = washoutOptions.value[0];
  else selectedWashout.value = null;
});

watch(
  () => props.targetRow,
  () => {
    showResults.value = false;
  }
);

//todo: replace with shared
function formatCensored(val) {
  if (val == null) return "< min threshold";
  return val >= 0 ? val : `< ${Math.abs(val)}`;
}
function formatPct(val) {
  if (val == null) return "";
  return `${(val * 100).toFixed(2)}%`;
}
function formatNum(val) {
  if (val == null) return "";
  return typeof val === "number" ? val.toFixed(2) : val;
}

async function fetchCaseCounts(targetId, outcomeId, databaseId, tar) {
  const res = await StrategusService.characterization.getCaseCounts({
    targetIds: [targetId],
    outcomeIds: [outcomeId],
    databaseIds: databaseId ? [databaseId] : undefined,
    riskWindowStart: tar?.riskWindowStart,
    riskWindowEnd: tar?.riskWindowEnd,
    startAnchor: tar?.startAnchor,
    endAnchor: tar?.endAnchor,
  });
  return res.data;
}

async function fetchCaseTargetCounts(targetId, outcomeId, databaseId) {
  const res = await StrategusService.characterization.getCaseTargetCounts({
    targetIds: [targetId],
    outcomeIds: [outcomeId],
    databaseIds: databaseId ? [databaseId] : undefined,
  });
  return res.data;
}

async function fetchBinaryRiskFactors(targetId, outcomeId, databaseId, tar) {
  const res = await StrategusService.characterization.getBinaryRiskFactors({
    targetId,
    outcomeId,
    databaseId,
    riskWindowStart: tar?.riskWindowStart,
    riskWindowEnd: tar?.riskWindowEnd,
    startAnchor: tar?.startAnchor,
    endAnchor: tar?.endAnchor,
  });
  return res.data;
}

async function fetchContinuousRiskFactors(
  targetId,
  outcomeId,
  databaseId,
  tar
) {
  const res = await StrategusService.characterization.getContinuousRiskFactors({
    targetId,
    outcomeId,
    databaseId,
    riskWindowStart: tar?.riskWindowStart,
    riskWindowEnd: tar?.riskWindowEnd,
    startAnchor: tar?.startAnchor,
    endAnchor: tar?.endAnchor,
  });
  return res.data;
}

// ─── Generate ────────────────────────────────────────────────────────────────
async function generate() {
  if (
    !selectedOutcome.value ||
    !selectedDatabase.value ||
    !selectedTar.value ||
    !selectedWashout.value
  ) {
    showResults.value = false;
    return;
  }

  loading.value = true;
  try {
    const targetId = props.targetRow.cohortId;
    const outcomeId = selectedOutcome.value.cohortId;
    const databaseId = selectedDatabase.value;
    const tarIdx = tarOptions.value.indexOf(selectedTar.value);
    const tar = tarValues.value[tarIdx];

    if (!tar || !tar.startAnchor) {
      showResults.value = false;
      return;
    }

    const [caseCounts, targetCounts, binary, continuous] = await Promise.all([
      fetchCaseCounts(targetId, outcomeId, databaseId, tar),
      fetchCaseTargetCounts(targetId, outcomeId, databaseId),
      fetchBinaryRiskFactors(targetId, outcomeId, databaseId, tar),
      fetchContinuousRiskFactors(targetId, outcomeId, databaseId, tar),
    ]);

    const washout = selectedWashout.value;
    const caseRow = caseCounts.find(
      (r) => String(r.outcomeWashoutDays) === String(washout)
    );
    const targetRow = targetCounts.find(
      (r) => String(r.outcomeWashoutDays) === String(washout)
    );

    caseN.value = caseRow?.personCount ?? 0;
    nonCaseN.value = targetRow?.personCount ?? 0;
    targetN.value = targetRow?.withoutExcludedPersonCount ?? 0;
    helpTextObs.value = caseRow?.minPriorObservation ?? 365;

    binaryRows.value = (binary ?? []).filter(
      (r) => String(r.outcomeWashoutDays) === String(washout)
    );
    continuousRows.value = (continuous ?? []).filter(
      (r) => String(r.outcomeWashoutDays) === String(washout)
    );

    binaryAbsSmdMin.value = 0;
    continuousAbsSmdMin.value = 0;
    showResults.value = true;
    lastGeneratedConfig.value = {
      selectedDatabaseName: selectedDatabaseName.value,
      selectedOutcome: selectedOutcome?.value?.cohortId,
      selectedTar: selectedTar.value,
      selectedWashout: selectedWashout.value,
    };
  } finally {
    loading.value = false;
  }
}

const generateDisabled = computed(() => {
  if (!selectedTar.value) return true;
  if (!selectedDatabaseName.value) return true;
  if (!selectedOutcome.value) return true;
  if (!selectedWashout.value) return true;

  if (!lastGeneratedConfig.value) return false;
  return (
    selectedDatabaseName.value ===
      lastGeneratedConfig.value.selectedDatabaseName &&
    selectedOutcome.value.cohortId ===
      lastGeneratedConfig.value.selectedOutcome &&
    selectedTar.value === lastGeneratedConfig.value.selectedTar &&
    selectedWashout.value === lastGeneratedConfig.value.selectedWashout
  );
});
</script>

<style scoped>
.risk-factors {
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
.options-row {
  display: flex;
  gap: 1.5rem;
  align-items: start;
  flex-wrap: wrap;
}
.options-row > div {
  min-width: 180px;
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
