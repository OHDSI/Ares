<template>
  <div class="datasources">
    <div class="section-header">
      <h3>Data Sources</h3>
    </div>

    <div v-if="error" class="table-section error-section">
      <Message severity="error" :closable="false">
        Unable to reach the backend. Check that the server is running.
      </Message>
    </div>

    <Transition name="tab-fade">
      <div v-if="showTable" class="table-section">
        <DataTable
          ref="tableRef"
          :striped-rows="store.getters.getSettings.strippedRows"
          removable-sort
          size="small"
          paginator
          currentPageReportTemplate="{first} to {last} of {totalRecords}"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
          :value="filteredRows"
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          scrollable
          scrollHeight="flex"
        >
          <Column sortable field="cdmSourceName" :showFilterMenu="false">
            <template #header>
              <div class="col-header-with-filter">
                <span>Full DB Name</span>
                <FilterInput
                  :filterObj="tableFilters.cdmSourceName"
                  placeholder="Search..."
                />
              </div>
            </template>
            <template #body="{ data }">
              <div style="display: flex; align-items: center">
                <span>{{ data.cdmSourceName }}</span>
                <Tooltip
                  v-if="data.sourceDescription"
                  :text="data.sourceDescription"
                >
                  <i
                    class="pi pi-info-circle"
                    style="
                      margin-left: 0.5rem;
                      color: var(--color-text-subtle);
                      cursor: help;
                      flex-shrink: 0;
                    "
                  />
                </Tooltip>
              </div>
            </template>
          </Column>
          <Column
            sortable
            field="cdmSourceAbbreviation"
            :showFilterMenu="false"
          >
            <template #header>
              <div class="col-header-with-filter">
                <span>DB Name</span>
                <FilterInput
                  :filterObj="tableFilters.cdmSourceAbbreviation"
                  placeholder="Search..."
                />
              </div>
            </template>
          </Column>
          <Column sortable field="cdmHolder" :showFilterMenu="false">
            <template #header>
              <div class="col-header-with-filter">
                <span>DB Holder</span>
                <FilterInput
                  :filterObj="tableFilters.cdmHolder"
                  placeholder="Search..."
                />
              </div>
            </template>
          </Column>
          <Column header="Docs" field="sourceDocumentationReference">
            <template #body="{ data }">
              <a
                v-if="
                  data.sourceDocumentationReference &&
                  data.sourceDocumentationReference !== 'None'
                "
                :href="data.sourceDocumentationReference"
                target="_blank"
                rel="noopener"
                class="table-link"
              >
                <i class="pi pi-external-link" />
              </a>
              <span v-else class="no-link">—</span>
            </template>
          </Column>
          <Column header="ETL" field="cdmEtlReference">
            <template #body="{ data }">
              <a
                v-if="data.cdmEtlReference && data.cdmEtlReference !== 'None'"
                :href="data.cdmEtlReference"
                target="_blank"
                rel="noopener"
                class="table-link"
              >
                <i class="pi pi-external-link" />
              </a>
              <span v-else class="no-link">—</span>
            </template>
          </Column>
          <Column sortable field="sourceReleaseDate" :showFilterMenu="false">
            <template #header>
              <div class="col-header-with-filter">
                <span>Source Release</span>
                <FilterInput
                  :filterObj="tableFilters.sourceReleaseDate"
                  placeholder="Search..."
                />
              </div>
            </template>
            <template #body="{ data }">{{
              formatDate(data.sourceReleaseDate)
            }}</template>
          </Column>
          <Column sortable field="cdmReleaseDate" :showFilterMenu="false">
            <template #header>
              <div class="col-header-with-filter">
                <span>CDM Release</span>
                <FilterInput
                  :filterObj="tableFilters.cdmReleaseDate"
                  placeholder="Search..."
                />
              </div>
            </template>
            <template #body="{ data }">{{
              formatDate(data.cdmReleaseDate)
            }}</template>
          </Column>
          <Column sortable field="cdmVersion" :showFilterMenu="false">
            <template #header>
              <div class="col-header-with-filter">
                <span>CDM Ver.</span>
                <FilterInput
                  :filterObj="tableFilters.cdmVersion"
                  placeholder="Search..."
                />
              </div>
            </template>
          </Column>
          <Column sortable field="vocabularyVersion" :showFilterMenu="false">
            <template #header>
              <div class="col-header-with-filter">
                <span>Vocab Ver.</span>
                <FilterInput
                  :filterObj="tableFilters.vocabularyVersion"
                  placeholder="Search..."
                />
              </div>
            </template>
          </Column>
          <Column sortable field="databaseId" :showFilterMenu="false">
            <template #header>
              <div class="col-header-with-filter">
                <span>DB ID</span>
                <FilterInput
                  :filterObj="tableFilters.databaseId"
                  placeholder="Search..."
                />
              </div>
            </template>
          </Column>
          <Column sortable field="maxObsPeriodEndDate" :showFilterMenu="false">
            <template #header>
              <div class="col-header-with-filter">
                <span>Max Obs. End</span>
                <FilterInput
                  :filterObj="tableFilters.maxObsPeriodEndDate"
                  placeholder="Search..."
                />
              </div>
            </template>
            <template #body="{ data }">{{
              formatDate(data.maxObsPeriodEndDate)
            }}</template>
          </Column>
        </DataTable>
      </div>
    </Transition>

    <ResultsLoader :loader-state="loaderState" :text="'Loading data sources'" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Message from "primevue/message";
import { useStore } from "vuex";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { formatDate } from "@/shared/lib/formatters";
import Tooltip from "@/shared/ui/tooltip";
import ResultsLoader from "@/pages/strategus/characterization/shared/resultsLoader";
import FilterInput from "@/pages/strategus/characterization/shared/filterInput";
import { useTableFilter } from "@/pages/strategus/characterization/shared/useTableFilter";

const store = useStore();
const data = ref([]);
const loaderState = ref("idle");
const showTable = ref(false);
const error = ref(false);
const tableRef = ref(null);

const tableFilters = ref({
  cdmSourceName: { value: null as string | null, matchMode: "contains" },
  cdmSourceAbbreviation: {
    value: null as string | null,
    matchMode: "contains",
  },
  cdmHolder: { value: null as string | null, matchMode: "contains" },
  sourceReleaseDate: { value: null as string | null, matchMode: "contains" },
  cdmReleaseDate: { value: null as string | null, matchMode: "contains" },
  cdmVersion: { value: null as string | null, matchMode: "contains" },
  vocabularyVersion: { value: null as string | null, matchMode: "contains" },
  databaseId: { value: null as string | null, matchMode: "contains" },
  maxObsPeriodEndDate: { value: null as string | null, matchMode: "contains" },
});

const noDropdownFilters = ref<Record<string, any>>({});

const { filteredRows, applyNow } = useTableFilter(
  () => data.value,
  noDropdownFilters,
  tableFilters,
  ref(""),
  ref({} as Record<string, string>),
  tableRef,
);

onMounted(async () => {
  loaderState.value = "loading";
  const loadStart = Date.now();
  try {
    const res = await StrategusService.dataSources.getDataSources();
    data.value = res.data ?? [];
    applyNow();
    if (Date.now() - loadStart >= 600) {
      loaderState.value = "success";
      await new Promise((r) => setTimeout(r, 1100));
    }
    loaderState.value = "idle";
    await new Promise((r) => setTimeout(r, 220));
    showTable.value = true;
  } catch (e) {
    console.error("Failed to load datasources:", e);
    error.value = true;
    loaderState.value = "error";
  }
});
</script>

<style scoped>
@import "../characterization/shared/styles.css";

.datasources {
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

.table-section {
  background: var(--color-bg-surface);
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  height: calc(100vh - 16rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.error-section {
  height: auto;
}

.table-link {
  color: inherit;
  font-size: 0.8125rem;
}

.table-link:hover {
  color: inherit;
}

.no-link {
  color: var(--text-color-secondary, #cbd5e1);
}

.tab-fade-enter-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
</style>
