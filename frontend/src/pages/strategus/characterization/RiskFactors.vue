<template>
  <div class="risk-factors">
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

    <div v-if="showResults" class="section results-body">
      <ViewToggle v-model="activeResultTab" :tabs="resultTabs" />

      <Transition name="tab-fade" mode="out-in"
        ><div :key="activeResultTab">
          <div v-if="activeResultTab === 0">
            <p class="table-note" v-if="helpTextObs">
              Fraction of patients ({{ helpTextObs }}d prior obs.) stratified by
              outcome during time-at-risk.
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
                  <Column :header="`Case (N=${caseN})`" :colspan="2" />
                  <Column :header="`Non-Case (N=${nonCaseN})`" :colspan="2" />
                  <Column
                    :pt="{ headerContent: 'justify-end' }"
                    header="SMD"
                    :rowspan="2"
                    sortField="SMD"
                    sortable
                  />
                  <Column
                    :pt="{ headerContent: 'justify-end' }"
                    header="|SMD|"
                    :rowspan="2"
                    sortField="absSMD"
                    sortable
                  />
                </Row>
                <Row>
                  <Column
                    :pt="{ headerContent: 'justify-end' }"
                    header="Count"
                  />
                  <Column :pt="{ headerContent: 'justify-end' }" header="%" />
                  <Column
                    :pt="{ headerContent: 'justify-end' }"
                    header="Count"
                  />
                  <Column :pt="{ headerContent: 'justify-end' }" header="%" />
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
              <Column style="text-align: end" field="caseCount">
                <template #body="{ data }">{{
                  formatCensored(data.caseCount)
                }}</template>
              </Column>
              <Column style="text-align: end" field="caseAverage" sortable>
                <template #body="{ data }">{{
                  formatPct(data.caseAverage)
                }}</template>
              </Column>
              <Column style="text-align: end" field="nonCaseCount">
                <template #body="{ data }">{{
                  formatCensored(data.nonCaseCount)
                }}</template>
              </Column>
              <Column style="text-align: end" field="nonCaseAverage" sortable>
                <template #body="{ data }">{{
                  formatPct(data.nonCaseAverage)
                }}</template>
              </Column>
              <Column style="text-align: end" field="SMD" sortable>
                <template #body="{ data }">{{ formatNum(data.SMD) }}</template>
              </Column>
              <Column
                style="text-align: end"
                field="absSMD"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">{{
                  formatNum(data.absSMD)
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

          <div v-else-if="activeResultTab === 1">
            <p class="table-note" v-if="helpTextObs">
              Continuous feature distributions ({{ helpTextObs }}d prior obs.)
              stratified by outcome during time-at-risk.
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
                  <Column :header="`Case (N=${caseN})`" :colspan="6" />
                  <Column :header="`Target (N=${targetN})`" :colspan="6" />
                  <Column
                    :pt="{ headerContent: 'justify-end' }"
                    header="SMD"
                    :rowspan="2"
                    sortField="SMD"
                    sortable
                  />
                  <Column
                    :pt="{ headerContent: 'justify-end' }"
                    header="|SMD|"
                    :rowspan="2"
                    sortField="absSMD"
                    sortable
                  />
                </Row>
                <Row>
                  <Column
                    :pt="{ headerContent: 'justify-end' }"
                    header="Count"
                  />
                  <Column :pt="{ headerContent: 'justify-end' }" header="Min" />
                  <Column :pt="{ headerContent: 'justify-end' }" header="Max" />
                  <Column
                    :pt="{ headerContent: 'justify-end' }"
                    header="Mean"
                  />
                  <Column
                    :pt="{ headerContent: 'justify-end' }"
                    header="StDev"
                  />
                  <Column
                    :pt="{ headerContent: 'justify-end' }"
                    header="Median"
                  />
                  <Column
                    :pt="{ headerContent: 'justify-end' }"
                    header="Count"
                  />
                  <Column :pt="{ headerContent: 'justify-end' }" header="Min" />
                  <Column :pt="{ headerContent: 'justify-end' }" header="Max" />
                  <Column
                    :pt="{ headerContent: 'justify-end' }"
                    header="Mean"
                  />
                  <Column
                    :pt="{ headerContent: 'justify-end' }"
                    header="StDev"
                  />
                  <Column
                    :pt="{ headerContent: 'justify-end' }"
                    header="Median"
                  />
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
              <Column style="text-align: end" field="caseCountValue"
                ><template #body="{ data }">{{
                  formatCensored(data.caseCountValue)
                }}</template></Column
              >
              <Column style="text-align: end" field="caseMinValue"
                ><template #body="{ data }">{{
                  formatNum(data.caseMinValue)
                }}</template></Column
              >
              <Column style="text-align: end" field="caseMaxValue"
                ><template #body="{ data }">{{
                  formatNum(data.caseMaxValue)
                }}</template></Column
              >
              <Column style="text-align: end" field="caseAverageValue"
                ><template #body="{ data }">{{
                  formatNum(data.caseAverageValue)
                }}</template></Column
              >
              <Column style="text-align: end" field="caseStandardDeviation"
                ><template #body="{ data }">{{
                  formatNum(data.caseStandardDeviation)
                }}</template></Column
              >
              <Column style="text-align: end" field="caseMedianValue"
                ><template #body="{ data }">{{
                  formatNum(data.caseMedianValue)
                }}</template></Column
              >
              <Column style="text-align: end" field="targetCountValue"
                ><template #body="{ data }">{{
                  formatCensored(data.targetCountValue)
                }}</template></Column
              >
              <Column style="text-align: end" field="targetMinValue"
                ><template #body="{ data }">{{
                  formatNum(data.targetMinValue)
                }}</template></Column
              >
              <Column style="text-align: end" field="targetMaxValue"
                ><template #body="{ data }">{{
                  formatNum(data.targetMaxValue)
                }}</template></Column
              >
              <Column style="text-align: end" field="targetAverageValue"
                ><template #body="{ data }">{{
                  formatNum(data.targetAverageValue)
                }}</template></Column
              >
              <Column style="text-align: end" field="targetStandardDeviation"
                ><template #body="{ data }">{{
                  formatNum(data.targetStandardDeviation)
                }}</template></Column
              >
              <Column style="text-align: end" field="targetMedianValue"
                ><template #body="{ data }">{{
                  formatNum(data.targetMedianValue)
                }}</template></Column
              >
              <Column style="text-align: end" field="SMD" sortable
                ><template #body="{ data }">{{
                  formatNum(data.SMD)
                }}</template></Column
              >
              <Column
                style="text-align: end"
                field="absSMD"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">{{
                  formatNum(data.absSMD)
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
import Slider from "primevue/slider";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { useStore } from "vuex";

const store = useStore();
const darkMode = computed(() => store.getters.getSettings.darkMode);
const smdValColor = computed(() => (darkMode.value ? "#9ca3af" : "#6b7280"));

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
const caseN = ref(0);
const nonCaseN = ref(0);
const targetN = ref(0);
const helpTextObs = ref(null);

const binaryAbsSmdMin = ref(0);
const continuousAbsSmdMin = ref(0);
const smdMax = ref(2);

const binaryTableFilters = ref({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const continuousTableFilters = ref({
  covariateName: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const outcomeOptions = computed(() => props.outcomeTable ?? []);

const availableDatabases = useAvailableDatabases(toRef(props, "targetRow"));

const targetName = computed(() => props.targetRow?.cohortName ?? "");
const outcomeName = computed(() => selectedOutcome.value?.cohortName ?? "");
const selectedDatabaseName = computed(
  () =>
    availableDatabases.value.find((d) => d.id === selectedDatabase.value)
      ?.name ?? ""
);

const { tarOptions, tarValues, washoutOptions } =
  useTarWashout(selectedOutcome);

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

  if (url?.tar && tarOptions.value.includes(url.tar)) {
    selectedTar.value = url.tar;
  }

  if (url?.washout && washoutOptions.value.includes(url.washout)) {
    selectedWashout.value = url.washout;
  }

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

.risk-factors {
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
  color: v-bind(smdValColor);
}
</style>
