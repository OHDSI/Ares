<template>
  <div class="dechal-rechal">
    <div class="section">
      <label class="field-label">Outcome</label>
      <OutcomeSelector v-model="selectedOutcome" :options="outcomeOptions" />

      <GenerateButton :disabled="generateDisabled" @click="generate" />
    </div>

    <ContextBar
      v-if="showResults"
      :items="[targetName, lastGeneratedConfig.outcomeName]"
    />

    <Message
      v-if="showResults && targetWarning"
      severity="warn"
      :closable="false"
    >
      The target cohort does not have multiple records per person - rechallenge
      attempts cannot be observed.
    </Message>
    <Message
      v-if="showResults && outcomeWarning"
      severity="warn"
      :closable="false"
    >
      The outcome cohort does not have multiple records per person - rechallenge
      attempts cannot be observed.
    </Message>

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
        <h3>Dechallenge / Rechallenge</h3>
        <button
          class="fullscreen-btn"
          title="Exit fullscreen (Esc)"
          @click="exitFullscreen"
        >
          <SvgIcon :path="mdiFullscreenExit" :size="18" />
        </button>
      </div>
      <DrTable
        :data="tableData"
        :isFullscreen="isFullscreen"
        :targetId="props.targetRow?.cohortId"
        :outcomeId="selectedOutcome?.cohortId"
        @update:fullscreen="isFullscreen = $event"
      />
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
import OutcomeSelector from "../shared/outcomeSelector";
import ContextBar from "../shared/contextBar";
import GenerateButton from "@/pages/strategus/characterization/shared/generateButton";
import Message from "primevue/message";
import SvgIcon from "@/shared/ui/svgIcon";
import { mdiFullscreenExit } from "@mdi/js";
import DrTable from "./drTable";

import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { useStore } from "vuex";

const store = useStore();

const props = defineProps({
  targetRow: { type: Object },
  outcomeTable: { type: Array },
  initialUrlState: { type: Object, default: null },
});

const emit = defineEmits(["state-change"]);

const isFullscreen = ref(false);
const isFullscreenLeaving = ref(false);

function exitFullscreen() {
  isFullscreenLeaving.value = true;
  setTimeout(() => {
    isFullscreen.value = false;
    isFullscreenLeaving.value = false;
  }, 230);
}

const loading = ref(false);
const showResults = ref(false);
const loaderState = ref("idle");
const selectedOutcome = ref(null);
const tableData = ref([]);
const targetWarning = ref(false);
const outcomeWarning = ref(false);
const lastGeneratedConfig = ref(null);

const outcomeOptions = computed(() => props.outcomeTable ?? []);
const targetName = computed(() => props.targetRow?.cohortName ?? "");
const outcomeName = computed(() => selectedOutcome.value?.cohortName ?? "");

watch(
  () => props.targetRow,
  () => {
    showResults.value = false;
    tableData.value = [];
  }
);

async function fetchDechalRechalData(targetId: number, outcomeId: number) {
  const res = await StrategusService.characterization.getDechallengeRechallenge(
    [targetId],
    [outcomeId]
  );
  return res.data;
}

async function fetchIsUniquePeople(cohortId: number) {
  const res = await StrategusService.characterization.getCohortUniquePeople(
    cohortId
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
    const targetId = props.targetRow.cohortId;
    const outcomeId = selectedOutcome.value.cohortId;

    const [data, targetUnique, outcomeUnique] = await Promise.all([
      fetchDechalRechalData(targetId, outcomeId),
      fetchIsUniquePeople(targetId),
      fetchIsUniquePeople(outcomeId),
    ]);

    tableData.value = data;
    targetWarning.value = targetUnique.isUnique;
    outcomeWarning.value = outcomeUnique.isUnique;
    if (Date.now() - loadStart >= 600) {
      loaderState.value = "success";
      await new Promise((r) => setTimeout(r, 1100));
    }
    loaderState.value = "idle";
    await new Promise((r) => setTimeout(r, 220));
    showResults.value = true;
    lastGeneratedConfig.value = {
      outcome: outcomeId,
      outcomeName: outcomeName.value,
    };
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

function onKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape" && isFullscreen.value) exitFullscreen();
}

onMounted(async () => {
  window.addEventListener("keydown", onKeyDown);

  const url = props.initialUrlState;

  if (url?.outcomeId && outcomeOptions.value.length) {
    const match = outcomeOptions.value.find(
      (o) => o.cohortId === url.outcomeId
    );
    if (match) selectedOutcome.value = match;
  }

  await nextTick();
  if (selectedOutcome.value) await generate();
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
});
</script>

<style scoped>
@import "../shared/styles.css";

.dechal-rechal {
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
  animation: dr-fs-enter 0.28s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.results-fullscreen.results-leaving {
  animation: dr-fs-leave 0.22s cubic-bezier(0.4, 0, 1, 1) forwards;
}

@keyframes dr-fs-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes dr-fs-leave {
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
