<template>
  <div class="flex flex-col gap-5">
    <Panel header="Network Unmapped Source Codes">
      <DataTable
        removable-sort
        size="small"
        filterDisplay="row"
        :globalFilterFields="['CDM_TABLE_NAME', 'CDM_FIELD_NAME']"
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
        <Column
          :maxSelectedLabels="2"
          :show-filter-menu="false"
          :show-clear-button="false"
          sortable
          field="CDM_FIELD_NAME"
          filter-field="CDM_FIELD_NAME"
          header="CDM Field"
        >
          <template #body="{ data }">
            {{ data.CDM_FIELD_NAME }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              filter
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="cdmFieldOptions"
              placeholder="Select CDM Field"
              class="p-column-filter w-full"
            >
              <template #option="slotProps">
                {{ slotProps.option }}
              </template>
            </MultiSelect>
          </template>
        </Column>
        <Column
          :maxSelectedLabels="2"
          :show-filter-menu="false"
          :show-clear-button="false"
          sortable
          field="CDM_TABLE_NAME"
          filter-field="CDM_TABLE_NAME"
          header="CDM Table"
        >
          <template #body="{ data }">
            {{ data.CDM_TABLE_NAME }}
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              filter
              v-model="filterModel.value"
              @change="filterCallback()"
              :options="cdmTableOptions"
              placeholder="Select CDM Table"
              class="p-column-filter w-full"
            >
              <template #option="slotProps">
                {{ slotProps.option }}
              </template>
            </MultiSelect>
          </template>
        </Column>
        <Column sortable header="Source Value" field="SOURCE_VALUE"> </Column>

        <Column sortable header="Data Sources" field="DATA_SOURCES"></Column>
        <Column
          :pt="{ headerContent: 'justify-end' }"
          sortable
          header="# Data Sources"
          field="DATA_SOURCE_COUNT"
        >
          <template #body="slotProps">
            <div class="flex justify-end">
              <span> {{ slotProps.data.DATA_SOURCE_COUNT }}</span>
            </div>
          </template>
        </Column>
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

    <Panel header="Pivot Table">
      <Pivot
        :data="store.getters.getData.domainTable"
        :attributes="[
          'CDM_TABLE_NAME',
          'CDM_FIELD_NAME',
          'SOURCE_VALUE',
          'RECORD_COUNT',
          'DATA_SOURCES',
          'DATA_SOURCE_COUNT',
        ]"
        :aggregate-attrs="['RECORD_COUNT', 'DATA_SOURCE_COUNT']"
        :aggregator-names-list="['Count', 'Sum']"
      />
    </Panel>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useStore } from "vuex";
import InputGroup from "primevue/inputgroup";
import InputText from "primevue/inputtext";
import InputGroupAddon from "primevue/inputgroupaddon";
import Panel from "primevue/panel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { FilterMatchMode } from "primevue/api";
import { helpers } from "@/shared/lib/mixins";
import Pivot from "@/widgets/pivot/ui/Pivot.vue";
import MultiSelect from "primevue/multiselect";

const store = useStore();

const data = computed(() => {
  return store.getters.getData.domainTable;
});

const newFilters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  CDM_TABLE_NAME: { value: null, matchMode: FilterMatchMode.IN },
  CDM_FIELD_NAME: { value: null, matchMode: FilterMatchMode.IN },
});

const cdmTableOptions = computed(() => {
  return helpers.getValuesArray(data.value, "CDM_TABLE_NAME", true);
});
const cdmFieldOptions = computed(() => {
  return helpers.getValuesArray(data.value, "CDM_FIELD_NAME", true);
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
