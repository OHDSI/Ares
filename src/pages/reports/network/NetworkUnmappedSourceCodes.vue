<template>
  <div>
    <v-card
      v-if="!getErrors"
      :loading="!dataInStore"
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
            @input="debouncedSearch"
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
        sort-by="RECORD_COUNT"
        :sort-desc="true"
      >
        <template v-slot:body.prepend>
          <tr>
            <th v-for="header in headers" :key="header.text">
              <div v-if="filters.hasOwnProperty(header.value)">
                <v-select
                  v-model="filters[header.value]"
                  small-chips
                  deletable-chips
                  hide-details
                  multiple
                  :items="getValuesArray(filteredRecords, header.value)"
                ></v-select>
              </div>
            </th>
          </tr>
        </template>
        <template v-slot:item.CDM_TABLE_NAME="{ item }">
          {{ item.CDM_TABLE_NAME }}
        </template>
        <template v-slot:item.CDM_FIELD_NAME="{ item }">
          {{ item.CDM_FIELD_NAME }}
        </template>
        <template v-slot:item.SOURCE_VALUE="{ item }">
          {{ item.SOURCE_VALUE }}
        </template>
        <template v-slot:item.RECORD_COUNT="{ item }">
          <v-layout justify-end>{{ formatComma(item.RECORD_COUNT) }}</v-layout>
        </template>
        <template v-slot:item.DATA_SOURCE_COUNT="{ item }">
          <v-layout justify-end>{{ item.DATA_SOURCE_COUNT }}</v-layout>
        </template>
        <template v-slot:item.DATA_SOURCES="{ item }">
          <v-layout justify-end>{{ item.DATA_SOURCES }}</v-layout>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { mixins } from "@/shared/lib/mixins";

export default {
  mixins: [mixins],
  data: function () {
    return {
      search: "",
      filters: {
        CDM_TABLE_NAME: [],
        CDM_FIELD_NAME: [],
      },
      headers: [
        {
          text: "CDM Table",
          sortable: true,
          value: "CDM_TABLE_NAME",
        },
        {
          text: "CDM Field",
          sortable: true,
          value: "CDM_FIELD_NAME",
        },
        {
          text: "Source Value",
          sortable: true,
          value: "SOURCE_VALUE",
        },
        {
          text: "# Records",
          sortable: true,
          value: "RECORD_COUNT",
        },
        {
          text: "# Data Sources",
          sortable: true,
          value: "DATA_SOURCE_COUNT",
        },
        {
          text: "Data Sources",
          sortable: true,
          value: "DATA_SOURCES",
        },
      ],
    };
  },
  computed: {
    ...mapGetters(["getData", "getErrors", "dataInStore"]),
    filteredRecords() {
      return this.getData.domainTable.filter((d) => {
        return Object.keys(this.filters).every((f) => {
          return this.filters[f].length < 1 || this.filters[f].includes(d[f]);
        });
      });
    },
  },
};
</script>

<style scoped>
td {
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
