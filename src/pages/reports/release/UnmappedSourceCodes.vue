<template>
  <div>
    <v-card
      v-if="!store.getters.getErrors"
      :loading="!store.getters.dataInStore"
      elevation="10"
      class="ma-4 pa-2"
    >
      <v-card-title>Unmapped Source Codes</v-card-title>
      <v-row>
        <v-col cols="3">
          <v-text-field
            prepend-icon="mdi-magnify"
            label="Search in Table"
            single-line
            hide-details
            @input="helpers.debouncedSearch"
          ></v-text-field>
        </v-col>
        <v-col cols="9"> </v-col>
      </v-row>

      <v-data-table
        v-if="store.getters.dataInStore"
        class="mt-4"
        density="compact"
        :headers="headers"
        :items="filteredRecords"
        :footer-props="{
          'items-per-page-options': [10, 50, 100],
        }"
        item-key="CONCEPT_ID"
        :items-per-page="10"
        :search="search"
      >
        <template #body.prepend>
          <tr>
            <th v-for="header in headers" :key="header.text">
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
        <template #item.RECORD_COUNT="{ item }">
          <v-layout justify-end>{{
            helpers.formatComma(item.raw.RECORD_COUNT)
          }}</v-layout>
        </template>
      </v-data-table>
      <v-card-text>
        <v-icon small color="info" left>mdi-help-circle</v-icon>
        This report identifies columns in tables within the CDM where values are
        mapped to 0 (unknown concept). It provides a listing of all unmapped
        source values to be reviewed for potential inclusion or remediation.
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { helpers } from "@/shared/lib/mixins";
import { computed, Ref, ref } from "vue";
import { useStore } from "vuex";
import { VDataTable } from "vuetify/labs/VDataTable";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";

const store = useStore();

const search: Ref<string> = ref("");
const filters = ref({});

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
]);

const filteredRecords = computed(function () {
  return store.getters.getData.domainTable.filter((d) => {
    return Object.keys(filters.value).every((f) => {
      return (
        filters.value[f as keyof typeof filters].length < 1 ||
        filters.value[f].includes(d[f])
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
