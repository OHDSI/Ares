<template>
  <div class="case-series">
    <div class="section">
      <label class="field-label">Outcome</label>
      <OutcomeSelector
        v-model="selectedOutcome"
        :options="outcomeOptions"
        :availabilityKey="props.outcomeAvailKey"
      />

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
          <GenerateButton :disabled="generateDisabled" @click="generate" />
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
        <h3>Case Series</h3>
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
            <CsBinaryTable
              :data="binaryRows"
              :phases="binaryPhases"
              :isFullscreen="isFullscreen"
              @update:fullscreen="isFullscreen = $event"
            />
          </div>

          <div v-else-if="activeResultTab === 1">
            <CsContinuousTable
              :data="continuousRows"
              :phases="continuousPhases"
              :isFullscreen="isFullscreen"
              @update:fullscreen="isFullscreen = $event"
            />
          </div></div
      ></Transition>
    </div>

    <div v-else-if="!loading" class="section empty-state">
      Select an outcome, database, TAR, and washout, then click Generate.
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
import Dropdown from "primevue/dropdown";
import GenerateButton from "@/pages/strategus/characterization/shared/generateButton";

import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { useStore } from "vuex";
import SvgIcon from "@/shared/ui/svgIcon";
import { mdiFullscreenExit } from "@mdi/js";
import CsBinaryTable from "./csBinaryTable";
import CsContinuousTable from "./csContinuousTable";

const store = useStore();

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

const props = defineProps({
  targetRow: { type: Object },
  outcomeTable: { type: Array },
  outcomeAvailKey: { type: String, default: null },
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
        domain: r.covariateNameParsed?.domain ?? null,
        concept: r.covariateNameParsed?.concept ?? null,
        timeWindow: r.covariateNameParsed?.timeWindow ?? null,
        windowDays: r.covariateNameParsed?.windowDays ?? null,
        subType: r.covariateNameParsed?.subType ?? null,
        detail: r.covariateNameParsed?.detail ?? null,
        minPriorObservation: r.minPriorObservation,
        outcomeWashoutDays: r.outcomeWashoutDays,
        casePostOutcomeDuration: r.casePostOutcomeDuration,
        casePreTargetDuration: r.casePreTargetDuration,
      });
    }
    const row = map.get(key);
    const av = r.averageValue ?? 0;
    row[`sumValue_${r.type}`] =
      av < 0 ? -Math.abs(r.sumValue ?? 0) : r.sumValue ?? 0;
    row[`averageValue_${r.type}`] = av;
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
        domain: r.covariateNameParsed?.domain ?? null,
        concept: r.covariateNameParsed?.concept ?? null,
        timeWindow: r.covariateNameParsed?.timeWindow ?? null,
        windowDays: r.covariateNameParsed?.windowDays ?? null,
        subType: r.covariateNameParsed?.subType ?? null,
        detail: r.covariateNameParsed?.detail ?? null,
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
      databases: [selectedDatabaseName.value],
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
  window.addEventListener("keydown", onKeydown);
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

onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>

<style scoped>
@import "../shared/styles.css";

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
  color: var(--color-text-muted);
  padding: 0 0.25rem;
  margin: 0;
  line-height: 1.4;
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
  animation: cs-fs-enter 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.results-fullscreen.results-leaving {
  animation: cs-fs-leave 0.22s cubic-bezier(0.4, 0, 1, 1) forwards;
}

@keyframes cs-fs-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes cs-fs-leave {
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
