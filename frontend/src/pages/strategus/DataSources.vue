<template>
  <Panel header="Data Sources">
    <div class="p-4">
      <DataTable
        :striped-rows="store.getters.getSettings.strippedRows"
        removable-sort
        size="small"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :value="data"
        :rows="5"
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
                      borderRightColor: 'var(--primary-color)',
                    },
                  },
                  text: 'border rounded bg-surface-800 dark:bg-surface-50 text-white dark:text-black font-light p-2 break-words text-wrap max-w-[20ch]',
                },
              }"
              class="pi pi-info-circle"
              style="margin-left: 0.5rem; color: #6b7280; cursor: help"
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
        <!--        <Column header="DB Description" field="sourceDescription" />-->
        <Column
          header="DB Description Link"
          field="sourceDocumentationReference"
        >
          <template #body="{ data }">
            <a
              v-if="
                data.sourceDocumentationReference &&
                data.sourceDocumentationReference !== 'None'
              "
              :href="data.sourceDocumentationReference"
              target="_blank"
              rel="noopener"
            >
              Link
            </a>
            <span v-else>No link available</span>
          </template>
        </Column>
        <Column sortable header="DB ETL Link" field="cdmEtlReference">
          <template #body="{ data }">
            <a
              v-if="data.cdmEtlReference && data.cdmEtlReference !== 'None'"
              :href="data.cdmEtlReference"
              target="_blank"
              rel="noopener"
            >
              Link
            </a>
            <span v-else>No link available</span>
          </template>
        </Column>
        <Column
          sortable
          header="Source Data Release Date"
          field="sourceReleaseDate"
        >
          <template #body="{ data }">{{
            formatDate(data.sourceReleaseDate)
          }}</template>
        </Column>
        <Column sortable header="CDM DB Release Date" field="cdmReleaseDate">
          <template #body="{ data }">{{
            formatDate(data.cdmReleaseDate)
          }}</template>
        </Column>
        <Column sortable header="CDM Version" field="cdmVersion" />
        <Column
          sortable
          header="Vocabulary Version"
          field="vocabularyVersion"
        />
        <Column sortable header="DB ID" field="databaseId" />
        <Column
          sortable
          header="Max Obs. Period End Date"
          field="maxObsPeriodEndDate"
        >
          <template #body="{ data }">{{
            formatDate(data.maxObsPeriodEndDate)
          }}</template>
        </Column>
      </DataTable>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import Tooltip from "primevue/tooltip";
import { ref, onMounted } from "vue";
import Panel from "primevue/panel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";
import { useStore } from "vuex";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";
import Button from "primevue/button";

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

<style scoped></style>
