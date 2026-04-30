<template>
  <div class="time-to-event">
    <div class="section">
      <label class="field-label">Outcome</label>
      <OutcomeSelector v-model="selectedOutcome" :options="outcomeOptions" />

      <GenerateButton :disabled="generateDisabled" @click="generate" />
    </div>

    <ContextBar
      v-if="showResults"
      :items="[targetName, lastGeneratedConfig.outcomeName]"
    />

    <div v-if="showResults" class="section results-body">
      <ViewToggle v-model="activeResultTab" :tabs="resultTabs" />

      <Transition name="tab-fade" mode="out-in"
        ><div :key="activeResultTab">
          <div v-if="activeResultTab === 0">
            <div class="plot-filters">
              <div>
                <label class="field-label">Databases</label>
                <MultiSelect
                  v-model="plotDatabases"
                  :options="uniqueDatabases"
                  placeholder="All databases"
                  filter
                  display="chip"
                  class="w-full"
                />
              </div>
              <div>
                <label class="field-label">Timespan</label>
                <MultiSelect
                  v-model="plotTimeScales"
                  :options="uniqueTimeScales"
                  placeholder="All"
                  class="w-full"
                />
              </div>
              <div>
                <label class="field-label">Outcome type</label>
                <MultiSelect
                  v-model="plotOutcomeTypes"
                  :options="uniqueOutcomeTypes"
                  placeholder="All"
                  class="w-full"
                />
              </div>
              <div>
                <label class="field-label">Timing</label>
                <MultiSelect
                  v-model="plotTargetOutcomeTypes"
                  :options="uniqueTargetOutcomeTypes"
                  placeholder="All"
                  class="w-full"
                />
              </div>
            </div>
            <Chart
              :data="filteredPlotData"
              :chartSpec="tteChartSpec"
              :height="tteChartHeightComputed"
              id="time-to-event"
            />
          </div>

          <div v-else-if="activeResultTab === 1">
            <div class="table-controls">
              <div class="col-selector">
                <label class="field-label">Columns</label>
                <ColumnSelector
                  v-model="tableSelectedColumns"
                  :options="tableColumnOptions"
                />
              </div>
              <Button
                :icon="showFilters ? 'pi pi-filter-slash' : 'pi pi-filter'"
                :severity="showFilters ? 'primary' : 'secondary'"
                text
                rounded
                class="filter-toggle-btn"
                :title="showFilters ? 'Hide filters' : 'Show filters'"
                @click="showFilters = !showFilters"
              />
            </div>
            <DataTable
              :value="allData"
              :paginator="true"
              :rows="25"
              :rowsPerPageOptions="[10, 25, 50, 100]"
              :filterDisplay="showFilters ? 'row' : undefined"
              v-model:filters="tableFilters"
              sortMode="multiple"
              removableSort
              :striped-rows="store.getters.getSettings.strippedRows"
              size="small"
              class="result-table"
            >
              <Column
                :hidden="!tableSelectedColumns.includes('databaseName')"
                style="text-align: start"
                :pt="{ headerContent: 'justify-start' }"
                field="databaseName"
                header="Database"
                sortable
                :showFilterMenu="false"
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
                :hidden="!tableSelectedColumns.includes('targetName')"
                style="text-align: start"
                :pt="{ headerContent: 'justify-start' }"
                field="targetName"
                header="Target"
                sortable
                :showFilterMenu="false"
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
                :hidden="!tableSelectedColumns.includes('outcomeName')"
                style="text-align: start"
                :pt="{ headerContent: 'justify-start' }"
                field="outcomeName"
                header="Outcome"
                sortable
                :showFilterMenu="false"
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
                :hidden="!tableSelectedColumns.includes('outcomeType')"
                style="text-align: start"
                :pt="{ headerContent: 'justify-start' }"
                field="outcomeType"
                header="Outcome Type"
                sortable
                :showFilterMenu="false"
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
                :hidden="!tableSelectedColumns.includes('targetOutcomeType')"
                style="text-align: start"
                :pt="{ headerContent: 'justify-start' }"
                field="targetOutcomeType"
                header="Timing"
                sortable
                :showFilterMenu="false"
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
                :hidden="!tableSelectedColumns.includes('timeToEvent')"
                style="text-align: end"
                :pt="{ headerContent: 'justify-end' }"
                field="timeToEvent"
                header="Days"
                sortable
                :showFilterMenu="false"
              >
                <template #filter="{ filterModel, filterCallback }">
                  <InputText
                    v-model="filterModel.value"
                    @input="filterCallback()"
                    placeholder="Filter..."
                    size="small"
                  />
                </template>
              </Column>
              <Column
                :hidden="!tableSelectedColumns.includes('numEvents')"
                style="text-align: end"
                :pt="{ headerContent: 'justify-end' }"
                field="numEvents"
                header="# Events"
                sortable
                :showFilterMenu="false"
              >
                <template #body="{ data }">
                  <CensoredCell :text="formatCensored(data.numEvents)" />
                </template>
                <template #filter="{ filterModel, filterCallback }">
                  <InputText
                    v-model="filterModel.value"
                    @input="filterCallback()"
                    placeholder="Filter..."
                    size="small"
                  />
                </template>
              </Column>
              <Column
                :hidden="!tableSelectedColumns.includes('timeScale')"
                style="text-align: start"
                :pt="{ headerContent: 'justify-start' }"
                field="timeScale"
                header="Scale"
                sortable
                :showFilterMenu="false"
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
            </DataTable>
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
import { ref, computed, watch, nextTick, onMounted } from "vue";
import Chart from "@/widgets/echarts/echarts";
import { tteChartSpec, tteChartHeight } from "./chartSpec";

import ResultsLoader from "../shared/resultsLoader";
import ViewToggle from "../shared/viewToggle";
import OutcomeSelector from "../shared/outcomeSelector";
import ContextBar from "../shared/contextBar";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import MultiSelect from "primevue/multiselect";
import ColumnSelector from "@/shared/ui/columnSelector";
import CensoredCell from "../shared/censoredCell";
import GenerateButton from "@/pages/strategus/characterization/shared/generateButton";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { formatCensored } from "@/shared/lib/formatters";
import { useStore } from "vuex";
import { UPDATE_COLUMN_SELECTION } from "@/widgets/settings/model/store/actions.type";

const store = useStore();
const darkMode = computed(() => store.getters.getSettings.darkMode);

const STORAGE_KEY = "char:timeToEvent";

const tableColumnOptions = [
  { label: "Database", key: "databaseName" },
  { label: "Target", key: "targetName" },
  { label: "Outcome", key: "outcomeName" },
  { label: "Outcome Type", key: "outcomeType" },
  { label: "Timing", key: "targetOutcomeType" },
  { label: "Days", key: "timeToEvent" },
  { label: "# Events", key: "numEvents" },
  { label: "Scale", key: "timeScale" },
];
const TTE_DEFAULT_COLUMNS = [
  "databaseName",
  "outcomeName",
  "outcomeType",
  "targetOutcomeType",
  "timeToEvent",
  "numEvents",
];
const tableSelectedColumns = ref(
  store.getters.getSettings.persistColumnSelection &&
    store.getters.getSettings.columnSelection?.[STORAGE_KEY]?.length
    ? store.getters.getSettings.columnSelection[STORAGE_KEY]
    : TTE_DEFAULT_COLUMNS
);
watch(tableSelectedColumns, (val) => {
  store.dispatch(UPDATE_COLUMN_SELECTION, { [STORAGE_KEY]: val });
});

const props = defineProps({
  targetRow: { type: Object },
  outcomeTable: { type: Array },
  initialUrlState: { type: Object, default: null },
});

const emit = defineEmits(["state-change"]);

const loading = ref(false);
const showResults = ref(false);
const showFilters = ref(false);
const loaderState = ref("idle");
const selectedOutcome = ref(null);
const allData = ref([]);

const activeResultTab = ref(0);
const resultTabs = [
  { key: "plots", label: "Plots" },
  { key: "table", label: "Table" },
];

const plotDatabases = ref([]);
const plotTimeScales = ref([]);
const plotOutcomeTypes = ref([]);
const plotTargetOutcomeTypes = ref([]);
const lastGeneratedConfig = ref(null);

const tteChartHeightComputed = computed(() =>
  tteChartHeight(filteredPlotData.value)
);

const tableFilters = ref({
  databaseName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  targetName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  outcomeName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  outcomeType: { value: null, matchMode: FilterMatchMode.CONTAINS },
  targetOutcomeType: { value: null, matchMode: FilterMatchMode.CONTAINS },
  timeToEvent: { value: null, matchMode: FilterMatchMode.CONTAINS },
  numEvents: { value: null, matchMode: FilterMatchMode.CONTAINS },
  timeScale: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const outcomeOptions = computed(() => props.outcomeTable ?? []);
const targetName = computed(() => props.targetRow?.cohortName ?? "");
const outcomeName = computed(() => selectedOutcome.value?.cohortName ?? "");

const uniqueDatabases = computed(() => [
  ...new Set(allData.value.map((r) => r.databaseName)),
]);
const uniqueTimeScales = computed(() => [
  ...new Set(allData.value.map((r) => r.timeScale)),
]);
const uniqueOutcomeTypes = computed(() => [
  ...new Set(allData.value.map((r) => r.outcomeType)),
]);
const uniqueTargetOutcomeTypes = computed(() => [
  ...new Set(allData.value.map((r) => r.targetOutcomeType)),
]);

const filteredPlotData = computed(() => {
  return allData.value.filter(
    (r) =>
      (plotDatabases.value.length === 0 ||
        plotDatabases.value.includes(r.databaseName)) &&
      (plotTimeScales.value.length === 0 ||
        plotTimeScales.value.includes(r.timeScale)) &&
      (plotOutcomeTypes.value.length === 0 ||
        plotOutcomeTypes.value.includes(r.outcomeType)) &&
      (plotTargetOutcomeTypes.value.length === 0 ||
        plotTargetOutcomeTypes.value.includes(r.targetOutcomeType)) &&
      r.numEvents > 0
  );
});

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

    plotDatabases.value = [...uniqueDatabases.value];
    plotTimeScales.value = [...uniqueTimeScales.value];
    plotOutcomeTypes.value = [...uniqueOutcomeTypes.value];
    plotTargetOutcomeTypes.value = [...uniqueTargetOutcomeTypes.value];

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
</script>

<style scoped>
@import "../shared/styles.css";

.time-to-event {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.plot-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: start;
  margin-bottom: 0.75rem;
}

.plot-filters > div {
  min-width: 160px;
  flex: 1;
}

.table-controls {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.col-selector {
  min-width: 200px;
  flex: 1 1 400px;
}

.filter-toggle-btn {
  flex-shrink: 0;
  margin-bottom: 2px;
  width: 2.25rem;
  height: 2.25rem;
  font-size: 1rem;
}

:deep(.p-sortable-column-icon) {
  opacity: 0.15;
  transition: opacity 0.15s;
}
:deep(.p-sortable-column:hover .p-sortable-column-icon),
:deep(.p-highlight .p-sortable-column-icon) {
  opacity: 1;
}
</style>
