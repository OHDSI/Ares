<template>
  <v-card
    v-if="store.getters.getData.measurementTable"
    elevation="2"
    class="ma-4"
  >
    <v-data-table
      density="compact"
      :headers="headers"
      :items="store.getters.getData.measurementTable"
    >
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { VDataTable } from "vuetify/labs/VDataTable";
import { ref, Ref } from "vue";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";
import { useStore } from "vuex";

const store = useStore();

const headers: Ref<DataTableHeader[]> = ref([
  {
    title: "Unit",
    sortable: true,
    key: "CATEGORY",
    align: "start",
  },
  {
    title: "Count value",
    sortable: true,
    key: "UNIT_COUNT",
    align: "start",
  },
  {
    title: "Min Value",
    sortable: true,
    key: "MIN_VALUE",
    align: "start",
  },
  {
    title: "P10 Value",
    sortable: true,
    key: "P10_VALUE",
    align: "start",
  },
  {
    title: "P25 Value",
    sortable: true,
    key: "P25_VALUE",
    align: "start",
  },
  {
    title: "Median Value",
    sortable: true,
    key: "MEDIAN_VALUE",
    align: "start",
  },
  {
    title: "P75 Value",
    sortable: true,
    key: "P75_VALUE",
    align: "start",
  },
  {
    title: "P90 Value",
    sortable: true,
    key: "P90_VALUE",
    align: "start",
  },
  {
    title: "Max Value",
    sortable: true,
    key: "MAX_VALUE",
    align: "start",
  },
]);
</script>

<style scoped></style>
