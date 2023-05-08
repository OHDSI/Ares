<template>
  <div>
    <v-card
      v-if="!store.getters.getErrors && store.getters.dataInStore"
      elevation="10"
      class="ma-4 pa-2"
    >
      <v-card-title>Unmapped Source Codes</v-card-title>
      <v-row>
        <v-col cols="3">
          <v-text-field
            v-model="search"
            prepend-icon="mdi-magnify"
            label="Search in Table"
            variant="outlined"
            single-line
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="9"> </v-col>
      </v-row>

      <v-data-table
        class="mt-4"
        dense
        :headers="headers"
        :items="filteredRecords"
        :footer-props="{
          'items-per-page-options': [10, 50, 100],
        }"
        item-key="CDM_TABLE"
        :items-per-page="10"
        :search="search"
        :sort-desc="true"
      >
        <template v-slot:body.prepend>
          <tr>
            <th v-for="header in headers" :key="header.title">
              <div v-if="filters.hasOwnProperty(header.key)">
                <v-select
                  v-model="filters[header.key]"
                  small-chips
                  deletable-chips
                  hide-details
                  multiple
                  :items="helpers.getValuesArray(filteredRecords, header.key)"
                ></v-select>
              </div>
            </th>
          </tr>
        </template>
        <template v-slot:item.CDM_TABLE_NAME="{ item }">
          {{ item.raw.CDM_TABLE_NAME }}
        </template>
        <template v-slot:item.CDM_FIELD_NAME="{ item }">
          {{ item.raw.CDM_FIELD_NAME }}
        </template>
        <template v-slot:item.SOURCE_VALUE="{ item }">
          {{ item.raw.SOURCE_VALUE }}
        </template>
        <template v-slot:item.RECORD_COUNT="{ item }">
          <v-layout justify-end>{{
            helpers.formatComma(item.raw.RECORD_COUNT)
          }}</v-layout>
        </template>
        <template v-slot:item.DATA_SOURCE_COUNT="{ item }">
          <v-layout justify-end>{{ item.raw.DATA_SOURCE_COUNT }}</v-layout>
        </template>
        <template v-slot:item.DATA_SOURCES="{ item }">
          <v-layout justify-end>{{ item.raw.DATA_SOURCES }}</v-layout>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { VDataTable } from "vuetify/labs/VDataTable";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";
import { helpers } from "@/shared/lib/mixins";

import { computed, Ref, ref } from "vue";
import { useStore } from "vuex";

const store = useStore();

const search: Ref<string> = ref("");
const filters: Ref<{ CDM_TABLE_NAME: string[]; CDM_FIELD_NAME: string[] }> =
  ref({
    CDM_TABLE_NAME: [],
    CDM_FIELD_NAME: [],
  });

const headers: Ref<DataTableHeader[]> = ref([
  {
    title: "CDM Table",
    sortable: true,
    key: "CDM_TABLE_NAME",
  },
  {
    title: "CDM Field",
    sortable: true,
    key: "CDM_FIELD_NAME",
  },
  {
    title: "Source Value",
    sortable: true,
    key: "SOURCE_VALUE",
  },
  {
    title: "# Records",
    sortable: true,
    key: "RECORD_COUNT",
  },
  {
    title: "# Data Sources",
    sortable: true,
    key: "DATA_SOURCE_COUNT",
  },
  {
    title: "Data Sources",
    sortable: true,
    key: "DATA_SOURCES",
  },
]);

const filteredRecords = computed(function () {
  return store.getters.getData.domainTable.filter((d) => {
    return Object.keys(filters.value).every((f) => {
      return (
        filters.value[f as keyof typeof filters.value].length < 1 ||
        filters.value[f as keyof typeof filters.value].includes(d[f])
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
