<template>
  <div class="case-series">
    <Message :closable="false" severity="info">
      <div class="flex flex-col gap-1">
        <p>
          View features that occur before target index, between target index and
          outcome, and after outcome for patients with the outcome during the
          time-at-risk.
        </p>
      </div>
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

    <Message v-if="showResults && helpText" :closable="false" severity="info">
      <div class="flex flex-col gap-1">
        <p>
          {{ helpText }}
        </p>
      </div>
    </Message>
    <Panel class="mt-3" header="Results">
      <TabView v-if="showResults" class="mt-3">
        <TabPanel header="Binary Feature Table">
          <DataTable
            :value="binaryRows"
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
                <Column
                  v-if="hasBinaryPhase('Before')"
                  header="Pre-exposure"
                  :colspan="2"
                />
                <Column
                  v-if="hasBinaryPhase('During')"
                  header="Between exposure &amp; outcome"
                  :colspan="2"
                />
                <Column
                  v-if="hasBinaryPhase('After')"
                  header="Post-outcome"
                  :colspan="2"
                />
              </Row>
              <Row>
                <template v-if="hasBinaryPhase('Before')"
                  ><Column header="No." /><Column header="%"
                /></template>
                <template v-if="hasBinaryPhase('During')"
                  ><Column header="No." /><Column header="%"
                /></template>
                <template v-if="hasBinaryPhase('After')"
                  ><Column header="No." /><Column header="%"
                /></template>
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
            <template v-if="hasBinaryPhase('Before')">
              <Column field="sumValue_Before"
                ><template #body="{ data }">{{
                  formatCensored(data.sumValue_Before)
                }}</template></Column
              >
              <Column field="averageValue_Before" sortable
                ><template #body="{ data }">{{
                  formatPct(data.averageValue_Before)
                }}</template></Column
              >
            </template>
            <template v-if="hasBinaryPhase('During')">
              <Column field="sumValue_During"
                ><template #body="{ data }">{{
                  formatCensored(data.sumValue_During)
                }}</template></Column
              >
              <Column field="averageValue_During" sortable
                ><template #body="{ data }">{{
                  formatPct(data.averageValue_During)
                }}</template></Column
              >
            </template>
            <template v-if="hasBinaryPhase('After')">
              <Column field="sumValue_After"
                ><template #body="{ data }">{{
                  formatCensored(data.sumValue_After)
                }}</template></Column
              >
              <Column field="averageValue_After" sortable
                ><template #body="{ data }">{{
                  formatPct(data.averageValue_After)
                }}</template></Column
              >
            </template>
          </DataTable>
        </TabPanel>

        <TabPanel header="Continuous Feature Table">
          <DataTable
            :value="continuousRows"
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
                <Column header="ID" :rowspan="2" />
                <Column
                  v-if="hasContinuousPhase('Before')"
                  header="Pre-exposure"
                  :colspan="6"
                />
                <Column
                  v-if="hasContinuousPhase('During')"
                  header="Between exposure &amp; outcome"
                  :colspan="6"
                />
                <Column
                  v-if="hasContinuousPhase('After')"
                  header="Post-outcome"
                  :colspan="6"
                />
              </Row>
              <Row>
                <template
                  v-for="phase in presentContinuousPhases"
                  :key="'ch-' + phase"
                >
                  <Column header="Count" />
                  <Column header="Min" />
                  <Column header="Max" />
                  <Column header="Mean" />
                  <Column header="StDev" />
                  <Column header="Median" />
                </template>
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
            <Column field="covariateId" />
            <template
              v-for="phase in presentContinuousPhases"
              :key="'cc-' + phase"
            >
              <Column :field="'countValue_' + phase"
                ><template #body="{ data }">{{
                  formatCensored(data["countValue_" + phase])
                }}</template></Column
              >
              <Column :field="'minValue_' + phase"
                ><template #body="{ data }">{{
                  formatNum(data["minValue_" + phase])
                }}</template></Column
              >
              <Column :field="'maxValue_' + phase"
                ><template #body="{ data }">{{
                  formatNum(data["maxValue_" + phase])
                }}</template></Column
              >
              <Column :field="'averageValue_' + phase"
                ><template #body="{ data }">{{
                  formatNum(data["averageValue_" + phase])
                }}</template></Column
              >
              <Column :field="'standardDeviation_' + phase"
                ><template #body="{ data }">{{
                  formatNum(data["standardDeviation_" + phase])
                }}</template></Column
              >
              <Column :field="'medianValue_' + phase"
                ><template #body="{ data }">{{
                  formatNum(data["medianValue_" + phase])
                }}</template></Column
              >
            </template>
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
import { ref, computed, watch } from "vue";

import Panel from "primevue/panel";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";

import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import Message from "primevue/message";

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
const selectedDatabase = ref(null);
const selectedTar = ref(null);
const selectedWashout = ref(null);

const binaryRows = ref([]);
const continuousRows = ref([]);
const helpText = ref(null);

const binaryPhases = ref([]);
const continuousPhases = ref([]);

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
const targetName = computed(() => props.targetRow?.cohortName ?? "");
const outcomeName = computed(() => selectedOutcome.value?.cohortName ?? "");
const selectedDatabaseName = computed(
  () =>
    availableDatabases.value.find((d) => d.id === selectedDatabase.value)
      ?.name ?? ""
);

const availableDatabases = computed(() => {
  if (!props.targetRow) return [];
  const names = props.targetRow.databaseString.split(", ");
  const ids = props.targetRow.databaseIdString.split(", ");
  return names.map((name, i) => ({ name, id: ids[i] }));
});

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

function hasBinaryPhase(phase) {
  return binaryPhases.value.includes(phase);
}
function hasContinuousPhase(phase) {
  return continuousPhases.value.includes(phase);
}
const presentContinuousPhases = computed(() =>
  ["Before", "During", "After"].filter((p) =>
    continuousPhases.value.includes(p)
  )
);

watch(selectedOutcome, () => {
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

async function fetchBinaryCaseSeries(targetId, outcomeId, databaseId, tar) {
  const res = await StrategusService.characterization.getBinaryCaseSeries({
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

async function fetchContinuousCaseSeries(targetId, outcomeId, databaseId, tar) {
  const res = await StrategusService.characterization.getContinuousCaseSeries({
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

function pivotBinary(raw) {
  const map = new Map();
  for (const r of raw) {
    const key = `${r.covariateId}|${r.minPriorObservation}|${r.outcomeWashoutDays}|${r.casePostOutcomeDuration}|${r.casePreTargetDuration}`;
    if (!map.has(key)) {
      map.set(key, {
        covariateName: r.covariateName,
        covariateId: r.covariateId,
        minPriorObservation: r.minPriorObservation,
        outcomeWashoutDays: r.outcomeWashoutDays,
        casePostOutcomeDuration: r.casePostOutcomeDuration,
        casePreTargetDuration: r.casePreTargetDuration,
      });
    }
    const row = map.get(key);
    row[`sumValue_${r.type}`] = r.sumValue ?? 0;
    row[`averageValue_${r.type}`] = r.averageValue ?? 0;
  }
  return [...map.values()];
}

function pivotContinuous(raw) {
  const map = new Map();
  for (const r of raw) {
    const key = `${r.covariateId}|${r.minPriorObservation}|${r.outcomeWashoutDays}|${r.casePostOutcomeDuration}|${r.casePreTargetDuration}`;
    if (!map.has(key)) {
      map.set(key, {
        covariateName: r.covariateName,
        covariateId: r.covariateId,
        minPriorObservation: r.minPriorObservation,
        outcomeWashoutDays: r.outcomeWashoutDays,
        casePostOutcomeDuration: r.casePostOutcomeDuration,
        casePreTargetDuration: r.casePreTargetDuration,
      });
    }
    const row = map.get(key);
    for (const f of [
      "countValue",
      "minValue",
      "maxValue",
      "averageValue",
      "standardDeviation",
      "medianValue",
    ]) {
      row[`${f}_${r.type}`] = r[f] ?? 0;
    }
  }
  return [...map.values()];
}

function detectPhases(rows, prefix) {
  const phases = [];
  for (const p of ["Before", "During", "After"]) {
    if (rows.some((r) => r[`${prefix}_${p}`] !== undefined)) phases.push(p);
  }
  return phases;
}

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

    const [rawBinary, rawContinuous, counts] = await Promise.all([
      fetchBinaryCaseSeries(targetId, outcomeId, databaseId, tar),
      fetchContinuousCaseSeries(targetId, outcomeId, databaseId, tar),
      fetchCaseCounts(targetId, outcomeId, databaseId, tar),
    ]);

    const pivotedBin = pivotBinary(rawBinary);
    const pivotedCont = pivotContinuous(rawContinuous);

    const minObs = pivotedBin[0]?.minPriorObservation;
    const postDur = pivotedBin[0]?.casePostOutcomeDuration;
    const preDur = pivotedBin[0]?.casePreTargetDuration;

    binaryRows.value = pivotedBin.filter(
      (r) =>
        r.minPriorObservation === minObs &&
        r.casePostOutcomeDuration === postDur &&
        r.casePreTargetDuration === preDur
    );
    continuousRows.value = pivotedCont.filter(
      (r) =>
        r.minPriorObservation === minObs &&
        r.casePostOutcomeDuration === postDur &&
        r.casePreTargetDuration === preDur
    );

    binaryPhases.value = detectPhases(binaryRows.value, "sumValue");
    continuousPhases.value = detectPhases(continuousRows.value, "countValue");

    const N = counts[0]?.personCount ?? "?";
    helpText.value = `A summary of what the ${N} cases had ${
      preDur ?? "?"
    } days before target index and up to target index (pre-exposure), after target index and before outcome index (between exposure and outcome), and from outcome index up to ${
      postDur ?? "?"
    } days after outcome index (post-outcome). Cases are patients in the target cohort for the first time, with a minimum of ${
      minObs ?? "?"
    } days observation prior to target index and who had the outcome recorded during the time-at-risk period.`;

    showResults.value = true;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.case-series {
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

.w-full {
  width: 100%;
}

.empty-hint {
  text-align: center;
  color: #999;
  padding: 2rem 0;
}
</style>
