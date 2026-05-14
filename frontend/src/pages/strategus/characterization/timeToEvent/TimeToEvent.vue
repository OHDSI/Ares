<template>
  <div class="time-to-event">
    <div class="section">
      <label class="field-label">Outcome</label>
      <OutcomeSelector
        v-model="selectedOutcome"
        :options="outcomeOptions"
        :availabilityKey="props.outcomeAvailKey"
      />

      <GenerateButton :disabled="generateDisabled" @click="generate" />
    </div>

    <ContextBar
      v-if="showResults"
      :items="[targetName, lastGeneratedConfig.outcomeName]"
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
        <h3>Time to Event</h3>
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
            <TtePlot :data="allData" :darkMode="darkMode" />
          </div>

          <div v-else-if="activeResultTab === 1">
            <TteTable
              :data="allData"
              :isFullscreen="isFullscreen"
              @update:fullscreen="isFullscreen = $event"
            />
          </div></div
      ></Transition>
    </div>

    <div v-else-if="!loading" class="section empty-state">
      Select an outcome, then click Generate.
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
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { useStore } from "vuex";
import { useCharacterizationUrl } from "@/shared/lib/composables/useCharacterizationUrl";
import SvgIcon from "@/shared/ui/svgIcon";
import { mdiFullscreenExit } from "@mdi/js";
import TtePlot from "./ttePlot";
import TteTable from "./tteTable";

const store = useStore();
const darkMode = computed(() => store.getters.getSettings.darkMode);

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

const { updateUrl } = useCharacterizationUrl();

const loading = ref(false);
const showResults = ref(false);
const loaderState = ref("idle");
const selectedOutcome = ref(null);
const allData = ref([]);

const activeResultTab = ref(0);
watch(activeResultTab, (val) => updateUrl({ tteView: val }));
const resultTabs = [
  { key: "plots", label: "Plots" },
  { key: "table", label: "Table" },
];

const lastGeneratedConfig = ref(null);

const outcomeOptions = computed(() => props.outcomeTable ?? []);
const targetName = computed(() => props.targetRow?.cohortName ?? "");
const outcomeName = computed(() => selectedOutcome.value?.cohortName ?? "");

watch(
  () => props.targetRow,
  () => {
    showResults.value = false;
    allData.value = [];
  }
);

async function fetchTimeToEventData(targetId, outcomeId) {
  const res = await StrategusService.characterization.getTimeToEvent(
    [targetId],
    [outcomeId]
  );
  return res.data;
}

async function generate() {
  if (!selectedOutcome.value || !props.targetRow) {
    showResults.value = false;
    return;
  }

  showResults.value = false;
  loading.value = true;
  loaderState.value = "loading";
  const loadStart = Date.now();
  try {
    const data = await fetchTimeToEventData(
      props.targetRow.cohortId,
      selectedOutcome.value.cohortId
    );
    allData.value = data;

    if (Date.now() - loadStart >= 600) {
      loaderState.value = "success";
      await new Promise((r) => setTimeout(r, 1100));
    }
    loaderState.value = "idle";
    await new Promise((r) => setTimeout(r, 220));
    lastGeneratedConfig.value = {
      outcome: selectedOutcome.value.cohortId,
      outcomeName: outcomeName.value,
    };
    showResults.value = true;
    emit("state-change", {
      outcomeId: selectedOutcome.value.cohortId,
      ctxItems: [outcomeName.value],
    });
  } catch {
    loaderState.value = "error";
  } finally {
    loading.value = false;
  }
}

const generateDisabled = computed(() => {
  if (!selectedOutcome.value) return true;
  if (!lastGeneratedConfig.value) return false;
  return selectedOutcome.value.cohortId === lastGeneratedConfig.value.outcome;
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
  await nextTick();
  if (selectedOutcome.value) {
    await generate();
    if (url?.tteView != null) activeResultTab.value = url.tteView;
  }
});

onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>

<style scoped>
@import "../shared/styles.css";

.time-to-event {
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
  animation: tte-fs-enter 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.results-fullscreen.results-leaving {
  animation: tte-fs-leave 0.22s cubic-bezier(0.4, 0, 1, 1) forwards;
}

@keyframes tte-fs-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes tte-fs-leave {
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
