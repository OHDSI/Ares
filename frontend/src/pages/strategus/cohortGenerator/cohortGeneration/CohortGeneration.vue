<template>
  <div class="cohort-generation">
    <div v-if="showTable" class="section results-body">
      <DataTable
        ref="tableRef"
        :value="filteredRows"
        :striped-rows="store.getters.getSettings.strippedRows"
        removable-sort
        size="small"
        paginator
        :rows="20"
        :rowsPerPageOptions="[10, 20, 50]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        scrollable
        scrollHeight="flex"
      >
        <Column sortable field="cohortName" :showFilterMenu="false">
          <template #header>
            <div class="col-header-with-filter">
              <span>Cohort</span>
              <FilterInput
                :filterObj="tableFilters.cohortName"
                placeholder="Search..."
              />
            </div>
          </template>
        </Column>
        <Column sortable field="databaseName" :showFilterMenu="false">
          <template #header>
            <div class="col-header-with-filter">
              <span>Database</span>
              <FilterInput
                :filterObj="tableFilters.databaseName"
                placeholder="Search..."
              />
            </div>
          </template>
        </Column>
        <Column
          sortable
          field="cohortId"
          style="width: 7rem"
          :showFilterMenu="false"
        >
          <template #header>
            <div class="col-header-with-filter">
              <span>Cohort ID</span>
              <FilterInput
                :filterObj="tableFilters.cohortId"
                placeholder="Search..."
              />
            </div>
          </template>
        </Column>
        <Column
          sortable
          field="generated"
          style="width: 8rem"
          :showFilterMenu="false"
        >
          <template #header>
            <div class="col-header-with-filter">
              <span>Generated?</span>
              <Dropdown
                v-model="dropdownFilters.generated"
                :options="generatedOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="All"
                showClear
                class="filter-dropdown"
                @click.stop
              />
            </div>
          </template>
          <template #body="{ data }">
            <i
              :class="[
                'pi',
                data.generated
                  ? 'pi-check text-green-600 dark:text-green-400'
                  : 'pi-times text-red-400 dark:text-slate-500',
              ]"
            />
          </template>
        </Column>
        <Column sortable field="startTime" :showFilterMenu="false">
          <template #header>
            <div class="col-header-with-filter">
              <span>Start</span>
              <FilterInput
                :filterObj="tableFilters.startTime"
                placeholder="Search..."
              />
            </div>
          </template>
          <template #body="{ data }">{{
            formatDateTime(data.startTime)
          }}</template>
        </Column>
        <Column sortable field="endTime" :showFilterMenu="false">
          <template #header>
            <div class="col-header-with-filter">
              <span>End</span>
              <FilterInput
                :filterObj="tableFilters.endTime"
                placeholder="Search..."
              />
            </div>
          </template>
          <template #body="{ data }">{{
            formatDateTime(data.endTime)
          }}</template>
        </Column>
        <Column sortable field="duration" :showFilterMenu="false">
          <template #header>
            <div class="col-header-with-filter">
              <span>Duration</span>
              <FilterInput :filterObj="tableFilters.duration" type="numeric" />
            </div>
          </template>
          <template #body="{ data }">{{
            formatDurationSec(data.duration)
          }}</template>
        </Column>
      </DataTable>
    </div>
    <ResultsLoader :loader-state="loaderState" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dropdown from "primevue/dropdown";
import FilterInput from "@/pages/strategus/characterization/shared/filterInput";
import { useTableFilter } from "@/pages/strategus/characterization/shared/useTableFilter";
import { useStore } from "vuex";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { formatDateTime, formatDurationSec } from "@/shared/lib/formatters";
import { useCohortUrl } from "@/shared/lib/composables/useCohortUrl";
import ResultsLoader from "@/pages/strategus/characterization/shared/resultsLoader";

const store = useStore();
const loaderState = ref("idle");
const showTable = ref(false);
const rows = ref<any[]>([]);
const tableRef = ref(null);

const generatedOptions = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];

const tableFilters = ref({
  cohortName: { value: null as string | null, matchMode: "contains" },
  databaseName: { value: null as string | null, matchMode: "contains" },
  cohortId: { value: null as string | null, matchMode: "contains" },
  startTime: { value: null as string | null, matchMode: "contains" },
  endTime: { value: null as string | null, matchMode: "contains" },
  duration: { value: null as string | null, matchMode: "equals" },
});

const dropdownFilters = ref<Record<string, any>>({
  generated: null,
});

const { filteredRows, applyNow } = useTableFilter(
  () => rows.value,
  dropdownFilters,
  tableFilters,
  ref(""),
  ref({} as Record<string, string>),
  tableRef,
);

let _ready = false;
const { readUrl, updateUrl } = useCohortUrl();

watch(
  tableFilters,
  (val) => {
    if (!_ready) return;
    updateUrl({
      genCohort: val.cohortName.value || undefined,
      genDb: val.databaseName.value || undefined,
    });
  },
  { deep: true },
);

onMounted(async () => {
  const url = readUrl();
  if (url.genCohort) tableFilters.value.cohortName.value = url.genCohort;
  if (url.genDb) tableFilters.value.databaseName.value = url.genDb;
  loaderState.value = "loading";
  const loadStart = Date.now();
  try {
    const res = await StrategusService.cohorts.getGeneration();
    rows.value = (res.data ?? []).map((r: any) => ({
      ...r,
      duration:
        r.startTime && r.endTime
          ? Math.round(
              (new Date(r.endTime).getTime() -
                new Date(r.startTime).getTime()) /
                1000,
            )
          : null,
    }));
    applyNow();
    if (Date.now() - loadStart >= 600) {
      loaderState.value = "success";
      await new Promise((r) => setTimeout(r, 1100));
    }
    loaderState.value = "idle";
    await new Promise((r) => setTimeout(r, 220));
    showTable.value = true;
  } catch (e) {
    console.error("Failed to load cohort generation:", e);
    loaderState.value = "error";
  }
  _ready = true;
});
</script>

<style scoped>
@import "../../characterization/shared/styles.css";

.cohort-generation {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

:deep(.filter-dropdown) {
  height: 1.5rem;
}
:deep(.filter-dropdown .p-dropdown-label) {
  padding: 0.2rem 1.25rem 0.2rem 0.4rem;
  font-size: 0.72rem;
}
:deep(.filter-dropdown .p-dropdown-trigger) {
  width: 1.5rem;
}
:deep(.filter-dropdown .p-dropdown-clear-icon) {
  right: 1.75rem;
}
</style>
