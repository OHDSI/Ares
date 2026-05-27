<template>
  <div class="cohort-counts">
    <div class="section results-body">
      <DataTable
        :value="displayRows"
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
        dataKey="rowKey"
      >
        <Column
          sortable
          header="Cohort ID"
          field="cohortId"
          style="width: 7rem"
        />
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
        <Column sortable header="Subjects" field="cohortSubjects">
          <template #body="{ data }">{{
            formatComma(data.cohortSubjects)
          }}</template>
        </Column>
        <Column sortable header="Records" field="cohortEntries">
          <template #body="{ data }">{{
            formatComma(data.cohortEntries)
          }}</template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";
import { useStore } from "vuex";
import { formatComma } from "@/shared/lib/formatters";

const props = defineProps<{
  rows: any[];
}>();

const store = useStore();

const filters = ref({
  cohortName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  databaseName: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const displayRows = computed(() =>
  props.rows.map((r, i) => ({
    ...r,
    rowKey: `${r.cohortId}-${r.databaseId}-${i}`,
  })),
);
</script>

<style scoped>
@import "../../characterization/shared/styles.css";

.cohort-counts {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
