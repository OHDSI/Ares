<template>
  <div class="risk-factors">
    <div class="section">
      <label class="field-label">Outcome</label>
      <OutcomeSelector v-model="selectedOutcome" :options="outcomeOptions" />

      <div class="controls-row">
        <div>
          <label class="field-label">Database</label>
          <MultiSelect
            v-model="selectedDatabases"
            :options="availableDatabases"
            optionLabel="name"
            optionValue="id"
            class="w-full"
            :maxSelectedLabels="1"
            selectedItemsLabel="{0} databases"
            display="chip"
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
          <GenerateButton :disabled="generateDisabled" @click="generate" />
        </div>
      </div>
    </div>

    <ContextBar
      v-if="showResults"
      :items="[
        targetName,
        lastGeneratedConfig.outcomeName,
        ...lastGeneratedConfig.selectedDatabaseNames,
        `TAR: ${lastGeneratedConfig.selectedTar}`,
        `Washout: ${lastGeneratedConfig.selectedWashout}d`,
      ]"
    />

    <div
      v-if="showResults"
      :class="[
        'section',
        'results-body',
        {
          'results-fullscreen': isFullscreen,
          'results-leaving': isFullscreenLeaving,
        },
      ]"
    >
      <div v-if="isFullscreen" class="section-header">
        <h3>Risk Factors</h3>
        <button
          class="fullscreen-btn"
          title="Exit fullscreen (Esc)"
          @click="exitFullscreen"
        >
          <SvgIcon :path="mdiFullscreenExit" :size="18" />
        </button>
      </div>

      <ViewToggle v-model="activeResultTab" :tabs="resultTabs" />

      <Transition name="tab-fade" mode="out-in"
        ><div :key="activeResultTab">
          <div v-if="activeResultTab === 0">
            <p class="table-note" v-if="helpTextObs">
              Fraction of patients ({{ helpTextObs }}d prior obs.) stratified by
              outcome during time-at-risk.
            </p>
            <RfBinaryTable
              :data="binaryRows"
              :rf-ref="binaryRfRef"
              :is-fullscreen="isFullscreen"
              :help-text-obs="helpTextObs"
              @update:fullscreen="isFullscreen = $event"
            />
          </div>

          <div v-else-if="activeResultTab === 1">
            <p class="table-note" v-if="helpTextObs">
              Continuous feature distributions ({{ helpTextObs }}d prior obs.)
              stratified by outcome during time-at-risk.
            </p>
            <RfContinuousTable
              :data="continuousRows"
              :rf-ref="continuousRfRef"
              :is-fullscreen="isFullscreen"
              :help-text-obs="helpTextObs"
              @update:fullscreen="isFullscreen = $event"
            />
          </div></div
      ></Transition>
    </div>

    <div v-else-if="!loading" class="section empty-state">
      Select an outcome, one or more databases, TAR, and washout, then click
      Generate.
    </div>

    <ResultsLoader :loader-state="loaderState" />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
  toRef,
} from "vue";

import ResultsLoader from "../shared/resultsLoader";
import ViewToggle from "../shared/viewToggle";
import OutcomeSelector from "../shared/outcomeSelector";
import ContextBar from "../shared/contextBar";
import { useAvailableDatabases } from "../shared/useAvailableDatabases";
import { useTarWashout } from "../shared/useTarWashout";
import SvgIcon from "@/shared/ui/svgIcon";
import { mdiFullscreenExit } from "@mdi/js";
import Dropdown from "primevue/dropdown";
import MultiSelect from "primevue/multiselect";
import GenerateButton from "@/pages/strategus/characterization/shared/generateButton";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import RfBinaryTable from "./rfBinaryTable";
import RfContinuousTable from "./rfContinuousTable";

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
const selectedDatabases = ref<string[]>([]);
const selectedTar = ref(null);
const selectedWashout = ref(null);

const binaryRows = ref([]);
const continuousRows = ref([]);
const helpTextObs = ref(null);

const binaryRfRef = ref<
  { id: string; databaseName: string; caseN: number; nonCaseN: number }[]
>([]);
const continuousRfRef = ref<
  { id: string; databaseName: string; caseN: number; targetN: number }[]
>([]);

const outcomeOptions = computed(() => props.outcomeTable ?? []);
const availableDatabases = useAvailableDatabases(toRef(props, "targetRow"));
const targetName = computed(() => props.targetRow?.cohortName ?? "");
const outcomeName = computed(() => selectedOutcome.value?.cohortName ?? "");
const selectedDatabaseNames = computed(() =>
  availableDatabases.value
    .filter((d) => selectedDatabases.value.includes(d.id))
    .map((d) => d.name)
);

const { tarOptions, tarValues, washoutOptions } =
  useTarWashout(selectedOutcome);

watch(selectedOutcome, () => {
  showResults.value = false;
  selectedTar.value = tarOptions.value.length ? tarOptions.value[0] : null;
  selectedWashout.value = washoutOptions.value.length
    ? washoutOptions.value[0]
    : null;
});

watch(
  () => props.targetRow,
  () => {
    showResults.value = false;
  }
);

function pivotBinary(rows: any[]) {
  if (!rows.length) return { rfRef: [], pivoted: [] };

  const dbMap = new Map<string, any>();
  for (const r of rows) {
    if (!dbMap.has(r.databaseId)) {
      dbMap.set(r.databaseId, {
        id: r.databaseId,
        databaseName: r.databaseName,
        caseN: r.casePersonCount,
        nonCaseN: r.nonCasePersonCount,
      });
    }
  }
  const rfRef = [...dbMap.values()];

  const covMap = new Map<number, any>();
  for (const r of rows) {
    if (!covMap.has(r.covariateId)) {
      covMap.set(r.covariateId, {
        covariateName: r.covariateName,
        covariateId: r.covariateId,
        domain: r.covariateNameParsed?.domain ?? null,
        concept: r.covariateNameParsed?.concept ?? null,
        timeWindow: r.covariateNameParsed?.timeWindow ?? null,
        windowDays: r.covariateNameParsed?.windowDays ?? null,
        subType: r.covariateNameParsed?.subType ?? null,
        detail: r.covariateNameParsed?.detail ?? null,
      });
    }
    const row = covMap.get(r.covariateId);
    const id = r.databaseId;
    row[`caseCount_${id}`] = r.caseCount;
    row[`caseAverage_${id}`] = r.caseAverage;
    row[`nonCaseCount_${id}`] = r.nonCaseCount;
    row[`nonCaseAverage_${id}`] = r.nonCaseAverage;
    row[`SMD_${id}`] = r.SMD;
    row[`absSMD_${id}`] = r.absSMD;
  }

  return { rfRef, pivoted: [...covMap.values()] };
}

function pivotContinuous(rows: any[]) {
  if (!rows.length) return { rfRef: [], pivoted: [] };

  const dbMap = new Map<string, any>();
  for (const r of rows) {
    if (!dbMap.has(r.databaseId)) {
      dbMap.set(r.databaseId, {
        id: r.databaseId,
        databaseName: r.databaseName,
        caseN: r.casePersonCount,
        targetN: r.targetPersonCount,
      });
    }
  }
  const rfRef = [...dbMap.values()];

  const covMap = new Map<number, any>();
  for (const r of rows) {
    if (!covMap.has(r.covariateId)) {
      covMap.set(r.covariateId, {
        covariateName: r.covariateName,
        covariateId: r.covariateId,
        domain: r.covariateNameParsed?.domain ?? null,
        concept: r.covariateNameParsed?.concept ?? null,
        timeWindow: r.covariateNameParsed?.timeWindow ?? null,
        windowDays: r.covariateNameParsed?.windowDays ?? null,
        subType: r.covariateNameParsed?.subType ?? null,
        detail: r.covariateNameParsed?.detail ?? null,
      });
    }
    const row = covMap.get(r.covariateId);
    const id = r.databaseId;
    row[`caseCountValue_${id}`] = r.caseCountValue;
    row[`caseAverageValue_${id}`] = r.caseAverageValue;
    row[`caseStandardDeviation_${id}`] = r.caseStandardDeviation;
    row[`caseMedianValue_${id}`] = r.caseMedianValue;
    row[`caseMinValue_${id}`] = r.caseMinValue;
    row[`caseMaxValue_${id}`] = r.caseMaxValue;
    row[`targetCountValue_${id}`] = r.targetCountValue;
    row[`targetAverageValue_${id}`] = r.targetAverageValue;
    row[`targetStandardDeviation_${id}`] = r.targetStandardDeviation;
    row[`targetMedianValue_${id}`] = r.targetMedianValue;
    row[`targetMinValue_${id}`] = r.targetMinValue;
    row[`targetMaxValue_${id}`] = r.targetMaxValue;
    row[`SMD_${id}`] = r.SMD;
    row[`absSMD_${id}`] = r.absSMD;
  }

  return { rfRef, pivoted: [...covMap.values()] };
}

async function fetchCaseCounts(targetId, outcomeId, databaseIds, tar) {
  const res = await StrategusService.characterization.getCaseCounts({
    targetIds: [targetId],
    outcomeIds: [outcomeId],
    databaseIds: databaseIds?.length ? databaseIds : undefined,
    riskWindowStart: tar?.riskWindowStart,
    riskWindowEnd: tar?.riskWindowEnd,
    startAnchor: tar?.startAnchor,
    endAnchor: tar?.endAnchor,
  });
  return res.data;
}

async function fetchCaseTargetCounts(targetId, outcomeId, databaseIds) {
  const res = await StrategusService.characterization.getCaseTargetCounts({
    targetIds: [targetId],
    outcomeIds: [outcomeId],
    databaseIds: databaseIds?.length ? databaseIds : undefined,
  });
  return res.data;
}

async function fetchBinaryRiskFactors(targetId, outcomeId, databaseIds, tar) {
  const res = await StrategusService.characterization.getBinaryRiskFactors({
    targetId,
    outcomeId,
    databaseIds: databaseIds?.length ? databaseIds : undefined,
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
  databaseIds,
  tar
) {
  const res = await StrategusService.characterization.getContinuousRiskFactors({
    targetId,
    outcomeId,
    databaseIds: databaseIds?.length ? databaseIds : undefined,
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
    !selectedDatabases.value.length ||
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
    const databaseIds = selectedDatabases.value;
    const tarIdx = tarOptions.value.indexOf(selectedTar.value);
    const tar = tarValues.value[tarIdx];

    if (!tar || !tar.startAnchor) {
      showResults.value = false;
      loaderState.value = "idle";
      return;
    }

    const [caseCounts, targetCounts, binary, continuous] = await Promise.all([
      fetchCaseCounts(targetId, outcomeId, databaseIds, tar),
      fetchCaseTargetCounts(targetId, outcomeId, databaseIds),
      fetchBinaryRiskFactors(targetId, outcomeId, databaseIds, tar),
      fetchContinuousRiskFactors(targetId, outcomeId, databaseIds, tar),
    ]);

    const washout = selectedWashout.value;
    const firstCaseRow = caseCounts.find(
      (r) => String(r.outcomeWashoutDays) === String(washout)
    );
    helpTextObs.value = firstCaseRow?.minPriorObservation ?? 365;

    const caseCountByDb = new Map<string, number>();
    for (const r of caseCounts) {
      if (String(r.outcomeWashoutDays) === String(washout)) {
        caseCountByDb.set(r.databaseId, r.personCount ?? 0);
      }
    }
    const targetCountByDb = new Map<string, number>();
    for (const r of targetCounts) {
      if (String(r.outcomeWashoutDays) === String(washout)) {
        targetCountByDb.set(
          r.databaseId,
          r.withoutExcludedPersonCount ?? r.personCount ?? 0
        );
      }
    }

    const filteredBinary = (binary ?? []).filter(
      (r) => String(r.outcomeWashoutDays) === String(washout)
    );
    const filteredContinuous = (continuous ?? [])
      .filter((r) => String(r.outcomeWashoutDays) === String(washout))
      .map((r) => ({
        ...r,
        casePersonCount: caseCountByDb.get(r.databaseId) ?? 0,
        targetPersonCount: targetCountByDb.get(r.databaseId) ?? 0,
      }));

    const binPivot = pivotBinary(filteredBinary);
    const contPivot = pivotContinuous(filteredContinuous);

    binaryRfRef.value = binPivot.rfRef;
    binaryRows.value = binPivot.pivoted;
    continuousRfRef.value = contPivot.rfRef;
    continuousRows.value = contPivot.pivoted;

    if (Date.now() - loadStart >= 600) {
      loaderState.value = "success";
      await new Promise((r) => setTimeout(r, 1100));
    }
    loaderState.value = "idle";
    await new Promise((r) => setTimeout(r, 220));
    showResults.value = true;
    lastGeneratedConfig.value = {
      outcomeName: outcomeName.value,
      selectedDatabaseNames: selectedDatabaseNames.value,
      selectedDatabaseIds: [...databaseIds],
      selectedOutcome: selectedOutcome?.value?.cohortId,
      selectedTar: selectedTar.value,
      selectedWashout: selectedWashout.value,
    };
    emit("state-change", {
      outcomeId: selectedOutcome.value.cohortId,
      databaseIds,
      tar: selectedTar.value,
      washout: selectedWashout.value,
      databases: selectedDatabaseNames.value,
      ctxItems: [
        outcomeName.value,
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
    !selectedDatabases.value.length ||
    !selectedOutcome.value ||
    !selectedWashout.value
  )
    return true;
  if (!lastGeneratedConfig.value) return false;
  const sameIds =
    selectedDatabases.value.length ===
      lastGeneratedConfig.value.selectedDatabaseIds?.length &&
    selectedDatabases.value.every((id) =>
      lastGeneratedConfig.value.selectedDatabaseIds.includes(id)
    );
  return (
    sameIds &&
    selectedOutcome.value.cohortId ===
      lastGeneratedConfig.value.selectedOutcome &&
    selectedTar.value === lastGeneratedConfig.value.selectedTar &&
    selectedWashout.value === lastGeneratedConfig.value.selectedWashout
  );
});

const isFullscreen = ref(false);
const isFullscreenLeaving = ref(false);

function exitFullscreen() {
  isFullscreenLeaving.value = true;
  setTimeout(() => {
    isFullscreen.value = false;
    isFullscreenLeaving.value = false;
  }, 230);
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && isFullscreen.value) exitFullscreen();
}

onUnmounted(() => window.removeEventListener("keydown", onKeydown));

onMounted(async () => {
  window.addEventListener("keydown", onKeydown);
  const url = props.initialUrlState;

  if (url?.outcomeId && outcomeOptions.value.length) {
    const match = outcomeOptions.value.find(
      (o) => o.cohortId === url.outcomeId
    );
    if (match) selectedOutcome.value = match;
  }

  if (url?.databaseIds?.length) {
    const valid = url.databaseIds.filter((id) =>
      availableDatabases.value.some((d) => d.id === id)
    );
    if (valid.length) selectedDatabases.value = valid;
  } else if (
    url?.databaseId &&
    availableDatabases.value.some((d) => d.id === url.databaseId)
  ) {
    selectedDatabases.value = [url.databaseId];
  }

  await nextTick();

  if (url?.tar && tarOptions.value.includes(url.tar))
    selectedTar.value = url.tar;
  if (url?.washout && washoutOptions.value.includes(url.washout))
    selectedWashout.value = url.washout;

  await nextTick();
  if (
    selectedOutcome.value &&
    selectedDatabases.value.length &&
    selectedTar.value &&
    selectedWashout.value
  ) {
    await generate();
  }
});
</script>

<style scoped>
@import "../shared/styles.css";

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

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.section-header h3 {
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.fullscreen-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-subtle);
  padding: 4px;
  border-radius: 4px;
  transition: color 0.15s ease, background 0.15s ease;
}

.fullscreen-btn:hover {
  color: var(--color-interactive-hover);
  background: var(--color-overlay-subtle);
}

.fullscreen-btn:focus-visible {
  outline: none;
}

.results-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 1001;
  border-radius: 0;
  max-width: none;
  padding: 1.25rem 1.75rem;
  background: var(--color-bg-page);
  overflow-y: auto;
  animation: rf-fs-enter 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.results-fullscreen.results-leaving {
  animation: rf-fs-leave 0.22s cubic-bezier(0.4, 0, 1, 1) forwards;
}

@keyframes rf-fs-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes rf-fs-leave {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
</style>
