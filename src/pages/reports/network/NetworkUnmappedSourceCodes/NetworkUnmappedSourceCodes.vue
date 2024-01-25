<template>
  <Panel
    v-if="store.getters.dataInStore"
    header="Network Unmapped Source Codes"
  >
    <DataTable
      removable-sort
      size="small"
      :globalFilterFields="['CDM_TABLE_NAME', 'CDM_FIELD_NAME']"
      paginator
      v-model:filters="newFilters"
      :value="store.getters.getData.domainTable"
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
      <Column sortable header="CDM Table" field="CDM_TABLE_NAME"> </Column>
      <Column sortable header="CDM Field" field="CDM_FIELD_NAME"> </Column>
      <Column sortable header="Source Value" field="SOURCE_VALUE"> </Column>
      <Column
        sortable
        header="# Data Sources"
        field="DATA_SOURCE_COUNT"
      ></Column>
      <Column sortable header="Data Sources" field="DATA_SOURCES"></Column>
      <Column
        :pt="{ headerContent: 'justify-end' }"
        sortable
        header="# Records"
        field="RECORD_COUNT"
      >
        <template #body="slotProps">
          <div class="flex justify-end">
            <span>
              {{
                slotProps.data.RECORD_COUNT
                  ? helpers.formatComma(slotProps.data.RECORD_COUNT)
                  : "No data"
              }}</span
            >
          </div>
        </template>
      </Column>
    </DataTable>
  </Panel>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useStore } from "vuex";
import InputGroup from "primevue/inputgroup";
import InputText from "primevue/inputtext";
import InputGroupAddon from "primevue/inputgroupaddon";
import Panel from "primevue/panel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { FilterMatchMode } from "primevue/api";
import { helpers } from "@/shared/lib/mixins";

const store = useStore();

const newFilters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
</script>

<style scoped>
td {
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
