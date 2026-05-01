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
            <Column
              field="cohortId"
              header="ID"
              sortable
              :showFilterMenu="false"
              style="width: 80px"
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
              field="databaseComparator"
              header="DB Comp"
              sortable
              :showFilterMenu="false"
              style="width: 80px"
            >
              <template #filter="{ filterModel, filterCallback }">
                <MultiSelect
                  v-model="filterModel.value"
                  :options="boolOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Any"
                  size="small"
                  @change="filterCallback()"
                />
              </template>
              <template #body="{ data }">
                <i
                  :class="
                    data.databaseComparator
                      ? 'pi pi-check text-green-600 dark:text-green-400'
                      : 'pi pi-times text-red-400 dark:text-slate-500'
                  "
                />
              </template>
            </Column>
            <Column
              field="cohortComparator"
              header="Cohort Comp"
              sortable
              :showFilterMenu="false"
              style="width: 80px"
            >
              <template #filter="{ filterModel, filterCallback }">
                <MultiSelect
                  v-model="filterModel.value"
                  :options="boolOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Any"
                  size="small"
                  @change="filterCallback()"
                />
              </template>
              <template #body="{ data }">
                <i
                  :class="
                    data.cohortComparator
                      ? 'pi pi-check text-green-600 dark:text-green-400'
                      : 'pi pi-times text-red-400 dark:text-slate-500'
                  "
                />
              </template>
            </Column>
            <Column
              field="dechalRechal"
              header="Dechal"
              sortable
              :showFilterMenu="false"
              style="width: 80px"
            >
              <template #filter="{ filterModel, filterCallback }">
                <MultiSelect
                  v-model="filterModel.value"
                  :options="boolOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Any"
                  size="small"
                  @change="filterCallback()"
                />
              </template>
              <template #body="{ data }">
                <i
                  :class="
                    data.dechalRechal
                      ? 'pi pi-check text-green-600 dark:text-green-400'
                      : 'pi pi-times text-red-400 dark:text-slate-500'
                  "
                />
              </template>
            </Column>
            <Column
              field="riskFactors"
              header="Risk Factors"
              sortable
              :showFilterMenu="false"
              style="width: 80px"
            >
              <template #filter="{ filterModel, filterCallback }">
                <MultiSelect
                  v-model="filterModel.value"
                  :options="boolOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Any"
                  size="small"
                  @change="filterCallback()"
                />
              </template>
              <template #body="{ data }">
                <i
                  :class="
                    data.riskFactors
                      ? 'pi pi-check text-green-600 dark:text-green-400'
                      : 'pi pi-times text-red-400 dark:text-slate-500'
                  "
                />
              </template>
            </Column>
            <Column
              field="timeToEvent"
              header="TTE"
              sortable
              :showFilterMenu="false"
              style="width: 80px"
            >
              <template #filter="{ filterModel, filterCallback }">
                <MultiSelect
                  v-model="filterModel.value"
                  :options="boolOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Any"
                  size="small"
                  @change="filterCallback()"
                />
              </template>
              <template #body="{ data }">
                <i
                  :class="
                    data.timeToEvent
                      ? 'pi pi-check text-green-600 dark:text-green-400'
                      : 'pi pi-times text-red-400 dark:text-slate-500'
                  "
                />
              </template>
            </Column>
            <Column
              field="caseSeries"
              header="Case Series"
              sortable
              :showFilterMenu="false"
              style="width: 80px"
            >
              <template #filter="{ filterModel, filterCallback }">
                <MultiSelect
                  v-model="filterModel.value"
                  :options="boolOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Any"
                  size="small"
                  @change="filterCallback()"
                />
              </template>
              <template #body="{ data }">
                <i
                  :class="
                    data.caseSeries
                      ? 'pi pi-check text-green-600 dark:text-green-400'
                      : 'pi pi-times text-red-400 dark:text-slate-500'
                  "
                />
              </template>
            </Column>
            <Column
              field="cohortIncidence"
              header="Incidence"
              sortable
              :showFilterMenu="false"
              style="width: 80px"
            >
              <template #filter="{ filterModel, filterCallback }">
                <MultiSelect
                  v-model="filterModel.value"
                  :options="boolOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Any"
                  size="small"
                  @change="filterCallback()"
                />
              </template>
              <template #body="{ data }">
                <i
                  :class="
                    data.cohortIncidence
                      ? 'pi pi-check text-green-600 dark:text-green-400'
                      : 'pi pi-times text-red-400 dark:text-slate-500'
                  "
                />
              </template>
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
              :pt="{
                root: {
                  style: {
                    color: 'var(--color-text-label)',
                    border: 'none',
                  },
                },
              }"
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
            <PillNav
              :tabs="availableAnalyses"
              :modelValue="activeTab"
              :unavailableTabs="unavailableAnalyses"
              @update:modelValue="activeTab = $event"
            />
          </div>

          <Teleport :to="EXPLORER_CONTENT_TARGET">
            <Transition name="sticky-fade">
              <div v-if="!pillNavVisible" class="sticky-content">
                <div class="sticky-left">
                  <span class="sticky-target">{{
                    selectedTarget.cohortName
                  }}</span>
                  <span class="sticky-sep">·</span>
                  <span class="sticky-tab">{{ currentAnalysis?.label }}</span>
                  <Transition name="ctx-appear">
                    <span
                      v-if="
                        (stickyCtxItems.length || stickyDatabases.length) &&
                        !ctxBarVisible
                      "
                      class="sticky-ctx-group"
                    >
                      <span class="sticky-sep">·</span>
                      <template v-for="(item, i) in stickyCtxItems" :key="i">
                        <span v-if="i > 0" class="sticky-dot" />
                        <span class="sticky-ctx">{{ item }}</span>
                      </template>
                      <template v-if="stickyDatabases.length">
                        <span v-if="stickyCtxItems.length" class="sticky-dot" />
                        <Tooltip :text="stickyDatabases.join(' · ')">
                          <span class="sticky-ctx sticky-db">{{
                            stickyDatabases.length === 1
                              ? stickyDatabases[0]
                              : `${stickyDatabases.length} databases`
                          }}</span>
                        </Tooltip>
                      </template>
                    </span>
                  </Transition>
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
          </Teleport>

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
import { EXPLORER_CONTENT_TARGET } from "@/widgets/explorer";

import Button from "primevue/button";
import Tag from "primevue/tag";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import MultiSelect from "primevue/multiselect";
import Message from "primevue/message";
import { FilterMatchMode } from "primevue/api";

import DatabaseComparison from "@/pages/strategus/characterization/databaseComparison";
import CohortComparison from "@/pages/strategus/characterization/cohortComparison";
import DechallengeRechallenge from "@/pages/strategus/characterization/dechallengeRechallenge";
import RiskFactors from "@/pages/strategus/characterization/riskFactors";
import TimeToEvent from "@/pages/strategus/characterization/timeToEvent";
import CaseSeries from "@/pages/strategus/characterization/caseSeries";
import CohortIncidence from "@/pages/strategus/characterization/cohortIncidence";
import ResultsLoader from "@/pages/strategus/characterization/shared/resultsLoader";
import PillNav from "@/shared/ui/pillNav";
import Tooltip from "@/shared/ui/tooltip";

import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { useCharacterizationUrl } from "@/shared/lib/composables/useCharacterizationUrl";
import useRubberBandSelection from "@/shared/lib/composables/useRubberBandSelection";

const route = useRoute();
const store = useStore();

const { readUrl, updateUrl, clearChildParams, isSelfWrite } =
  useCharacterizationUrl();

useRubberBandSelection();

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
const stickyCtxItems = ref([]);
const stickyDatabases = ref([]);
const ctxBarVisible = ref(true);
let observer = null;
let ctxObserver = null;

const boolOptions = [
  { label: "Yes", value: 1 },
  { label: "No", value: 0 },
];

const targetFilters = ref({
  parentName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  cohortName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  cohortId: { value: null, matchMode: FilterMatchMode.CONTAINS },
  databaseComparator: { value: null, matchMode: FilterMatchMode.IN },
  cohortComparator: { value: null, matchMode: FilterMatchMode.IN },
  dechalRechal: { value: null, matchMode: FilterMatchMode.IN },
  riskFactors: { value: null, matchMode: FilterMatchMode.IN },
  timeToEvent: { value: null, matchMode: FilterMatchMode.IN },
  caseSeries: { value: null, matchMode: FilterMatchMode.IN },
  cohortIncidence: { value: null, matchMode: FilterMatchMode.IN },
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

const unavailableAnalyses = computed(() => {
  const t = selectedTarget.value;
  if (!t) return [];
  return ANALYSIS_DEFS.filter((a) => t[a.key] !== 1);
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
  if (childState.ctxItems) {
    stickyCtxItems.value = childState.ctxItems;
  }
  stickyDatabases.value = childState.databases ?? [];
  const { ctxItems: _, databases: __, ...urlState } = childState;
  updateUrl({
    report: route.query.report,
    targetId: selectedTarget.value?.cohortId,
    tab: activeTabKey(),
    ...urlState,
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

function setupCtxObserver() {
  if (ctxObserver) ctxObserver.disconnect();
  const el = document.querySelector(".results-ctx");
  if (!el) {
    ctxBarVisible.value = true;
    return;
  }
  ctxObserver = new IntersectionObserver(
    ([entry]) => {
      ctxBarVisible.value = entry.isIntersecting;
    },
    { threshold: 0 }
  );
  ctxObserver.observe(el);
}

watch(selectedTarget, async (newTarget, oldTarget) => {
  pillNavVisible.value = true;
  stickyCtxItems.value = [];
  stickyDatabases.value = [];
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

watch(stickyCtxItems, async (items) => {
  if (items.length) {
    await nextTick();
    setupCtxObserver();
  } else {
    if (ctxObserver) {
      ctxObserver.disconnect();
      ctxObserver = null;
    }
    ctxBarVisible.value = true;
  }
});

watch(activeTab, () => {
  stickyCtxItems.value = [];
  stickyDatabases.value = [];
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
  if (ctxObserver) ctxObserver.disconnect();
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
  color: var(--color-text);
}

.section-sub {
  color: var(--color-text-subtle);
}

.section {
  background: var(--color-bg-surface);
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
}

.active-target-bar {
  display: flex;
  align-items: center;
  padding: 0.625rem 1rem;
  //border: 1px solid v-bind(activeTargetBorder);
  border-radius: 8px;
}

.active-target-divider {
  display: inline-block;
  width: 1.5px;
  height: 1.125rem;
  background: var(--color-border-strong);
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
  color: var(--color-text-subtle);
}

.active-target-name {
  font-weight: 600;
  color: var(--color-text);
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

.sticky-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  width: 100%;
  padding-bottom: 0.75rem;
}

.sticky-left {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8125rem;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.sticky-target {
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.sticky-sep {
  color: var(--color-text-subtle);
  flex-shrink: 0;
}

.sticky-tab {
  color: var(--color-text);
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.sticky-dot {
  display: inline-block;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--color-text-subtle);
}

.sticky-ctx {
  color: var(--color-text-muted);
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sticky-ctx-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  overflow: hidden;
}

.ctx-appear-enter-active,
.ctx-appear-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.ctx-appear-enter-from,
.ctx-appear-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

.sticky-pills {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  flex-shrink: 0;
  min-width: 0;
}

.sticky-pill {
  padding: 0.25rem 0.625rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-subtle);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.12s ease, background 0.12s ease;
  white-space: nowrap;
}

.sticky-pill:hover {
  color: var(--color-interactive-hover);
  background: rgba(128, 128, 128, 0.08);
}

.sticky-pill.active {
  color: var(--color-interactive-hover);
  font-weight: 600;
  background: var(--color-active-bg);
  box-shadow: var(--shadow-active);
}

.sticky-fade-enter-active,
.sticky-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.sticky-fade-enter-from,
.sticky-fade-leave-to {
  opacity: 0;
  transform: translateY(100%);
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
