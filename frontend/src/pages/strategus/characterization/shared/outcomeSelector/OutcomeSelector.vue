<template>
  <DataTable
    ref="tableRef"
    :value="filteredRows"
    :selection="modelValue"
    @update:selection="emit('update:modelValue', $event)"
    :selectionMode="multiple ? 'multiple' : 'single'"
    dataKey="cohortId"
    :paginator="sortedOptions.length > 10"
    :rows="10"
    :striped-rows="store.getters.getSettings.strippedRows"
    size="small"
    class="selector-table"
    :rowClass="getRowClass"
  >
    <Column field="parentName" sortable :showFilterMenu="false">
      <template #header>
        <div class="col-header-with-filter">
          <span>Name</span>
          <FilterInput
            :filterObj="tableFilters.parentName"
            placeholder="Search..."
          />
        </div>
      </template>
      <template #body="{ data }">
        <span>{{ data.parentName }}</span>
        <span v-if="isUnavailable(data)" class="no-data-tag">no data</span>
      </template>
    </Column>
    <Column field="cohortName" sortable :showFilterMenu="false">
      <template #header>
        <div class="col-header-with-filter">
          <span>Subset</span>
          <FilterInput
            :filterObj="tableFilters.cohortName"
            placeholder="Search..."
          />
        </div>
      </template>
    </Column>
    <Column
      field="cohortId"
      sortable
      style="width: 100px"
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
  </DataTable>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import FilterInput from "../filterInput";
import { useTableFilter } from "../useTableFilter";
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

const tableRef = ref(null);

const tableFilters = ref({
  parentName: { value: null as string | null, matchMode: "contains" },
  cohortName: { value: null as string | null, matchMode: "contains" },
  cohortId: { value: null as string | null, matchMode: "contains" },
});

const noDropdownFilters = ref<Record<string, any>>({});

function isUnavailable(row: any): boolean {
  return !!props.availabilityKey && row[props.availabilityKey] === false;
}

const sortedOptions = computed(() => {
  if (!props.availabilityKey) return props.options;
  return [...props.options].sort(
    (a: any, b: any) => Number(isUnavailable(a)) - Number(isUnavailable(b)),
  );
});

const { filteredRows, applyNow } = useTableFilter(
  () => sortedOptions.value,
  noDropdownFilters,
  tableFilters,
  ref(""),
  ref({} as Record<string, string>),
  tableRef,
);

watch(sortedOptions, () => applyNow(), { immediate: true });

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
