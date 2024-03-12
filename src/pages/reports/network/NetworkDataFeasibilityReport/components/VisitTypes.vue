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
import { computed, ref, defineEmits, watch, Ref, defineProps } from "vue";
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
  const data = props.data.reduce(
    (prev, current) => [...prev, ...current.data],
    []
  );
  return [
    ...new Set(
      data.map((object) =>
        JSON.stringify({
          concept_id: object.CONCEPT_ID,
          concept_name: object.CONCEPT_NAME,
        })
      )
    ),
  ].map((string) => JSON.parse(string));
});

const filterSelectedVisitTypes = computed(function () {
  const visitTypes = visitTypesSelected.value.map((obj) => obj.concept_id);
  const filtered = props.data.map((source) => ({
    data: source.data.filter((value) => visitTypes.includes(value.CONCEPT_ID)),
    source: source.source,
  }));

  return filtered.filter((value) => value.data.length === visitTypes.length);
});

const getSmallestVisitTypeValue = computed(function () {
  return filterSelectedVisitTypes.value
    .map((value) => ({
      cdm_name: value.source,
      percentage: value.data
        .map((data) => data.PERCENT_PERSONS)
        .sort((a, b) => a - b)[0],
    }))
    .filter((value) => value.percentage);
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
