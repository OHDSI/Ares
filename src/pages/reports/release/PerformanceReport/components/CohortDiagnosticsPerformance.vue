<template>
  <Panel header="Cohort Diagnostics Performance">
    <DataTable
      :striped-rows="store.getters.getSettings.strippedRows"
      size="small"
      :globalFilterFields="['task', 'cohortIds', 'parent']"
      paginator
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      v-model:filters="newFilters"
      :value="data"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
    >
      <template #header>
        <div>
          <InputGroup unstyled>
            <InputGroupAddon>
              <i class="pi pi-search"></i>
            </InputGroupAddon>
            <InputText
              class="rounded-r-lg"
              style="width: 45rem"
              unstyled
              v-model="newFilters['global'].value"
              placeholder="Search in Table"
            />
          </InputGroup>
        </div>
      </template>
      <Column sortable header="Task Name" field="task"> </Column>
      <Column sortable header="ID" field="cohortIds"></Column>
      <Column sortable header="Parent" field="parent"></Column>
      <Column
        style="text-align: end"
        :pt="{ headerContent: 'justify-end' }"
        sortable
        header="Duration (seconds)"
        field="executionTime"
      >
        <template v-slot:body="slotProps">
          <span>{{ parseFloat(slotProps.data.executionTime).toFixed(2) }}</span>
        </template>
      </Column>
    </DataTable>
  </Panel>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useStore } from "vuex";
import Panel from "primevue/panel";
import InputText from "primevue/inputtext";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import { FilterMatchMode } from "primevue/api";
import { COHORT_DIAGNOSTICS_PERFORMANCE } from "@/shared/config/files";

const store = useStore();

const newFilters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const data = computed(() => {
  return store.getters.getData[COHORT_DIAGNOSTICS_PERFORMANCE];
});
</script>

<style scoped></style>
