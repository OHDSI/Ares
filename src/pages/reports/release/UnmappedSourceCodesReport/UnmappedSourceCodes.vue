<template>
  <div class="flex flex-col gap-5">
    <Panel header="Unmapped Source Codes">
      <DataTable
        removable-sort
        filterDisplay="row"
        size="small"
        :globalFilterFields="['CDM_TABLE_NAME', 'CDM_FIELD_NAME']"
        paginator
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        v-model:filters="newFilters"
        :value="filteredRecords"
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
      <template #footer>
        <div class="flex flex-row gap-2">
          <ChartActionIcon
            v-if="
              store.getters.getQueryIndex &&
              store.getters.getQueryIndex.TEMPORAL_CHARACTERIZATION
            "
            :icon="mdiHelpCircle"
            tooltip="This report identifies columns in tables within the CDM where values are
    mapped to 0 (unknown concept). It provides a listing of all unmapped source
    values to be reviewed for potential inclusion or remediation."
            @iconClicked="
              helpers.openNewTab(
                links.getSqlQueryLink(
                  store.getters.getQueryIndex.TEMPORAL_CHARACTERIZATION[0]
                )
              )
            "
          />
        </div>
      </template>
    </Panel>
    <Panel header="Pivot Table">
      <Pivot
        :data="store.getters.getData.domainTable"
        :attributes="[
          'CDM_TABLE_NAME',
          'CDM_FIELD_NAME',
          'SOURCE_VALUE',
          'RECORD_COUNT',
        ]"
        :aggregate-attrs="['RECORD_COUNT']"
        :aggregator-names-list="['Count', 'Sum']"
      />
    </Panel>
  </div>
</template>

<script setup lang="ts">
import { helpers } from "@/shared/lib/mixins";
import { computed, ref } from "vue";
import { useStore } from "vuex";

import InputGroup from "primevue/inputgroup";
import InputText from "primevue/inputtext";
import InputGroupAddon from "primevue/inputgroupaddon";
import Panel from "primevue/panel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { FilterMatchMode } from "primevue/api";
import { mdiHelpCircle } from "@mdi/js";
import { links } from "@/shared/config/links";
import ChartActionIcon from "@/entities/toggleIcon/ToggleIcon.vue";
import Pivot from "@/widgets/pivot/ui/Pivot.vue";
import MultiSelect from "primevue/multiselect";

const store = useStore();

const filters = ref({});
const newFilters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  CDM_TABLE_NAME: { value: null, matchMode: FilterMatchMode.IN },
  CDM_FIELD_NAME: { value: null, matchMode: FilterMatchMode.IN },
});

const cdmTableOptions = computed(() => {
  return helpers.getValuesArray(filteredRecords.value, "CDM_TABLE_NAME", true);
});
const cdmFieldOptions = computed(() => {
  return helpers.getValuesArray(filteredRecords.value, "CDM_FIELD_NAME", true);
});

const filteredRecords = computed(function () {
  return store.getters.getData.domainTable.filter((d) => {
    return Object.keys(filters.value).every((f) => {
      return (
        filters.value[f as keyof typeof filters].length < 1 ||
        filters.value[f].includes(d[f])
      );
    });
  });
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
