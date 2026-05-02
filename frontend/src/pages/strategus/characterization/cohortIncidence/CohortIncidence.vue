<template>
  <div class="incidence-rates">
    <div class="section">
      <label class="field-label">Outcomes</label>
      <OutcomeSelector
        v-model="selectedOutcomes"
        :options="outcomeOptions"
        :multiple="true"
      />

      <GenerateButton :disabled="generateDisabled" @click="generate" />
    </div>

    <ContextBar
      v-if="showResults"
      :items="[targetName, lastGeneratedConfig.outcomeNames]"
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
        <h3>Cohort Incidence</h3>
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
            <IncidenceTable
              :data="fullData"
              :isFullscreen="isFullscreen"
              @update:fullscreen="isFullscreen = $event"
            />
          </div>

          <div v-else-if="activeResultTab === 1">
            <IncidencePlot :data="fullData" :darkMode="darkMode" />
          </div></div
      ></Transition>
    </div>

    <div v-else-if="!loading" class="section empty-state">
      Select one or more outcomes, then click Generate.
    </div>

    <ResultsLoader :loader-state="loaderState" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";

import ResultsLoader from "../shared/resultsLoader";
import ViewToggle from "../shared/viewToggle";
import OutcomeSelector from "../shared/outcomeSelector";
import ContextBar from "../shared/contextBar";
import GenerateButton from "@/pages/strategus/characterization/shared/generateButton";
import SvgIcon from "@/shared/ui/svgIcon";
import { mdiFullscreenExit } from "@mdi/js";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { useStore } from "vuex";
import IncidenceTable from "./incidenceTable";
import IncidencePlot from "./incidencePlot";

const store = useStore();
const darkMode = computed(() => store.getters.getSettings.darkMode);

const props = defineProps({
  targetRow: { type: Object },
  outcomeTable: { type: Array },
  initialUrlState: { type: Object, default: null },
});

const emit = defineEmits(["state-change"]);

const loading = ref(false);
const showResults = ref(false);
const loaderState = ref("idle");
const selectedOutcomes = ref([]);

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

const fullData = ref([]);
const lastGeneratedConfig = ref(null);

const activeResultTab = ref(0);
const resultTabs = [
  { key: "table", label: "Table" },
  { key: "plots", label: "Plots" },
];

const outcomeOptions = computed(() =>
  (props.outcomeTable ?? []).filter((r) => r.cohortIncidence === 1)
);
const targetName = computed(() => props.targetRow?.cohortName ?? "");

watch(
  () => props.targetRow,
  () => {
    showResults.value = false;
    fullData.value = [];
  }
);

async function fetchIncidenceData(targetId, outcomeIds) {
  const res = await StrategusService.characterization.getIncidenceRates(
    [targetId],
    outcomeIds
  );
  return res.data;
}

async function generate() {
  if (!selectedOutcomes.value.length || !props.targetRow) {
    showResults.value = false;
    return;
  }

  showResults.value = false;
  loading.value = true;
  loaderState.value = "loading";
  const loadStart = Date.now();
  try {
    const outcomeIds = selectedOutcomes.value.map((o) => o.cohortId);
    const data = await fetchIncidenceData(props.targetRow.cohortId, outcomeIds);
    fullData.value = data;

    if (Date.now() - loadStart >= 600) {
      loaderState.value = "success";
      await new Promise((r) => setTimeout(r, 1100));
    }
    loaderState.value = "idle";
    await new Promise((r) => setTimeout(r, 220));
    showResults.value = true;

    lastGeneratedConfig.value = {
      selectedOutcomes: selectedOutcomes.value,
      outcomeNames: selectedOutcomes.value.map((o) => o.cohortName).join(", "),
    };
    emit("state-change", {
      outcomeIds: selectedOutcomes.value.map((o) => o.cohortId),
      ctxItems: [selectedOutcomes.value.map((o) => o.cohortName).join(", ")],
    });
  } catch {
    loaderState.value = "error";
  } finally {
    loading.value = false;
  }
}

const generateDisabled = computed(() => {
  if (!selectedOutcomes.value.length) return true;
  if (!lastGeneratedConfig.value) return false;
  return selectedOutcomes.value.every((id) =>
    lastGeneratedConfig.value.selectedOutcomes.includes(id)
  );
});

onMounted(async () => {
  window.addEventListener("keydown", onKeydown);
  const url = props.initialUrlState;
  if (url?.outcomeIds?.length && outcomeOptions.value.length) {
    const matches = outcomeOptions.value.filter((o) =>
      url.outcomeIds.includes(o.cohortId)
    );
    if (matches.length) selectedOutcomes.value = matches;
  }
  await nextTick();
  if (selectedOutcomes.value.length) {
    await generate();
  }
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>

<style scoped>
@import "../shared/styles.css";

.incidence-rates {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
  animation: ci-fs-enter 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.results-fullscreen.results-leaving {
  animation: ci-fs-leave 0.22s cubic-bezier(0.4, 0, 1, 1) forwards;
}

@keyframes ci-fs-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes ci-fs-leave {
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
