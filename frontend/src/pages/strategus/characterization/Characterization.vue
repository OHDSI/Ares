<template>
  <div class="characterization-viewer">
    <Panel header="Select Target" class="target-panel">
      <DataTable
        :value="targetTable"
        v-model:selection="selectedTarget"
        selectionMode="single"
        dataKey="cohortId"
        :paginator="targetTable.length > 10"
        :rows="10"
        filterDisplay="row"
        v-model:filters="targetFilters"
        :striped-rows="store.getters.getSettings.strippedRows"
        size="small"
        class="target-table"
        :loading="loadingTargets"
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
          style="min-width: 300px"
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
          header="Cohort ID"
          sortable
          style="width: 100px"
        />
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
        <Column field="timeToEvent" header="TTE" sortable style="width: 80px">
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
    </Panel>

    <Message
      v-if="selectedTarget && !availableAnalyses.length"
      :closable="false"
      severity="error"
    >
      <div class="flex flex-col gap-1">
        <p>No analysis results available for this target.</p>
      </div>
    </Message>

    <Message
      v-if="
        selectedTarget && unavailableNames.length && availableAnalyses.length
      "
      :closable="false"
      severity="warn"
    >
      <div class="flex flex-col gap-1">
        <p>
          Note: {{ unavailableNames.join(", ") }} not available for this target.
        </p>
      </div>
    </Message>

    <TabView
      v-if="selectedTarget && availableAnalyses.length"
      v-model:activeIndex="activeTab"
      class="mt-3"
      :key="selectedTarget.cohortId"
    >
      <TabPanel
        v-for="(analysis, index) in availableAnalyses"
        :key="analysis.key"
        :header="analysis.label"
      >
        <div v-if="loadingOutcomes" class="loading-msg">
          Loading outcomes...
        </div>

        <component
          v-else-if="activeTab === index"
          :is="analysis.component"
          :targetRow="targetRow"
          v-bind="analysis.extraProps"
        />
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, markRaw } from "vue";

import Panel from "primevue/panel";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";

import DatabaseComparison from "@/pages/strategus/characterization/DatabaseComparison.vue";
import CohortComparison from "@/pages/strategus/characterization/CohortComparison.vue";
import DechallengeRechallenge from "@/pages/strategus/characterization/DechallengeRechallenge.vue";
import RiskFactors from "@/pages/strategus/characterization/RiskFactors.vue";
import TimeToEvent from "@/pages/strategus/characterization/TimeToEvent.vue";
import CaseSeries from "@/pages/strategus/characterization/CaseSeries.vue";
import CohortIncidence from "@/pages/strategus/characterization/CohortIncidence.vue";

import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import Message from "primevue/message";
import { useStore } from "vuex";

const store = useStore();

const ANALYSIS_DEFS = [
  {
    key: "databaseComparator",
    label: "Database Comparison",
    component: markRaw(DatabaseComparison),
    needsOutcome: false,
  },
  {
    key: "cohortComparator",
    label: "Cohort Comparison",
    component: markRaw(CohortComparison),
    needsOutcome: false,
    needsTargetTable: true,
  },
  {
    key: "dechalRechal",
    label: "Dechallenge Rechallenge",
    component: markRaw(DechallengeRechallenge),
    needsOutcome: true,
  },
  {
    key: "riskFactors",
    label: "Risk Factors",
    component: markRaw(RiskFactors),
    needsOutcome: true,
  },
  {
    key: "timeToEvent",
    label: "Time-to-event",
    component: markRaw(TimeToEvent),
    needsOutcome: true,
  },
  {
    key: "caseSeries",
    label: "Case Series",
    component: markRaw(CaseSeries),
    needsOutcome: true,
  },
  {
    key: "cohortIncidence",
    label: "Cohort Incidence",
    component: markRaw(CohortIncidence),
    needsOutcome: true,
  },
];

const loadingTargets = ref(false);
const loadingOutcomes = ref(false);
const targetTable = ref([]);
const selectedTarget = ref(null);
const outcomeTable = ref([]);
const activeTab = ref(0);

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

const unavailableNames = computed(() => {
  const t = selectedTarget.value;
  if (!t) return [];
  return ANALYSIS_DEFS.filter((a) => t[a.key] !== 1).map((a) => a.label);
});

const ANALYSIS_AVAIL_KEY = {
  dechalRechal: "hasDechalData",
  riskFactors: "hasRiskFactorData",
  caseSeries: "hasCaseSeriesData",
  timeToEvent: "hasTimeToEventData",
  cohortIncidence: "hasIncidenceData",
};

function buildExtraProps(analysis) {
  const extra = {};
  if (analysis.needsOutcome) {
    const availKey = ANALYSIS_AVAIL_KEY[analysis.key];
    if (availKey) {
      // filter outcomes that have data
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
  try {
    const res = await StrategusService.characterization.getOutcomeTable(
      targetId
    );

    //    outcomeTable.value = res.data;

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
        console.warn(
          "Failed to fetch outcome data availability, proceeding without filtering:",
          e
        );
      }
    }

    outcomeTable.value = outcomes;
  } finally {
    loadingOutcomes.value = false;
  }
}

watch(selectedTarget, async (newTarget, oldTarget) => {
  if (!newTarget) {
    outcomeTable.value = [];
    return;
  }
  if (newTarget.cohortId !== oldTarget?.cohortId) {
    activeTab.value = 0;
    await fetchOutcomeTable(newTarget.cohortId);
  }
});

onMounted(() => {
  fetchTargetTable();
});
</script>

<style scoped>
.characterization-viewer {
  padding: 1rem;
}
.target-panel {
  margin-top: 0.75rem;
}
.target-table {
  font-size: 0.8125rem;
}
.help-text {
  color: var(--text-color-secondary, #6b7280);
  font-size: 0.875rem;
}
.loading-msg {
  padding: 2rem;
  text-align: center;
  color: var(--text-color-secondary, #6b7280);
}
</style>
