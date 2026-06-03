<template>
  <DataTable
    ref="tableRef"
    :value="filteredRows"
    v-model:selection="localSelection"
    selectionMode="single"
    dataKey="cohortId"
    :paginator="props.value.length > 15"
    :rows="10"
    :rowsPerPageOptions="[10, 15, 25, 50]"
    size="small"
    :striped-rows="store.getters.getSettings.strippedRows"
    class="target-table"
    removableSort
  >
    <Column
      field="parentName"
      sortable
      :showFilterMenu="false"
      style="min-width: 150px"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Target</span>
          <FilterInput
            :filterObj="tableFilters.parentName"
            placeholder="Search..."
          />
        </div>
      </template>
    </Column>
    <Column
      field="cohortName"
      sortable
      :showFilterMenu="false"
      style="min-width: 250px"
    >
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
      :showFilterMenu="false"
      style="width: 80px"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>ID</span>
          <FilterInput
            :filterObj="tableFilters.cohortId"
            placeholder="Search..."
          />
        </div>
      </template>
    </Column>
    <Column
      field="databaseComparator"
      sortable
      :showFilterMenu="false"
      style="width: 80px"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>DB Comp</span>
          <Dropdown
            v-model="dropdownFilters.databaseComparator"
            :options="boolOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="All"
            showClear
            class="filter-dropdown"
            @click.stop
          />
        </div>
      </template>
      <template #body="{ data }">
        <i
          :class="
            data.databaseComparator
              ? 'pi pi-check text-green-600 dark:text-green-400'
              : 'pi pi-times text-red-400 dark:text-slate-500'
          "
        />
      </template>
    </Column>
    <Column
      field="cohortComparator"
      sortable
      :showFilterMenu="false"
      style="width: 80px"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Cohort Comp</span>
          <Dropdown
            v-model="dropdownFilters.cohortComparator"
            :options="boolOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="All"
            showClear
            class="filter-dropdown"
            @click.stop
          />
        </div>
      </template>
      <template #body="{ data }">
        <i
          :class="
            data.cohortComparator
              ? 'pi pi-check text-green-600 dark:text-green-400'
              : 'pi pi-times text-red-400 dark:text-slate-500'
          "
        />
      </template>
    </Column>
    <Column
      field="dechalRechal"
      sortable
      :showFilterMenu="false"
      style="width: 80px"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Dechal</span>
          <Dropdown
            v-model="dropdownFilters.dechalRechal"
            :options="boolOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="All"
            showClear
            class="filter-dropdown"
            @click.stop
          />
        </div>
      </template>
      <template #body="{ data }">
        <i
          :class="
            data.dechalRechal
              ? 'pi pi-check text-green-600 dark:text-green-400'
              : 'pi pi-times text-red-400 dark:text-slate-500'
          "
        />
      </template>
    </Column>
    <Column
      field="riskFactors"
      sortable
      :showFilterMenu="false"
      style="width: 80px"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Risk Factors</span>
          <Dropdown
            v-model="dropdownFilters.riskFactors"
            :options="boolOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="All"
            showClear
            class="filter-dropdown"
            @click.stop
          />
        </div>
      </template>
      <template #body="{ data }">
        <i
          :class="
            data.riskFactors
              ? 'pi pi-check text-green-600 dark:text-green-400'
              : 'pi pi-times text-red-400 dark:text-slate-500'
          "
        />
      </template>
    </Column>
    <Column
      field="timeToEvent"
      sortable
      :showFilterMenu="false"
      style="width: 80px"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>TTE</span>
          <Dropdown
            v-model="dropdownFilters.timeToEvent"
            :options="boolOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="All"
            showClear
            class="filter-dropdown"
            @click.stop
          />
        </div>
      </template>
      <template #body="{ data }">
        <i
          :class="
            data.timeToEvent
              ? 'pi pi-check text-green-600 dark:text-green-400'
              : 'pi pi-times text-red-400 dark:text-slate-500'
          "
        />
      </template>
    </Column>
    <Column
      field="caseSeries"
      sortable
      :showFilterMenu="false"
      style="width: 80px"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Case Series</span>
          <Dropdown
            v-model="dropdownFilters.caseSeries"
            :options="boolOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="All"
            showClear
            class="filter-dropdown"
            @click.stop
          />
        </div>
      </template>
      <template #body="{ data }">
        <i
          :class="
            data.caseSeries
              ? 'pi pi-check text-green-600 dark:text-green-400'
              : 'pi pi-times text-red-400 dark:text-slate-500'
          "
        />
      </template>
    </Column>
    <Column
      field="cohortIncidence"
      sortable
      :showFilterMenu="false"
      style="width: 80px"
    >
      <template #header>
        <div class="col-header-with-filter">
          <span>Incidence</span>
          <Dropdown
            v-model="dropdownFilters.cohortIncidence"
            :options="boolOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="All"
            showClear
            class="filter-dropdown"
            @click.stop
          />
        </div>
      </template>
      <template #body="{ data }">
        <i
          :class="
            data.cohortIncidence
              ? 'pi pi-check text-green-600 dark:text-green-400'
              : 'pi pi-times text-red-400 dark:text-slate-500'
          "
        />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dropdown from "primevue/dropdown";
import FilterInput from "../../shared/filterInput";
import { useTableFilter } from "../../shared/useTableFilter";

const props = defineProps<{
  value: any[];
  selection: any;
}>();

const emit = defineEmits<{
  (e: "update:selection", val: any): void;
}>();

const store = useStore();

const localSelection = computed({
  get: () => props.selection,
  set: (val) => emit("update:selection", val),
});

const tableRef = ref(null);

const boolOptions = [
  { label: "Yes", value: 1 },
  { label: "No", value: 0 },
];

const tableFilters = ref({
  parentName: { value: null as string | null, matchMode: "contains" },
  cohortName: { value: null as string | null, matchMode: "contains" },
  cohortId: { value: null as string | null, matchMode: "contains" },
});

const dropdownFilters = ref<Record<string, any>>({
  databaseComparator: null,
  cohortComparator: null,
  dechalRechal: null,
  riskFactors: null,
  timeToEvent: null,
  caseSeries: null,
  cohortIncidence: null,
});

const { filteredRows, applyNow } = useTableFilter(
  () => props.value,
  dropdownFilters,
  tableFilters,
  ref(""),
  ref({} as Record<string, string>),
  tableRef,
);

watch(
  () => props.value,
  () => applyNow(),
  { immediate: true },
);
</script>

<style scoped>
@import "../../shared/styles.css";

:deep(.filter-dropdown) {
  height: 1.5rem;
}
:deep(.filter-dropdown .p-dropdown-label) {
  padding: 0.2rem 1.25rem 0.2rem 0.4rem;
  font-size: 0.72rem;
}
:deep(.filter-dropdown .p-dropdown-trigger) {
  width: 1.5rem;
}
:deep(.filter-dropdown .p-dropdown-clear-icon) {
  right: 1.75rem;
}
</style>
