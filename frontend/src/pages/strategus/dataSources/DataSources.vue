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
        scrollable
        scrollHeight="flex"
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
            <div style="display: flex; align-items: center">
              <span>{{ data.cdmSourceName }}</span>
              <Tooltip v-if="data.sourceDescription" :text="data.sourceDescription">
                <i
                  class="pi pi-info-circle"
                  style="margin-left: 0.5rem; color: #94a3b8; cursor: help; flex-shrink: 0"
                />
              </Tooltip>
            </div>
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
import { ref, computed, onMounted } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";
import { useStore } from "vuex";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import { formatDate } from "@/shared/lib/formatters";
import Tooltip from "@/shared/ui/tooltip";

const store = useStore();
const data = ref([]);
const darkMode = computed(() => store.getters.getSettings.darkMode);
const sectionBg = computed(() => (darkMode.value ? "#212121" : "#ffffff"));
const sectionBorder = computed(() => (darkMode.value ? "#3a3a3a" : "#94a3b8"));
const headerColor = computed(() => (darkMode.value ? "#f1f5f9" : "#1e293b"));
const loading = ref(false);

const filters = ref({
  cdmSourceName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  cdmSourceAbbreviation: { value: null, matchMode: FilterMatchMode.CONTAINS },
  cdmHolder: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

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
  color: v-bind(headerColor);
}

.section {
  background: v-bind(sectionBg);
  border: 1.5px solid v-bind(sectionBorder);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  height: calc(100vh - 16rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
</style>
