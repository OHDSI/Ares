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
          <GenerateButton :disabled="generateDisabled" @click="generate" />
        </div>
      </div>
    </div>

    <ContextBar
      v-if="showResults"
      :items="[
        targetName,
        `vs ${lastGeneratedConfig.comparator}`,
        lastGeneratedConfig.database,
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
        <h3>Cohort Comparison</h3>
        <button
          class="fullscreen-btn"
          title="Exit fullscreen (Esc)"
          @click="exitFullscreen"
        >
          <SvgIcon :path="mdiFullscreenExit" :size="18" />
        </button>
      </div>
      <ViewToggle v-model="activeResultTab" :tabs="resultTabs" />

      <Transition name="tab-fade" mode="out-in">
        <div :key="activeResultTab">
          <div v-if="activeResultTab === 0">
            <p class="table-note" v-if="covRef.length">
              Fraction of patients ({{ covRef[0]?.minPriorObservation }}d prior
              obs.) with each binary feature.
            </p>
            <CcBinaryTable
              :data="binaryRows"
              :covRef="covRef"
              :targetCohortId="targetRow?.cohortId"
              :isFullscreen="isFullscreen"
              :smdMax="smdMax"
              @update:fullscreen="onFullscreenChange"
            />
          </div>
          <div v-if="activeResultTab === 1">
            <CcBinaryPlot
              :data="binaryRows"
              :covRef="covRef"
              :selectedDatabaseName="selectedDatabaseName"
            />
          </div>
          <div v-if="activeResultTab === 2">
            <p class="table-note" v-if="covRef.length">
              Continuous feature distributions ({{
                covRef[0]?.minPriorObservation
              }}d prior obs.) across cohorts.
            </p>
            <CcContinuousTable
              :data="continuousRows"
              :covRef="covRef"
              :targetCohortId="targetRow?.cohortId"
              :isFullscreen="isFullscreen"
              :smdMax="smdMax"
              @update:fullscreen="onFullscreenChange"
            />
          </div>
        </div>
      </Transition>
    </div>

    <div v-else-if="!loading" class="section empty-state">
      Select a comparator and database, then click Generate.
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
import Dropdown from "primevue/dropdown";

import ResultsLoader from "../shared/resultsLoader";
import ViewToggle from "../shared/viewToggle";
import OutcomeSelector from "../shared/outcomeSelector";
import ContextBar from "../shared/contextBar";
import { useAvailableDatabases } from "../shared/useAvailableDatabases";
import GenerateButton from "@/pages/strategus/characterization/shared/generateButton";
import SvgIcon from "@/shared/ui/svgIcon";
import { mdiFullscreenExit } from "@mdi/js";

import CcBinaryTable from "./ccBinaryTable";
import CcBinaryPlot from "./ccBinaryPlot";
import CcContinuousTable from "./ccContinuousTable";

import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { useCharacterizationUrl } from "@/shared/lib/composables/useCharacterizationUrl";

const props = defineProps({
  targetRow: { type: Object },
  targetTable: { type: Array },
  initialUrlState: { type: Object, default: null },
});

const emit = defineEmits(["state-change"]);

const { updateUrl } = useCharacterizationUrl();

const loading = ref(false);
const showResults = ref(false);
const loaderState = ref("idle");
const lastGeneratedConfig = ref(null);

const isFullscreen = ref(false);
const isFullscreenLeaving = ref(false);

function exitFullscreen() {
  isFullscreenLeaving.value = true;
  setTimeout(() => {
    isFullscreen.value = false;
    isFullscreenLeaving.value = false;
  }, 230);
}

function onFullscreenChange(val: boolean) {
  if (!val) {
    exitFullscreen();
  } else {
    isFullscreen.value = val;
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && isFullscreen.value) exitFullscreen();
}

const activeResultTab = ref(0);
watch(activeResultTab, (val) => updateUrl({ ccView: val }));
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
const smdMax = ref(2);

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
    binaryRows.value = (binaryResult.covariates ?? []).map((r: any) => ({
      ...r,
      ...(r.covariateNameParsed ?? {}),
    }));

    const continuousResult = await fetchContinuousData(targetIds, dbId);
    continuousRows.value = (continuousResult.covariates ?? []).map(
      (r: any) => ({ ...r, ...(r.covariateNameParsed ?? {}) })
    );

    if (Date.now() - loadStart >= 600) {
      loaderState.value = "success";
      await new Promise((r) => setTimeout(r, 1100));
    }
    loaderState.value = "idle";
    await new Promise((r) => setTimeout(r, 220));
    lastGeneratedConfig.value = {
      database: selectedDatabaseName.value,
      comparator: comparatorName.value,
    };
    showResults.value = true;

    emit("state-change", {
      comparatorId: selectedComparator.value.cohortId,
      databaseId: selectedDatabase.value,
      databases: [selectedDatabaseName.value],
      ctxItems: [`vs ${comparatorName.value}`],
    });

    smdMax.value = 2;
  } catch {
    loaderState.value = "error";
  } finally {
    loading.value = false;
  }
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
  window.addEventListener("keydown", onKeydown);
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
    if (url?.ccView != null) activeResultTab.value = url.ccView;
  }
});

onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>

<style scoped>
@import "../shared/styles.css";

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

.results-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 1001;
  border-radius: 0;
  max-width: none;
  padding: 1.25rem 1.75rem;
  background: var(--color-bg-page);
  overflow-y: auto;
  animation: cc-fs-enter 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.results-fullscreen.results-leaving {
  animation: cc-fs-leave 0.22s cubic-bezier(0.4, 0, 1, 1) forwards;
}

@keyframes cc-fs-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes cc-fs-leave {
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
