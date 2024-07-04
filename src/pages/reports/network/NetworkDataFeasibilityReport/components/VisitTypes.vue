<template>
  <Panel toggleable header="Visit Type Requirements">
    <div class="flex flex-row gap-10">
      <DataTable
        class="flex-grow"
        v-model:selection="visitTypesSelected"
        removable-sort
        v-model:filters="visitTypesFilter"
        :globalFilterFields="['concept_id', 'concept_name', '']"
        size="small"
        :value="getVisitTypes"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <template #header>
          <InputText
            class="w-full"
            v-model="visitTypesFilter['global'].value"
            placeholder="Filter Visit Types"
          ></InputText
        ></template>
        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

        <Column header="Concept ID" field="concept_id"></Column>
        <Column sortable header="Concept Name" field="concept_name"> </Column>
      </DataTable>
      <DataTable
        class="flex-grow"
        removable-sort
        size="small"
        v-model:filters="sourcesFilter"
        :value="getSmallestVisitTypeValue"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
      >
        <template #header>
          <InputText
            class="w-full"
            v-model="sourcesFilter['global'].value"
            placeholder="Filter Data Sources"
          ></InputText
        ></template>
        <Column header="Data Source" field="cdm_name"></Column>
        <Column sortable header="%" field="percentage">
          <template #body="slotProps">
            {{
              slotProps.data.percentage
                ? (slotProps.data.percentage * 100).toFixed(2)
                : ""
            }}
          </template>
        </Column>
      </DataTable>
    </div>
    <Divider />
    <Message :closable="false" severity="info">
      The table on the left lists all visit types found across available data
      sources. The table on the right lists all matching data sources displaying
      the lowest % of all chosen visit types.
    </Message>
  </Panel>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Message from "primevue/message";
import Divider from "primevue/divider";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Panel from "primevue/panel";
import InputText from "primevue/inputtext";
import { FilterMatchMode } from "primevue/api";

const visitTypesSelected = ref([]);

interface Props {
  data: [];
}

const props = defineProps<Props>();

const visitTypesFilter = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const sourcesFilter = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const getVisitTypes = computed(function () {
  const flattenData = (data) => {
    return data.reduce((prev, current) => [...prev, ...current.data], []);
  };

  const createUniqueObject = (data) => {
    return {
      concept_id: data.CONCEPT_ID,
      concept_name: data.CONCEPT_NAME,
    };
  };

  const getUniqueObjects = (data) => {
    const uniqueStrings = new Set(data.map(JSON.stringify));
    return Array.from(uniqueStrings).map(JSON.parse);
  };

  const data = flattenData(props.data);
  const uniqueObjects = data.map(createUniqueObject);
  return getUniqueObjects(uniqueObjects);
});

const visitTypes = computed(() =>
  visitTypesSelected.value.map((obj) => obj.concept_id)
);

const filterSelectedVisitTypes = computed(function () {
  return props.data
    .map((source) => ({
      data: source.data.filter((value) =>
        visitTypes.value.includes(value.CONCEPT_ID)
      ),
      source: source.source,
    }))
    .filter((value) =>
      value.data.every((data) => visitTypes.value.includes(data.CONCEPT_ID))
    );
});

const getSmallestPercentage = (data) => {
  return data.map((data) => data.PERCENT_PERSONS).sort((a, b) => a - b)[0];
};

const hasPercentage = (value) => value.percentage;

const getSmallestVisitTypeValue = computed(function () {
  return filterSelectedVisitTypes.value
    .map((value) => ({
      cdm_name: value.source,
      percentage: getSmallestPercentage(value.data),
    }))
    .filter(hasPercentage);
});

const emit = defineEmits(["visitTypesChanged"]);

watch(getSmallestVisitTypeValue, () => {
  emit("visitTypesChanged", getSmallestVisitTypeValue.value);
});
</script>

<script lang="ts">
export default {
  name: "VisitTypes",
};
</script>

<style scoped></style>
