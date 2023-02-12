<template>
  <v-container fluid>
    <v-row class="mb-4">
      <v-col>
        <v-data-table
          v-model="visitTypesSelected"
          density="compact"
          item-key="concept_id"
          :search="visitTypesSearch"
          :headers="domainSummaryHeaders"
          :items="getVisitTypes"
          show-select
        >
          <template v-slot:top>
            <v-text-field
              density="compact"
              variant="outlined"
              v-model="visitTypesSearch"
              label="Filter Visit Types"
              class="mx-4"
            ></v-text-field>
          </template>
        </v-data-table>
      </v-col>
      <v-col>
        <v-data-table
          density="compact"
          :search="resultsSearch"
          item-key="cdm_name"
          :items="getSmallestVisitTypeValue"
          :headers="domainTypesResults"
        >
          <template v-slot:top>
            <v-text-field
              v-model="resultsSearch"
              density="compact"
              variant="outlined"
              label="Filter Data Sources "
              class="mx-4"
            ></v-text-field>
          </template>
          <template v-slot:item.percentage="{ item }">{{
            item.raw.percentage ? (item.raw.percentage * 100).toFixed(2) : ""
          }}</template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-divider></v-divider>
    <v-alert
      color="message"
      dark
      density="compact"
      icon="mdi-help-rhombus"
      prominent
    >
      The table on the left lists all visit types found across available data
      sources. The table on the right lists all matching data sources displaying
      the lowest % of all chosen visit types.
    </v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, defineEmits, watch, Ref, defineProps } from "vue";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";
import { VDataTable } from "vuetify/labs/VDataTable";
const visitTypesSearch: Ref<string> = ref("");
const resultsSearch: Ref<string> = ref("");
const visitTypesSelected = ref([]);

interface Props {
  data: [];
}

const props = defineProps<Props>();

const domainSummaryHeaders: Ref<DataTableHeader[]> = ref([
  {
    title: "Concept ID",
    align: "start",
    sortable: false,
    key: "concept_id",
  },
  { title: "Concept Name", key: "concept_name" },
]);

const domainTypesResults: Ref<DataTableHeader[]> = ref([
  {
    title: "Data source",
    align: "start",
    sortable: false,
    key: "cdm_name",
  },
  { title: "%", key: "percentage" },
]);

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
