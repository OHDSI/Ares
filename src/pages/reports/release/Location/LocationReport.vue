<template>
  <div class="flex flex-col gap-10">
    <Panel header="Location Report">
      <DataTable
        removable-sort
        size="small"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        :value="data"
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <Column sortable header="Location ID" field="LOCATION_ID"> </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="Location Name"
          field="LOCATION_NAME"
        >
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="# of People"
          field="COUNT_PERSONS"
        >
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="% Persons"
          field="PERCENT_PERSONS"
        >
          <template #body="slotProps">
            <div>{{ (slotProps.data.PERCENT_PERSONS * 100).toFixed(2) }} %</div>
          </template>
        </Column>
      </DataTable>
    </Panel>
  </div>
</template>

<script setup lang="ts">
import Panel from "primevue/panel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { useStore } from "vuex";
import { computed } from "vue";
import { LOCATION } from "@/shared/config/files";

const store = useStore();

const data = computed(() => {
  return store.getters.getData[LOCATION];
});
</script>

<style scoped></style>
