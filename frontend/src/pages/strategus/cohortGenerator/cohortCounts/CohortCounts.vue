<template>
  <div class="cohort-counts">
    <div class="section results-body">
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
        dataKey="rowKey"
      >
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
        <Column sortable field="cohortSubjects" :showFilterMenu="false">
          <template #header>
            <div class="col-header-with-filter">
              <span>Subjects</span>
              <FilterInput
                :filterObj="tableFilters.cohortSubjects"
                type="numeric"
              />
            </div>
          </template>
          <template #body="{ data }">{{
            formatComma(data.cohortSubjects)
          }}</template>
        </Column>
        <Column sortable field="cohortEntries" :showFilterMenu="false">
          <template #header>
            <div class="col-header-with-filter">
              <span>Records</span>
              <FilterInput
                :filterObj="tableFilters.cohortEntries"
                type="numeric"
              />
            </div>
          </template>
          <template #body="{ data }">{{
            formatComma(data.cohortEntries)
          }}</template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import FilterInput from "@/pages/strategus/characterization/shared/filterInput";
import { useTableFilter } from "@/pages/strategus/characterization/shared/useTableFilter";
import { useStore } from "vuex";
import { formatComma } from "@/shared/lib/formatters";

const props = defineProps<{
  rows: any[];
}>();

const store = useStore();
const tableRef = ref(null);

const tableFilters = ref({
  cohortId: { value: null as string | null, matchMode: "contains" },
  cohortName: { value: null as string | null, matchMode: "contains" },
  databaseName: { value: null as string | null, matchMode: "contains" },
  cohortSubjects: { value: null as string | null, matchMode: "equals" },
  cohortEntries: { value: null as string | null, matchMode: "equals" },
});

const noDropdownFilters = ref<Record<string, any>>({});

const displayRows = computed(() =>
  props.rows.map((r, i) => ({
    ...r,
    rowKey: `${r.cohortId}-${r.databaseId}-${i}`,
  })),
);

const { filteredRows, applyNow } = useTableFilter(
  () => displayRows.value,
  noDropdownFilters,
  tableFilters,
  ref(""),
  ref({} as Record<string, string>),
  tableRef,
);

watch(displayRows, () => applyNow(), { immediate: true });
</script>

<style scoped>
@import "../../characterization/shared/styles.css";

.cohort-counts {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
