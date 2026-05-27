<template>
  <div class="cohort-generation">
    <div v-if="showTable" class="section results-body">
      <DataTable
        :value="rows"
        :striped-rows="store.getters.getSettings.strippedRows"
        removable-sort
        size="small"
        paginator
        :rows="20"
        :rowsPerPageOptions="[10, 20, 50]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        filterDisplay="row"
        v-model:filters="filters"
        scrollable
        scrollHeight="flex"
      >
        <Column
          sortable
          header="Cohort"
          field="cohortName"
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
          sortable
          header="Database"
          field="databaseName"
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
          sortable
          header="Cohort ID"
          field="cohortId"
          style="width: 7rem"
        />
        <Column
          sortable
          header="Generated?"
          field="generated"
          style="width: 8rem"
        >
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
        <Column sortable header="Start" field="startTime">
          <template #body="{ data }">{{
            formatDateTime(data.startTime)
          }}</template>
        </Column>
        <Column sortable header="End" field="endTime">
          <template #body="{ data }">{{
            formatDateTime(data.endTime)
          }}</template>
        </Column>

        <Column sortable header="Duration" field="duration">
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
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";
import { useStore } from "vuex";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { formatDateTime, formatDurationSec } from "@/shared/lib/formatters";
import { useCohortUrl } from "@/shared/lib/composables/useCohortUrl";
import ResultsLoader from "@/pages/strategus/characterization/shared/resultsLoader";

const store = useStore();
const loaderState = ref("idle");
const showTable = ref(false);
const rows = ref<any[]>([]);

const filters = ref({
  cohortName: {
    value: null as string | null,
    matchMode: FilterMatchMode.CONTAINS,
  },
  databaseName: {
    value: null as string | null,
    matchMode: FilterMatchMode.CONTAINS,
  },
});

let _ready = false;
const { readUrl, updateUrl } = useCohortUrl();

watch(
  filters,
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
  if (url.genCohort) filters.value.cohortName.value = url.genCohort;
  if (url.genDb) filters.value.databaseName.value = url.genDb;
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
</style>
