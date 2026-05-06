<template>
  <DataTable
    :value="props.value"
    v-model:selection="localSelection"
    selectionMode="single"
    dataKey="cohortId"
    :paginator="props.value.length > 15"
    :rows="10"
    :rowsPerPageOptions="[10, 15, 25, 50]"
    filterDisplay="row"
    size="small"
    v-model:filters="targetFilters"
    :striped-rows="store.getters.getSettings.strippedRows"
    class="target-table"
    :loading="props.loading"
    removableSort
  >
    <Column
      field="parentName"
      header="Target"
      sortable
      :showFilterMenu="false"
      style="min-width: 150px"
    >
      <template #filter="{ filterModel, filterCallback }">
        <InputText
          v-model="filterModel.value"
          @input="filterCallback()"
          placeholder="Search..."
          size="small"
        />
      </template>
    </Column>
    <Column
      field="cohortName"
      header="Subset"
      sortable
      :showFilterMenu="false"
      style="min-width: 250px"
    >
      <template #filter="{ filterModel, filterCallback }">
        <InputText
          v-model="filterModel.value"
          @input="filterCallback()"
          placeholder="Search..."
          size="small"
        />
      </template>
    </Column>
    <Column
      field="cohortId"
      header="ID"
      sortable
      :showFilterMenu="false"
      style="width: 80px"
    >
      <template #filter="{ filterModel, filterCallback }">
        <InputText
          v-model="filterModel.value"
          @input="filterCallback()"
          placeholder="Search..."
          size="small"
        />
      </template>
    </Column>
    <Column
      field="databaseComparator"
      header="DB Comp"
      sortable
      :showFilterMenu="false"
      style="width: 80px"
    >
      <template #filter="{ filterModel, filterCallback }">
        <MultiSelect
          v-model="filterModel.value"
          :options="boolOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Any"
          size="small"
          @change="filterCallback()"
        />
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
      header="Cohort Comp"
      sortable
      :showFilterMenu="false"
      style="width: 80px"
    >
      <template #filter="{ filterModel, filterCallback }">
        <MultiSelect
          v-model="filterModel.value"
          :options="boolOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Any"
          size="small"
          @change="filterCallback()"
        />
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
      header="Dechal"
      sortable
      :showFilterMenu="false"
      style="width: 80px"
    >
      <template #filter="{ filterModel, filterCallback }">
        <MultiSelect
          v-model="filterModel.value"
          :options="boolOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Any"
          size="small"
          @change="filterCallback()"
        />
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
      header="Risk Factors"
      sortable
      :showFilterMenu="false"
      style="width: 80px"
    >
      <template #filter="{ filterModel, filterCallback }">
        <MultiSelect
          v-model="filterModel.value"
          :options="boolOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Any"
          size="small"
          @change="filterCallback()"
        />
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
      header="TTE"
      sortable
      :showFilterMenu="false"
      style="width: 80px"
    >
      <template #filter="{ filterModel, filterCallback }">
        <MultiSelect
          v-model="filterModel.value"
          :options="boolOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Any"
          size="small"
          @change="filterCallback()"
        />
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
      header="Case Series"
      sortable
      :showFilterMenu="false"
      style="width: 80px"
    >
      <template #filter="{ filterModel, filterCallback }">
        <MultiSelect
          v-model="filterModel.value"
          :options="boolOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Any"
          size="small"
          @change="filterCallback()"
        />
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
      header="Incidence"
      sortable
      :showFilterMenu="false"
      style="width: 80px"
    >
      <template #filter="{ filterModel, filterCallback }">
        <MultiSelect
          v-model="filterModel.value"
          :options="boolOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Any"
          size="small"
          @change="filterCallback()"
        />
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
import { computed, ref } from "vue";
import { useStore } from "vuex";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import MultiSelect from "primevue/multiselect";
import { FilterMatchMode } from "primevue/api";

const props = defineProps<{
  value: any[];
  loading: boolean;
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

const boolOptions = [
  { label: "Yes", value: 1 },
  { label: "No", value: 0 },
];

const targetFilters = ref({
  parentName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  cohortName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  cohortId: { value: null, matchMode: FilterMatchMode.CONTAINS },
  databaseComparator: { value: null, matchMode: FilterMatchMode.IN },
  cohortComparator: { value: null, matchMode: FilterMatchMode.IN },
  dechalRechal: { value: null, matchMode: FilterMatchMode.IN },
  riskFactors: { value: null, matchMode: FilterMatchMode.IN },
  timeToEvent: { value: null, matchMode: FilterMatchMode.IN },
  caseSeries: { value: null, matchMode: FilterMatchMode.IN },
  cohortIncidence: { value: null, matchMode: FilterMatchMode.IN },
});
</script>
