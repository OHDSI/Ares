<template>
  <div class="char-viewer">
    <Transition name="state-fade" mode="out-in">
      <div v-if="!selectedTarget" class="target-section">
        <div class="section-header">
          <h3>Select Target Cohort</h3>
          <span class="section-sub"
            >Choose a target to explore characterization results</span
          >
        </div>
        <div class="section">
          <DataTable
            :value="targetTable"
            v-model:selection="selectedTarget"
            selectionMode="single"
            dataKey="cohortId"
            :paginator="targetTable.length > 15"
            :rows="10"
            :rowsPerPageOptions="[10, 15, 25, 50]"
            filterDisplay="row"
            size="small"
            v-model:filters="targetFilters"
            :striped-rows="store.getters.getSettings.strippedRows"
            class="target-table"
            :loading="loadingTargets"
            removableSort
          >
            <Column selectionMode="single" headerStyle="width: 3rem" />
            <Column
              field="parentName"
              header="Target"
              sortable
              :showFilterMenu="false"
              style="min-width: 150px"
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
            <Column
              field="cohortName"
              header="Subset"
              sortable
              :showFilterMenu="false"
              style="min-width: 250px"
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
            <Column field="cohortId" header="ID" sortable style="width: 80px" />
            <Column
              field="databaseComparator"
              header="DB Comp"
              sortable
              style="width: 80px"
            >
              <template #body="{ data }">{{
                data.databaseComparator ? "✔️" : "❌"
              }}</template>
            </Column>
            <Column
              field="cohortComparator"
              header="Cohort Comp"
              sortable
              style="width: 80px"
            >
              <template #body="{ data }">{{
                data.cohortComparator ? "✔️" : "❌"
              }}</template>
            </Column>
            <Column
              field="dechalRechal"
              header="Dechal"
              sortable
              style="width: 80px"
            >
              <template #body="{ data }">{{
                data.dechalRechal ? "✔️" : "❌"
              }}</template>
            </Column>
            <Column
              field="riskFactors"
              header="Risk Factors"
              sortable
              style="width: 80px"
            >
              <template #body="{ data }">{{
                data.riskFactors ? "✔️" : "❌"
              }}</template>
            </Column>
            <Column
              field="timeToEvent"
              header="TTE"
              sortable
              style="width: 80px"
            >
              <template #body="{ data }">{{
                data.timeToEvent ? "✔️" : "❌"
              }}</template>
            </Column>
            <Column
              field="caseSeries"
              header="Case Series"
              sortable
              style="width: 80px"
            >
              <template #body="{ data }">{{
                data.caseSeries ? "✔️" : "❌"
              }}</template>
            </Column>
            <Column
              field="cohortIncidence"
              header="Incidence"
              sortable
              style="width: 80px"
            >
              <template #body="{ data }">{{
                data.cohortIncidence ? "✔️" : "❌"
              }}</template>
            </Column>
          </DataTable>
        </div>
      </div>

      <div v-else class="selected-state">
        <div class="active-target-bar">
          <div class="active-target-info">
            <span class="active-target-label">Target</span>
            <span class="active-target-name">{{
              selectedTarget.cohortName
            }}</span>
            <Tag
              :value="'#' + selectedTarget.cohortId"
              severity="info"
              class="active-target-tag"
            />
            <span class="active-target-divider" />
            <Button
              label="Change"
              icon="pi pi-pencil"
              severity="secondary"
              text
              @click="clearTarget"
            />
          </div>
        </div>

        <Message
          v-if="!availableAnalyses.length"
          :closable="false"
          severity="error"
          class="mt-3"
        >
          No analysis results available for this target.
        </Message>

        <div v-if="availableAnalyses.length" class="analysis-area">
          <div ref="pillNavAnchor" />

          <div class="pill-nav-row">
            <div class="pill-nav">
              <button
                v-for="(analysis, index) in availableAnalyses"
                :key="analysis.key"
                :class="['pill', { active: activeTab === index }]"
                @click="activeTab = index"
                v-tooltip.bottom="{
                  value: analysis.description,
                  pt: {
                    root: 'absolute',
                    arrow: {
                      style: { borderBottomColor: 'var(--surface-800)' },
                    },
                    text: 'border rounded bg-surface-800 dark:bg-surface-50 text-white dark:text-black font-normal p-2 max-w-xs',
                  },
                }"
              >
                {{ analysis.label }}
              </button>
            </div>
            <i
              v-if="unavailableNames.length"
              class="pi pi-info-circle unavailable-icon"
              v-tooltip.bottom="'Not available: ' + unavailableNames.join(', ')"
            />
          </div>

          <Transition name="sticky-fade">
            <div v-if="!pillNavVisible" class="sticky-bar">
              <div class="sticky-left">
                <span class="sticky-target">{{
                  selectedTarget.cohortName
                }}</span>
                <span class="sticky-sep">·</span>
                <span class="sticky-tab">{{ currentAnalysis?.label }}</span>
              </div>
              <div class="sticky-pills">
                <button
                  v-for="(analysis, index) in availableAnalyses"
                  :key="'s-' + analysis.key"
                  :class="['sticky-pill', { active: activeTab === index }]"
                  @click="activeTab = index"
                >
                  {{ analysis.label }}
                </button>
              </div>
            </div>
          </Transition>

          <div class="analysis-content">
            <Transition
              name="tab-fade"
              mode="out-in"
              @enter="onAnalysisComponentEnter"
            >
              <component
                v-if="showContent"
                :is="currentAnalysis.component"
                :key="
                  currentAnalysis.key +
                  '-' +
                  selectedTarget.cohortId +
                  '-' +
                  navKey
                "
                :targetRow="targetRow"
                v-bind="currentAnalysis.extraProps"
                :initialUrlState="initialUrlState"
                @state-change="onChildStateChange"
              />
            </Transition>

            <ResultsLoader
              :loader-state="outcomeLoaderState"
              :text="'Loading outcomes'"
            />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  markRaw,
  nextTick,
} from "vue";
import { useRoute, onBeforeRouteUpdate } from "vue-router";
import { useStore } from "vuex";

import Button from "primevue/button";
import Tag from "primevue/tag";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import { FilterMatchMode } from "primevue/api";

import DatabaseComparison from "@/pages/strategus/characterization/DatabaseComparison.vue";
import CohortComparison from "@/pages/strategus/characterization/CohortComparison.vue";
import DechallengeRechallenge from "@/pages/strategus/characterization/DechallengeRechallenge.vue";
import RiskFactors from "@/pages/strategus/characterization/RiskFactors.vue";
import TimeToEvent from "@/pages/strategus/characterization/TimeToEvent.vue";
import CaseSeries from "@/pages/strategus/characterization/CaseSeries.vue";
import CohortIncidence from "@/pages/strategus/characterization/CohortIncidence.vue";
import ResultsLoader from "@/pages/strategus/characterization/shared/ResultsLoader.vue";

import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { useCharacterizationUrl } from "@/shared/lib/composables/useCharacterizationUrl";

const route = useRoute();
const store = useStore();
const { readUrl, writeUrl, updateUrl, clearChildParams, isSelfWrite } =
  useCharacterizationUrl();

const ANALYSIS_DEFS = [
  {
    key: "databaseComparator",
    label: "Database Comparison",
    component: markRaw(DatabaseComparison),
    needsOutcome: false,
    description:
      "Compare covariates at index between two databases for the same cohort.",
  },
  {
    key: "cohortComparator",
    label: "Cohort Comparison",
    component: markRaw(CohortComparison),
    needsOutcome: false,
    needsTargetTable: true,
    description:
      "Compare covariates at index between two cohorts within the same database.",
  },
  {
    key: "dechalRechal",
    label: "Dechallenge Rechallenge",
    component: markRaw(DechallengeRechallenge),
    needsOutcome: true,
    description:
      "View how often the outcome occurs just before the target stops (positive dechallenge) and how often the outcome restarts shortly after the target restarts (positive rechallenge).",
  },
  {
    key: "riskFactors",
    label: "Risk Factors",
    component: markRaw(RiskFactors),
    needsOutcome: true,
    description:
      "View features associated with having or not having the outcome during the time-at-risk.",
  },
  {
    key: "timeToEvent",
    label: "Time-to-event",
    component: markRaw(TimeToEvent),
    needsOutcome: true,
    description:
      "View the timing of all outcomes relative to the target index date and whether the outcome was first or subsequent.",
  },
  {
    key: "caseSeries",
    label: "Case Series",
    component: markRaw(CaseSeries),
    needsOutcome: true,
    description:
      "View features that occur before target index, between target index and outcome, and after outcome for patients with the outcome during the time-at-risk.",
  },
  {
    key: "cohortIncidence",
    label: "Cohort Incidence",
    component: markRaw(CohortIncidence),
    needsOutcome: true,
  },
];

const ANALYSIS_AVAIL_KEY = {
  dechalRechal: "hasDechalData",
  riskFactors: "hasRiskFactorData",
  caseSeries: "hasCaseSeriesData",
  timeToEvent: "hasTimeToEventData",
  cohortIncidence: "hasIncidenceData",
};

const loadingTargets = ref(false);
const loadingOutcomes = ref(false);
const outcomeLoaderState = ref("idle");
const showContent = ref(false);
const targetTable = ref([]);
const selectedTarget = ref(null);
const outcomeTable = ref([]);
const activeTab = ref(0);
const initialUrlState = ref(null);
const navKey = ref(0);

const pillNavAnchor = ref(null);
const pillNavVisible = ref(true);
let observer = null;

const targetFilters = ref({
  parentName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  cohortName: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const targetRow = computed(() => {
  const t = selectedTarget.value;
  if (!t) return null;
  return {
    cohortId: t.cohortId,
    cohortName: t.cohortName,
    databaseString: t.databaseString,
    databaseIdString: t.databaseIdString,
  };
});

const availableAnalyses = computed(() => {
  const t = selectedTarget.value;
  if (!t) return [];
  return ANALYSIS_DEFS.filter((a) => t[a.key] === 1).map((a) => ({
    ...a,
    extraProps: buildExtraProps(a),
  }));
});

const currentAnalysis = computed(
  () => availableAnalyses.value[activeTab.value] ?? availableAnalyses.value[0]
);

const unavailableNames = computed(() => {
  const t = selectedTarget.value;
  if (!t) return [];
  return ANALYSIS_DEFS.filter((a) => t[a.key] !== 1).map((a) => a.label);
});

function buildExtraProps(analysis) {
  const extra = {};
  if (analysis.needsOutcome) {
    const availKey = ANALYSIS_AVAIL_KEY[analysis.key];
    if (availKey) {
      extra.outcomeTable = outcomeTable.value.filter(
        (o) => o[availKey] !== false
      );
    } else {
      extra.outcomeTable = outcomeTable.value;
    }
  }
  if (analysis.needsTargetTable) {
    extra.targetTable = targetTable.value;
  }
  return extra;
}

function clearTarget() {
  selectedTarget.value = null;
  outcomeTable.value = [];
  activeTab.value = 0;
}

function tabKeyToIndex(tabKey) {
  if (!tabKey) return 0;
  const idx = availableAnalyses.value.findIndex((a) => a.key === tabKey);
  return idx >= 0 ? idx : 0;
}

function activeTabKey() {
  return availableAnalyses.value[activeTab.value]?.key ?? null;
}

function onAnalysisComponentEnter() {
  initialUrlState.value = null;
}

function onChildStateChange(childState) {
  updateUrl({
    report: route.query.report,
    targetId: selectedTarget.value?.cohortId,
    tab: activeTabKey(),
    ...childState,
  });
}

async function fetchTargetTable() {
  loadingTargets.value = true;
  try {
    const res = await StrategusService.characterization.getTargetTable();
    targetTable.value = res.data;
  } finally {
    loadingTargets.value = false;
  }
}

async function fetchOutcomeTable(targetId) {
  loadingOutcomes.value = true;
  showContent.value = false;
  outcomeLoaderState.value = "loading";
  const loadStart = Date.now();
  try {
    const res = await StrategusService.characterization.getOutcomeTable(
      targetId
    );
    const outcomes = res.data ?? [];
    if (outcomes.length) {
      try {
        const outcomeIds = outcomes.map((o) => o.cohortId);
        const availRes =
          await StrategusService.characterization.getOutcomeDataAvailability(
            targetId,
            outcomeIds
          );
        const availMap = new Map(
          (availRes.data ?? []).map((r) => [r.outcomeId, r])
        );
        for (const o of outcomes) {
          const avail = availMap.get(o.cohortId);
          if (avail) {
            o.hasDechalData = avail.hasDechalData;
            o.hasRiskFactorData = avail.hasRiskFactorData;
            o.hasCaseSeriesData = avail.hasCaseSeriesData;
            o.hasTimeToEventData = avail.hasTimeToEventData;
            o.hasIncidenceData = avail.hasIncidenceData;
          }
        }
      } catch (e) {
        console.warn("Failed to fetch outcome data availability:", e);
      }
    }
    outcomeTable.value = outcomes;
    if (Date.now() - loadStart >= 600) {
      outcomeLoaderState.value = "success";
      await new Promise((r) => setTimeout(r, 1100));
    }
    outcomeLoaderState.value = "idle";
    await new Promise((r) => setTimeout(r, 220));
    showContent.value = true;
  } catch {
    outcomeLoaderState.value = "error";
  } finally {
    loadingOutcomes.value = false;
  }
}

function setupObserver() {
  if (observer) observer.disconnect();
  if (!pillNavAnchor.value) return;
  observer = new IntersectionObserver(
    ([entry]) => {
      pillNavVisible.value = entry.isIntersecting;
    },
    { threshold: 0 }
  );
  observer.observe(pillNavAnchor.value);
}

watch(selectedTarget, async (newTarget, oldTarget) => {
  pillNavVisible.value = true;
  if (!newTarget) {
    outcomeTable.value = [];
    return;
  }
  if (newTarget.cohortId !== oldTarget?.cohortId) {
    if (initialUrlState.value) {
      activeTab.value = tabKeyToIndex(initialUrlState.value.tab);
    } else {
      activeTab.value = 0;
      clearChildParams();
    }
    await fetchOutcomeTable(newTarget.cohortId);
    await nextTick();
    setupObserver();
  }
});

watch(activeTab, () => {
  if (selectedTarget.value && !initialUrlState.value) {
    writeUrl({
      report: route.query.report,
      targetId: selectedTarget.value.cohortId,
      tab: activeTabKey(),
    });
  }
});

onBeforeRouteUpdate((to) => {
  if (isSelfWrite()) return;

  // Browser back/forward navigation — sync state from URL
  const q = to.query;
  const newState = {
    targetId: q.targetId ? parseInt(q.targetId, 10) : null,
    tab: q.tab || null,
    report: q.report || 0,
    outcomeId: q.outcomeId ? parseInt(q.outcomeId, 10) : null,
    outcomeIds: q.outcomeIds ? q.outcomeIds.split(",").map(Number) : null,
    databaseId: q.databaseId || null,
    databaseIds: q.databaseIds ? q.databaseIds.split(",") : null,
    comparatorId: q.comparatorId ? parseInt(q.comparatorId, 10) : null,
    tar: q.tar || null,
    washout: q.washout || null,
  };

  initialUrlState.value = newState;
  navKey.value++;

  const newTargetId = newState.targetId;
  const currentTargetId = selectedTarget.value?.cohortId ?? null;

  if (newTargetId !== currentTargetId) {
    if (!newTargetId) {
      clearTarget();
      initialUrlState.value = null;
    } else if (targetTable.value.length) {
      const match = targetTable.value.find((t) => t.cohortId === newTargetId);
      if (match) {
        selectedTarget.value = match;
        // Clear initialUrlState after outcomes load and child mounts
        const unwatch = watch(showContent, async (v) => {
          if (v) {
            unwatch();
            await nextTick();
            initialUrlState.value = null;
          }
        });
      } else {
        initialUrlState.value = null;
      }
    } else {
      initialUrlState.value = null;
    }
    return;
  }

  // Same target — sync tab and child params
  const newTabIdx = tabKeyToIndex(newState.tab);
  if (activeTab.value !== newTabIdx) {
    activeTab.value = newTabIdx;
  }
});

onMounted(async () => {
  const urlState = readUrl();
  await fetchTargetTable();
  if (urlState.targetId) {
    const match = targetTable.value.find(
      (t) => t.cohortId === urlState.targetId
    );
    if (match) {
      initialUrlState.value = urlState;
      selectedTarget.value = match;
      await nextTick();
      await new Promise((resolve) => {
        const unwatch = watch(
          loadingOutcomes,
          (v) => {
            if (!v) {
              unwatch();
              resolve();
            }
          },
          { immediate: true }
        );
      });
      await nextTick();
      initialUrlState.value = null;
      setupObserver();
    }
  }
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});
</script>

<style scoped>
.char-viewer {
  max-width: 1400px;
}

.selected-state {
  display: flex;
  flex-direction: column;
}

.state-fade-leave-active {
  transition: opacity 0.1s ease;
}
.state-fade-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.state-fade-enter-from,
.state-fade-leave-to {
  opacity: 0;
}

.state-fade-enter-from {
  transform: translateY(6px);
}

/* ── Target table section ── */
.section-header {
  margin-bottom: 1rem;
}

.section-header h3 {
  font-weight: 700;
  margin: 0;
  color: var(--text-color, #1e293b);
}

.section-sub {
  color: var(--text-color-secondary, #94a3b8);
}

.section {
  background: var(--bg-surface-0, #ffffff);
  border: 1.2px solid var(--bg-surface-300, #cbd5e1);
  border-radius: 8px;
  padding: 1rem;
}

.active-target-bar {
  display: flex;
  align-items: center;
  padding: 0.625rem 1rem;
  background: var(--surface-50, #f8fafc);
  border: 1px solid var(--surface-200, #e5e7eb);
  border-radius: 8px;
}

.active-target-divider {
  display: inline-block;
  width: 1.5px;
  height: 1.125rem;
  background: var(--bg-surface-300, #cbd5e1);
  margin: 0 0.25rem;
}

.active-target-info {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.active-target-label {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-color-secondary, #94a3b8);
}

.active-target-name {
  font-weight: 600;
  color: var(--text-color, #1e293b);
}

.active-target-tag {
  padding: 0.125rem 0.5rem;
  height: 1.5rem;
}

.analysis-area {
  margin-top: 0.75rem;
}

.pill-nav-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.pill-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  background: var(--surface-100, #f1f5f9);
  padding: 0.3125rem;
  border-radius: 8px;
}

.pill {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-color-secondary, #64748b);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.pill:hover {
  background: var(--surface-0, #fff);
  color: var(--text-color, #334155);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.pill.active {
  background: var(--surface-0, #fff);
  color: var(--primary-700, #1d4ed8);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.06);
}

.unavailable-icon {
  color: var(--text-color-secondary, #cbd5e1);
  opacity: 0.5;
  cursor: help;
}

.unavailable-icon:hover {
  opacity: 0.8;
}

.sticky-bar {
  position: fixed;
  top: 0;
  left: 52px;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 1.5rem;
  background: #ffffff;
  border-bottom: 1px solid var(--surface-300, #cbd5e1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.sticky-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
}

.sticky-target {
  font-weight: 600;
  color: var(--text-color, #1e293b);
}

.sticky-sep {
  color: var(--text-color, #1e293b);
}

.sticky-tab {
  color: var(--primary-700, #1d4ed8);
  font-weight: 600;
}

.sticky-pills {
  display: flex;
  gap: 0.25rem;
}

.sticky-pill {
  padding: 0.25rem 0.625rem;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-color-secondary, #94a3b8);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s ease;
  white-space: nowrap;
}

.sticky-pill:hover {
  background: var(--surface-100, #f1f5f9);
  color: var(--text-color, #334155);
}

.sticky-pill.active {
  background: var(--primary-50, #eff6ff);
  color: var(--primary-700, #1d4ed8);
  font-weight: 600;
}

.sticky-fade-enter-active,
.sticky-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.sticky-fade-enter-from,
.sticky-fade-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.mt-3 {
  margin-top: 0.75rem;
}

.tab-fade-leave-active {
  transition: opacity 0.1s ease;
}

.tab-fade-enter-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
}

.tab-fade-enter-from {
  transform: translateY(4px);
}
</style>
