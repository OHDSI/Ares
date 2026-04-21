<template>
  <DataTable
    :value="options"
    :selection="modelValue"
    @update:selection="emit('update:modelValue', $event)"
    :selectionMode="multiple ? 'multiple' : 'single'"
    dataKey="cohortId"
    :paginator="options.length > 10"
    :rows="10"
    filterDisplay="row"
    v-model:filters="filters"
    :striped-rows="store.getters.getSettings.strippedRows"
    size="small"
    class="selector-table"
  >
    <Column
      :selectionMode="multiple ? 'multiple' : 'single'"
      headerStyle="width: 3rem"
    />
    <Column field="parentName" header="Name" sortable :showFilterMenu="false">
      <template #filter="{ filterModel, filterCallback }">
        <InputText
          v-model="filterModel.value"
          @input="filterCallback()"
          placeholder="Search..."
          size="small"
        />
      </template>
    </Column>
    <Column field="cohortName" header="Subset" sortable :showFilterMenu="false">
      <template #filter="{ filterModel, filterCallback }">
        <InputText
          v-model="filterModel.value"
          @input="filterCallback()"
          placeholder="Search..."
          size="small"
        />
      </template>
    </Column>
    <Column field="cohortId" header="Cohort ID" sortable style="width: 100px" />
  </DataTable>
</template>

<script setup lang="ts">
import { useNameFilters } from "../useNameFilters";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import { useStore } from "vuex";

const props = defineProps<{
  modelValue: unknown;
  options: unknown[];
  multiple?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: unknown): void;
}>();

const store = useStore();
const filters = useNameFilters();
</script>

<style scoped>
@import "../styles.css";
</style>
