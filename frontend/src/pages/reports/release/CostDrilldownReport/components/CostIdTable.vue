<template>
  <Panel header="Cost Type Concept Id Table">
    <div class="p-5">
      <DataTable
        :striped-rows="store.getters.getSettings.strippedRows"
        removable-sort
        size="small"
        :filters="filters"
        :value="props.data"
        :globalFilterFields="['COST_ID']"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        filterDisplay="row"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <template #header>
          <div class="flex flex-row gap-10">
            <InputGroup unstyled>
              <InputGroupAddon>
                <i class="pi pi-search"></i>
              </InputGroupAddon>
              <InputText
                class="rounded-r-lg"
                style="width: 45rem"
                unstyled
                v-model="filters.global.value"
                placeholder="Search in Table"
              />
            </InputGroup>
          </div>
        </template>

        <Column
          style="text-align: start"
          :pt="{ headerContent: 'justify-start' }"
          sortable
          :show-filter-menu="false"
          :show-clear-button="false"
          field="COST_ID"
          header="Cost ID"
        >
        </Column>
        <Column
          style="text-align: end"
          :pt="{ headerContent: 'justify-end' }"
          sortable
          :show-filter-menu="false"
          :show-clear-button="false"
          field="TOTAL_COST"
          header="Total Cost"
        >
          <template #body="slotProps">
            {{
              parseFloat(slotProps.data.TOTAL_COST) &&
              !isNaN(parseFloat(slotProps.data.TOTAL_COST))
                ? `$ ${formatComma(slotProps.data.TOTAL_COST)}`
                : "No data"
            }}
          </template>
        </Column>
      </DataTable>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import Panel from "primevue/panel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { useStore } from "vuex";
import { ref } from "vue";
import { FilterMatchMode } from "primevue/api";
import InputGroup from "primevue/inputgroup";
import InputText from "primevue/inputtext";
import InputGroupAddon from "primevue/inputgroupaddon";
import { formatComma } from "@/shared/lib/mixins/methods/formatComma";

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

interface Props {
  data: [];
}

const props = defineProps<Props>();

const store = useStore();
</script>

<style scoped>
.p-inputtext {
  width: 100%;
}
</style>
