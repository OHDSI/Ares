<template>
  <div class="db-comparison">
    <div class="section">
      <div class="controls">
        <div class="control-databases">
          <label>Databases</label>
          <MultiSelect
            v-model="selectedDatabases"
            :options="availableDatabases"
            optionLabel="name"
            optionValue="id"
            placeholder="Select databases"
            filter
            :pt="colSelectorPt"
            display="chip"
            class="w-full"
          />
        </div>
        <div class="control-threshold">
          <label>Threshold: {{ minThreshold }}</label>
          <Slider
            v-model="minThreshold"
            :min="minCharVal"
            :max="1"
            :step="0.01"
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
        lastGeneratedConfig.databases.join(', '),
        `Threshold ${lastGeneratedConfig.threshold}`,
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
        <h3>Database Comparison</h3>
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
            <DbBinaryTable
              :data="binaryRows"
              :cov-ref="covRef"
              :is-fullscreen="isFullscreen"
              @update:fullscreen="isFullscreen = $event"
            />
          </div>
          <div v-else-if="activeResultTab === 1">
            <DbBinaryPlot :data="binaryRows" :cov-ref="covRef" />
          </div>
          <div v-else-if="activeResultTab === 2">
            <DbContinuousTable
              :data="continuousRows"
              :cov-ref="covRef"
              :is-fullscreen="isFullscreen"
              @update:fullscreen="isFullscreen = $event"
            />
          </div></div
      ></Transition>
    </div>

    <div v-else-if="!loading" class="section empty-state">
      Select at least 2 databases, then click Generate.
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

import MultiSelect from "primevue/multiselect";
import { colSelectorPt } from "../shared/colSelectorPt";
import Slider from "primevue/slider";
import GenerateButton from "@/pages/strategus/characterization/shared/generateButton";
import SvgIcon from "@/shared/ui/svgIcon";
import { mdiFullscreenExit } from "@mdi/js";

import ResultsLoader from "../shared/resultsLoader";
import ViewToggle from "../shared/viewToggle";
import ContextBar from "../shared/contextBar";
import { useAvailableDatabases } from "../shared/useAvailableDatabases";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { useCharacterizationUrl } from "@/shared/lib/composables/useCharacterizationUrl";

import DbBinaryTable from "./dbBinaryTable";
import DbBinaryPlot from "./dbBinaryPlot";
import DbContinuousTable from "./dbContinuousTable";

const props = defineProps({
  targetRow: { type: Object },
  initialUrlState: { type: Object, default: null },
});

const emit = defineEmits(["state-change"]);

const { updateUrl, patchUrl } = useCharacterizationUrl();

const activeResultTab = ref(0);
watch(activeResultTab, (val) => updateUrl({ dbView: val }));
const resultTabs = [
  { key: "binary", label: "Binary Table" },
  { key: "plot", label: "Binary Plot" },
  { key: "continuous", label: "Continuous Table" },
];

const loading = ref(false);
const showResults = ref(false);
const loaderState = ref("idle");

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

const minCharVal = ref(0);
const minThreshold = ref(0.01);

watch(minThreshold, (val) => {
  patchUrl({ dbThresh: val !== 0.01 ? String(val) : null });
});
const selectedDatabases = ref([]);

const binaryRows = ref([]);
const continuousRows = ref([]);
const covRef = ref([]);

const availableDatabases = useAvailableDatabases(toRef(props, "targetRow"));

const targetName = computed(() => props.targetRow?.cohortName ?? "");

watch(
  () => props.targetRow,
  () => {
    showResults.value = false;
    binaryRows.value = [];
    continuousRows.value = [];
    covRef.value = [];
  }
);

fetchMinThreshold();

async function fetchMinThreshold() {
  try {
    minCharVal.value = 0.01;
  } catch {
    minCharVal.value = 0;
  }
}

async function fetchBinaryData(targetIds, databaseIds, threshold) {
  const res = await StrategusService.characterization.getCohortBinary(
    targetIds,
    databaseIds,
    threshold
  );
  return res.data;
}

async function fetchContinuousData(targetIds, databaseIds, threshold) {
  const res = await StrategusService.characterization.getCohortContinuous(
    targetIds,
    databaseIds,
    threshold
  );
  return res.data;
}

async function generate() {
  showResults.value = false;
  if (!selectedDatabases.value.length || !props.targetRow) {
    showResults.value = false;
    return;
  }

  loading.value = true;
  loaderState.value = "loading";
  const loadStart = Date.now();
  try {
    const targetIds = [props.targetRow.cohortId];
    const dbIds = selectedDatabases.value;

    const binaryResult = await fetchBinaryData(
      targetIds,
      dbIds,
      minThreshold.value
    );

    if (!binaryResult.covRef?.length) {
      showResults.value = false;
      loaderState.value = "idle";
      return;
    }

    covRef.value = binaryResult.covRef;
    binaryRows.value = binaryResult.covariates.map((r) => ({
      ...r,
      ...(r.covariateNameParsed ?? {}),
    }));

    const continuousResult = await fetchContinuousData(
      targetIds,
      dbIds,
      minThreshold.value
    );
    continuousRows.value = (continuousResult.covariates ?? []).map((r) => ({
      ...r,
      ...(r.covariateNameParsed ?? {}),
    }));

    if (Date.now() - loadStart >= 600) {
      loaderState.value = "success";
      await new Promise((r) => setTimeout(r, 1100));
    }
    loaderState.value = "idle";
    await new Promise((r) => setTimeout(r, 220));
    showResults.value = true;

    lastGeneratedConfig.value = {
      databaseIds: [...selectedDatabases.value],
      databases: availableDatabases.value
        .filter((d) => selectedDatabases.value.includes(d.id))
        .map((d) => d.name),
      threshold: minThreshold.value,
    };
    emit("state-change", {
      databaseIds: selectedDatabases.value,
      databases: lastGeneratedConfig.value.databases,
      ctxItems: [`Threshold ${minThreshold.value}`],
    });
  } catch {
    loaderState.value = "error";
  } finally {
    loading.value = false;
  }
}

const lastGeneratedConfig = ref(null);

const generateDisabled = computed(() => {
  if (selectedDatabases.value.length < 2) return true;
  if (!lastGeneratedConfig.value) return false;
  return (
    minThreshold.value === lastGeneratedConfig.value.threshold &&
    selectedDatabases.value.length ===
      lastGeneratedConfig.value.databaseIds.length &&
    selectedDatabases.value.every((id) =>
      lastGeneratedConfig.value.databaseIds.includes(id)
    )
  );
});

onMounted(async () => {
  window.addEventListener("keydown", onKeydown);
  const url = props.initialUrlState;
  await nextTick();

  const dbs = availableDatabases.value;
  if (url?.databaseIds?.length) {
    const valid = url.databaseIds.filter((id) => dbs.some((d) => d.id === id));
    if (valid.length) selectedDatabases.value = valid;
  }

  if (url?.dbThresh != null) minThreshold.value = url.dbThresh;

  if (selectedDatabases.value.length >= 2) {
    await generate();
    if (url?.dbView != null) activeResultTab.value = url.dbView;
  }
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>

<style scoped>
@import "../shared/styles.css";

.db-comparison {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.controls {
  display: flex;
  gap: 1.25rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.controls label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--color-text-label);
}

.control-databases {
  flex: 1;
  min-width: 280px;
  max-width: 500px;
  display: block;
  font-weight: 600;
  font-size: 0.8125rem;
  margin-bottom: 0.25rem;
  color: var(--color-text-label);
}

.control-threshold {
  min-width: 180px;
  max-width: 250px;
  align-self: center;
  font-size: 0.8125rem;
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
  animation: dc-fs-enter 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.results-fullscreen.results-leaving {
  animation: dc-fs-leave 0.22s cubic-bezier(0.4, 0, 1, 1) forwards;
}

@keyframes dc-fs-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes dc-fs-leave {
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
