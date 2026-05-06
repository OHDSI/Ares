<template>
  <DataTable
    :value="sortedOptions"
    :selection="modelValue"
    @update:selection="emit('update:modelValue', $event)"
    :selectionMode="multiple ? 'multiple' : 'single'"
    dataKey="cohortId"
    :paginator="sortedOptions.length > 10"
    :rows="10"
    filterDisplay="row"
    v-model:filters="filters"
    :striped-rows="store.getters.getSettings.strippedRows"
    size="small"
    class="selector-table"
    :rowClass="getRowClass"
  >
    <Column
      :selectionMode="multiple ? 'multiple' : 'single'"
      headerStyle="width: 3rem"
    />
    <Column field="parentName" header="Name" sortable :showFilterMenu="false">
      <template #body="{ data }">
        <span>{{ data.parentName }}</span>
        <span v-if="isUnavailable(data)" class="no-data-tag">no data</span>
      </template>
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
import { computed } from "vue";
import { useNameFilters } from "../useNameFilters";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import { useStore } from "vuex";

const props = defineProps<{
  modelValue: unknown;
  options: unknown[];
  multiple?: boolean;
  availabilityKey?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: unknown): void;
}>();

const store = useStore();
const filters = useNameFilters();

function isUnavailable(row: any): boolean {
  return !!props.availabilityKey && row[props.availabilityKey] === false;
}

const sortedOptions = computed(() => {
  if (!props.availabilityKey) return props.options;
  return [...props.options].sort(
    (a: any, b: any) => Number(isUnavailable(a)) - Number(isUnavailable(b))
  );
});

function getRowClass(row: any): string | null {
  return isUnavailable(row) ? "outcome-unavailable" : null;
}
</script>

<style scoped>
@import "../styles.css";

.outcome-unavailable {
  opacity: 0.5;
}

.no-data-tag {
  font-size: 0.625rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: 3px;
  padding: 0 4px;
  margin-left: 6px;
  vertical-align: middle;
}
</style>
