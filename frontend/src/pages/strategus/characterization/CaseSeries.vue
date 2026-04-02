<template>
  <div class="case-series">
    <div class="section">
      <label class="field-label">Outcome</label>
      <OutcomeSelector v-model="selectedOutcome" :options="outcomeOptions" />

      <div class="controls-row">
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
      :items="[
        targetName,
        lastGeneratedConfig.outcomeName,
        lastGeneratedConfig.selectedDatabaseName,
        `TAR: ${lastGeneratedConfig.selectedTar}`,
        `Washout: ${lastGeneratedConfig.selectedWashout}d`,
      ]"
    />

    <p v-if="showResults && helpText" class="help-note">{{ helpText }}</p>

    <div v-if="showResults" class="section results-body">
      <ViewToggle v-model="activeResultTab" :tabs="resultTabs" />

      <Transition name="tab-fade" mode="out-in"
        ><div :key="activeResultTab">
          <div v-if="activeResultTab === 0">
            <DataTable
              :value="binaryRows"
              :paginator="true"
              :rows="25"
              :rowsPerPageOptions="[10, 25, 50, 100]"
              filterDisplay="row"
              v-model:filters="binaryTableFilters"
              sortMode="multiple"
              removableSort
              :striped-rows="store.getters.getSettings.strippedRows"
              size="small"
              class="result-table"
            >
              <ColumnGroup type="header">
                <Row>
                  <Column
                    :pt="{ headerContent: 'justify-start' }"
                    header="Covariate"
                    :rowspan="2"
                  />
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
                    ><Column
                      :pt="{ headerContent: 'justify-end' }"
                      header="No." /><Column
                      :pt="{ headerContent: 'justify-end' }"
                      header="%"
                  /></template>
                  <template v-if="hasBinaryPhase('During')"
                    ><Column
                      :pt="{ headerContent: 'justify-end' }"
                      header="No." /><Column
                      :pt="{ headerContent: 'justify-end' }"
                      header="%"
                  /></template>
                  <template v-if="hasBinaryPhase('After')"
                    ><Column
                      :pt="{ headerContent: 'justify-end' }"
                      header="No." /><Column
                      :pt="{ headerContent: 'justify-end' }"
                      header="%"
                  /></template>
                </Row>
              </ColumnGroup>

              <Column
                field="covariateName"
                :showFilterMenu="false"
                style="text-align: start"
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
                <Column style="text-align: end" field="sumValue_Before"
                  ><template #body="{ data }">{{
                    formatCensored(data.sumValue_Before)
                  }}</template></Column
                >
                <Column
                  style="text-align: end"
                  field="averageValue_Before"
                  sortable
                  ><template #body="{ data }">{{
                    formatPct(data.averageValue_Before)
                  }}</template></Column
                >
              </template>
              <template v-if="hasBinaryPhase('During')">
                <Column style="text-align: end" field="sumValue_During"
                  ><template #body="{ data }">{{
                    formatCensored(data.sumValue_During)
                  }}</template></Column
                >
                <Column
                  style="text-align: end"
                  field="averageValue_During"
                  sortable
                  ><template #body="{ data }">{{
                    formatPct(data.averageValue_During)
                  }}</template></Column
                >
              </template>
              <template v-if="hasBinaryPhase('After')">
                <Column style="text-align: end" field="sumValue_After"
                  ><template #body="{ data }">{{
                    formatCensored(data.sumValue_After)
                  }}</template></Column
                >
                <Column
                  style="text-align: end"
                  field="averageValue_After"
                  sortable
                  ><template #body="{ data }">{{
                    formatPct(data.averageValue_After)
                  }}</template></Column
                >
              </template>
            </DataTable>
          </div>

          <div v-else-if="activeResultTab === 1">
            <DataTable
              :value="continuousRows"
              :paginator="true"
              :rows="25"
              :rowsPerPageOptions="[10, 25, 50, 100]"
              filterDisplay="row"
              v-model:filters="continuousTableFilters"
              sortMode="multiple"
              removableSort
              :striped-rows="store.getters.getSettings.strippedRows"
              size="small"
              class="result-table"
            >
              <ColumnGroup type="header">
                <Row>
                  <Column
                    :pt="{ headerContent: 'justify-start' }"
                    header="Covariate"
                    :rowspan="2"
                  />
                  <Column
                    :pt="{ headerContent: 'justify-start' }"
                    header="ID"
                    :rowspan="2"
                  />
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
                    <Column
                      :pt="{ headerContent: 'justify-end' }"
                      header="Count"
                    /><Column
                      :pt="{ headerContent: 'justify-end' }"
                      header="Min"
                    /><Column
                      :pt="{ headerContent: 'justify-end' }"
                      header="Max"
                    />
                    <Column
                      :pt="{ headerContent: 'justify-end' }"
                      header="Mean"
                    /><Column
                      :pt="{ headerContent: 'justify-end' }"
                      header="StDev"
                    /><Column
                      :pt="{ headerContent: 'justify-end' }"
                      header="Median"
                    />
                  </template>
                </Row>
              </ColumnGroup>

              <Column
                field="covariateName"
                :showFilterMenu="false"
                style="text-align: start"
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
              <Column style="text-align: start" field="covariateId" />
              <template
                v-for="phase in presentContinuousPhases"
                :key="'cc-' + phase"
              >
                <Column style="text-align: end" :field="'countValue_' + phase"
                  ><template #body="{ data }">{{
                    formatCensored(data["countValue_" + phase])
                  }}</template></Column
                >
                <Column style="text-align: end" :field="'minValue_' + phase"
                  ><template #body="{ data }">{{
                    formatNum(data["minValue_" + phase])
                  }}</template></Column
                >
                <Column style="text-align: end" :field="'maxValue_' + phase"
                  ><template #body="{ data }">{{
                    formatNum(data["maxValue_" + phase])
                  }}</template></Column
                >
                <Column style="text-align: end" :field="'averageValue_' + phase"
                  ><template #body="{ data }">{{
                    formatNum(data["averageValue_" + phase])
                  }}</template></Column
                >
                <Column
                  style="text-align: end"
                  :field="'standardDeviation_' + phase"
                  ><template #body="{ data }">{{
                    formatNum(data["standardDeviation_" + phase])
                  }}</template></Column
                >
                <Column style="text-align: end" :field="'medianValue_' + phase"
                  ><template #body="{ data }">{{
                    formatNum(data["medianValue_" + phase])
                  }}</template></Column
                >
              </template>
            </DataTable>
          </div>
        </div></Transition
      >
    </div>

    <div v-else-if="!loading" class="section empty-state">
      Select an outcome, database, TAR, and washout, then click Generate.
    </div>

    <ResultsLoader :loader-state="loaderState" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, toRef } from "vue";

import ResultsLoader from "./shared/ResultsLoader.vue";
import ViewToggle from "./shared/ViewToggle.vue";
import OutcomeSelector from "./shared/OutcomeSelector.vue";
import ContextBar from "./shared/ContextBar.vue";
import { useAvailableDatabases } from "./shared/useAvailableDatabases";
import { useTarWashout } from "./shared/useTarWashout";
import { formatCensored, formatPct, formatNum } from "./shared/formatters";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";

import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { useStore } from "vuex";

const store = useStore();

const props = defineProps({
  targetRow: { type: Object },
  outcomeTable: { type: Array },
  initialUrlState: { type: Object, default: null },
});

const emit = defineEmits(["state-change"]);

const loading = ref(false);
const showResults = ref(false);
const loaderState = ref("idle");
const lastGeneratedConfig = ref(null);

const activeResultTab = ref(0);
const resultTabs = [
  { key: "binary", label: "Binary Features" },
  { key: "continuous", label: "Continuous Features" },
];

const selectedOutcome = ref(null);
const selectedDatabase = ref(null);
const selectedTar = ref(null);
const selectedWashout = ref(null);

const binaryRows = ref([]);
const continuousRows = ref([]);
const helpText = ref(null);
const binaryPhases = ref([]);
const continuousPhases = ref([]);

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

const availableDatabases = useAvailableDatabases(toRef(props, "targetRow"));
const { tarOptions, tarValues, washoutOptions } =
  useTarWashout(selectedOutcome);

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

  showResults.value = false;
  loading.value = true;
  loaderState.value = "loading";
  const loadStart = Date.now();
  try {
    const targetId = props.targetRow.cohortId;
    const outcomeId = selectedOutcome.value.cohortId;
    const databaseId = selectedDatabase.value;
    const tarIdx = tarOptions.value.indexOf(selectedTar.value);
    const tar = tarValues.value[tarIdx];

    if (!tar || !tar.startAnchor) {
      showResults.value = false;
      loaderState.value = "idle";
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
    helpText.value = `Summary of ${N} cases: ${
      preDur ?? "?"
    }d before target index (pre-exposure), between target and outcome (during), and ${
      postDur ?? "?"
    }d after outcome (post-outcome). Min ${
      minObs ?? "?"
    }d prior observation required.`;

    if (Date.now() - loadStart >= 600) {
      loaderState.value = "success";
      await new Promise((r) => setTimeout(r, 1100));
    }
    loaderState.value = "idle";
    await new Promise((r) => setTimeout(r, 220));
    showResults.value = true;
    lastGeneratedConfig.value = {
      outcomeName: outcomeName.value,
      selectedDatabaseName: selectedDatabaseName.value,
      selectedOutcome: selectedOutcome?.value?.cohortId,
      selectedTar: selectedTar.value,
      selectedWashout: selectedWashout.value,
    };
    emit("state-change", {
      outcomeId: selectedOutcome.value.cohortId,
      databaseId: selectedDatabase.value,
      tar: selectedTar.value,
      washout: selectedWashout.value,
      ctxItems: [
        outcomeName.value,
        selectedDatabaseName.value,
        `TAR: ${selectedTar.value}`,
        `Washout: ${selectedWashout.value}d`,
      ],
    });
  } catch {
    loaderState.value = "error";
  } finally {
    loading.value = false;
  }
}

const generateDisabled = computed(() => {
  if (
    !selectedTar.value ||
    !selectedDatabaseName.value ||
    !selectedOutcome.value ||
    !selectedWashout.value
  )
    return true;
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

onMounted(async () => {
  const url = props.initialUrlState;
  if (url?.outcomeId && outcomeOptions.value.length) {
    const match = outcomeOptions.value.find(
      (o) => o.cohortId === url.outcomeId
    );
    if (match) selectedOutcome.value = match;
  }
  if (
    url?.databaseId &&
    availableDatabases.value.some((d) => d.id === url.databaseId)
  ) {
    selectedDatabase.value = url.databaseId;
  }
  await nextTick();
  if (url?.tar && tarOptions.value.includes(url.tar))
    selectedTar.value = url.tar;
  if (url?.washout && washoutOptions.value.includes(url.washout))
    selectedWashout.value = url.washout;
  await nextTick();
  if (
    selectedOutcome.value &&
    selectedDatabase.value &&
    selectedTar.value &&
    selectedWashout.value
  ) {
    await generate();
  }
});
</script>

<style scoped>
@import "./shared/styles.css";

.case-series {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.controls-row {
  display: flex;
  gap: 1.25rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.controls-row > div {
  min-width: 160px;
}

.help-note {
  font-size: 0.8125rem;
  color: var(--text-color-secondary, #64748b);
  padding: 0 0.25rem;
  margin: 0;
  line-height: 1.4;
}
</style>
