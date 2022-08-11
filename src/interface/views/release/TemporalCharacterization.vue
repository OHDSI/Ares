<template>
  <v-card v-if="dataInStore" elevation="10" class="ma-4">
    <v-container fluid class="ma-2 pa-4">
      <!--Table controls-->
      <v-row>
        <v-col cols="5">
          <v-text-field
            prepend-icon="mdi-magnify"
            label="Search in Table"
            single-line
            hide-details
            @input="delayedSearch"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-container>
    <v-data-table
      :headers="headers"
      :items="filteredChecks"
      :footer-props="{
        'items-per-page-options': [5, 10, 25],
      }"
      item-key="checkId"
      :items-per-page="10"
      :search="search"
      dense
    >
      <template v-slot:body.prepend>
        <tr>
          <th v-for="header in headers" :key="header.text">
            <div
              v-if="header.text === 'Table' || header.text === 'Is Stationary'"
            >
              <v-select
                v-model="filters[header.value]"
                prepend-inner-icon="mdi-filter"
                small-chips
                deletable-chips
                hide-details
                multiple
                :items="columnValueList(header.value)"
              ></v-select>
            </div>
          </th>
        </tr>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { mapGetters } from "vuex";
import { debounce } from "lodash";

export default {
  name: "TemporalCharacterization",
  data() {
    return {
      search: "",
      filters: {
        CDM_TABLE_NAME: [],
        IS_STATIONARY: [],
      },
      headers: [
        {
          text: "Table",
          sortable: false,
          value: "CDM_TABLE_NAME",
        },
        {
          text: "Concept id",
          sortable: false,
          value: "CONCEPT_ID",
        },
        {
          text: "Concept Name",
          sortable: false,
          value: "CONCEPT_NAME",
        },
        {
          text: "Seasonality Score",
          sortable: true,
          value: "SEASONALITY_SCORE",
        },
        {
          text: "Is Stationary",
          sortable: true,
          value: "IS_STATIONARY",
        },
      ],
    };
  },
  methods: {
    delayedSearch: debounce(function (data) {
      this.search = data;
    }, 300),
    columnValueList(val) {
      return this.getData.temporalCharacterization.map((d) => d[val]);
    },
  },
  computed: {
    ...mapGetters(["getData", "dataInStore", "getErrors"]),
    filteredChecks() {
      return this.getData.temporalCharacterization.filter((d) => {
        return Object.keys(this.filters).every((f) => {
          return this.filters[f].length < 1 || this.filters[f].includes(d[f]);
        });
      });
    },
  },
};
</script>

<style scoped></style>
