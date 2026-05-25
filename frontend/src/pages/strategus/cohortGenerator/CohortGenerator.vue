<template>
  <div class="cohort-generator">
    <div class="section-header">
      <h3>Cohorts</h3>
    </div>

    <div class="pill-nav-row">
      <PillNav v-model="activeTab" :tabs="tabs" />
    </div>

    <Message v-if="error" severity="error" :closable="false" class="mt-3">
      Unable to reach the backend. Check that the server is running.
    </Message>

    <Transition v-else name="tab-fade" mode="out-in">
      <div :key="activeTab">
        <CohortCounts
          v-if="activeTab === 0"
          :rows="countRows"
          :loading="countsLoading"
        />
        <CohortGeneration v-else-if="activeTab === 1" />
        <CohortDefinition
          v-else-if="activeTab === 2"
          :cohortList="cohortList"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import Message from "primevue/message";
import PillNav from "@/shared/ui/pillNav";
import CohortCounts from "./cohortCounts";
import CohortGeneration from "./cohortGeneration";
import CohortDefinition from "./cohortDefinition";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { useCohortUrl } from "@/shared/lib/composables/useCohortUrl";

const { readUrl, updateUrl, clearGenerationParams } = useCohortUrl();

const activeTab = ref(readUrl().cohortTab ?? 0);

watch(activeTab, (val, old) => {
  updateUrl({ cohortTab: val });
  if (old === 1) clearGenerationParams();
});
const tabs = [
  { key: "counts", label: "Cohort Counts" },
  { key: "generation", label: "Cohort Generation" },
  { key: "definition", label: "Cohort Definition" },
];

const cohortList = ref<any[]>([]);
const countRows = ref<any[]>([]);
const countsLoading = ref(false);
const error = ref(false);

onMounted(async () => {
  countsLoading.value = true;
  try {
    const [defsRes, countsRes] = await Promise.all([
      StrategusService.cohorts.getDefinitions(),
      StrategusService.cohorts.getCounts(),
    ]);
    cohortList.value = defsRes.data ?? [];
    countRows.value = countsRes.data ?? [];
  } catch (e) {
    console.error("Failed to load cohort data:", e);
    error.value = true;
  } finally {
    countsLoading.value = false;
  }
});
</script>

<style scoped>
.cohort-generator {
  max-width: 1400px;
}

.section-header {
  margin-bottom: 1rem;
}

.section-header h3 {
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.pill-nav-row {
  margin-bottom: 0.75rem;
}

.tab-fade-leave-active {
  transition: opacity 0.1s ease;
}

.tab-fade-enter-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
}

.tab-fade-enter-from {
  transform: translateY(4px);
}
</style>
