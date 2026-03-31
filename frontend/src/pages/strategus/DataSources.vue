<template>
  <div class="datasources">
    <div class="section-header">
      <h3>Data Sources</h3>
    </div>
    <div class="section">
      <DataTable
        :striped-rows="store.getters.getSettings.strippedRows"
        removable-sort
        size="small"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :value="data"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        :loading="loading"
        filterDisplay="row"
        v-model:filters="filters"
      >
        <Column
          sortable
          header="Full DB Name"
          field="cdmSourceName"
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
          <template #body="{ data }">
            <span>{{ data.cdmSourceName }}</span>
            <i
              v-if="data.sourceDescription"
              v-tooltip.top="{
                value: data.sourceDescription,
                pt: {
                  root: 'absolute',
                  arrow: {
                    style: {
                      borderTopColor: 'var(--surface-800)',
                    },
                  },
                  text: 'border rounded bg-surface-800 dark:bg-surface-50 text-white dark:text-black font-light p-2 break-words text-wrap max-w-[20ch]',
                },
              }"
              class="pi pi-info-circle"
              style="margin-left: 0.5rem; color: #94a3b8; cursor: help"
            />
          </template>
        </Column>
        <Column
          sortable
          header="DB Name"
          field="cdmSourceAbbreviation"
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
          header="DB Holder"
          field="cdmHolder"
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
        <Column sortable header="Source Release" field="sourceReleaseDate">
          <template #body="{ data }">{{
            formatDate(data.sourceReleaseDate)
          }}</template>
        </Column>
        <Column sortable header="CDM Release" field="cdmReleaseDate">
          <template #body="{ data }">{{
            formatDate(data.cdmReleaseDate)
          }}</template>
        </Column>
        <Column sortable header="CDM Ver." field="cdmVersion" />
        <Column sortable header="Vocab Ver." field="vocabularyVersion" />
        <Column sortable header="DB ID" field="databaseId" />
        <Column sortable header="Max Obs. End" field="maxObsPeriodEndDate">
          <template #body="{ data }">{{
            formatDate(data.maxObsPeriodEndDate)
          }}</template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";
import { useStore } from "vuex";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";

const store = useStore();
const data = ref([]);
const loading = ref(false);

const filters = ref({
  cdmSourceName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  cdmSourceAbbreviation: { value: null, matchMode: FilterMatchMode.CONTAINS },
  cdmHolder: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

function formatDate(val: string | null) {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

onMounted(async () => {
  loading.value = true;
  try {
    const res = await StrategusService.dataSources.getDataSources();
    data.value = res.data ?? [];
  } catch (e) {
    console.error("Failed to load datasources:", e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.datasources {
  max-width: 1400px;
}

.section-header {
  margin-bottom: 1rem;
}

.section-header h3 {
  font-weight: 700;
  margin: 0;
  color: var(--text-color, #1e293b);
}

.section {
  background: var(--bg-surface-0, #ffffff);
  border: 1px solid var(--bg-surface-300, #cbd5e1);
  border-radius: 8px;
  padding: 1rem;
}

.table-link {
  color: var(--primary-500, #3b82f6);
  font-size: 0.8125rem;
}

.table-link:hover {
  color: var(--primary-700, #1d4ed8);
}

.no-link {
  color: var(--text-color-secondary, #cbd5e1);
}
</style>
