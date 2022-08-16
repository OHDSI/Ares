<template>
  <v-card v-if="dataInStore" elevation="10" class="ma-4 pa-2">
    <v-card-title>Temporal Characterization</v-card-title>
    <!--Table controls-->
    <v-row>
      <v-col cols="3">
        <v-text-field
          prepend-icon="mdi-magnify"
          label="Search in Table"
          single-line
          hide-details
          @input="delayedSearch"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-data-table
      class="mt-4"
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
    <info-panel
      v-if="getQueryIndex && getQueryIndex.TEMPORAL_CHARACTERIZATION[0]"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="getQueryLink(getQueryIndex.TEMPORAL_CHARACTERIZATION[0])"
      :divider="true"
    ></info-panel>
  </v-card>
</template>

<script>
import { mapGetters } from "vuex";
import infoPanel from "@/interface/components/InfoPanel";
import { debounce } from "lodash";

export default {
  name: "TemporalCharacterization",
  components: {
    infoPanel,
  },
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
    getQueryLink(queryPath) {
      return `https://github.com/OHDSI/Achilles/tree/main/inst/sql/sql_server/${queryPath}`;
    },
  },
  computed: {
    ...mapGetters(["getData", "dataInStore", "getErrors", "getQueryIndex"]),
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
