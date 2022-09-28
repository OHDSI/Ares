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
          @input="debouncedSearch"
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
      <template v-slot:item.CONCEPT_ID="{ item }">
        <v-layout flex-end
          ><router-link :to="getReportRoute(item)">{{
            item.CONCEPT_ID
          }}</router-link></v-layout
        >
      </template>
      <template v-slot:item.CONCEPT_NAME="{ item }">
        <v-row>
          <v-col cols="10">
            <router-link :to="getReportRoute(item)" :title="item.CONCEPT_NAME"
              >{{ item.CONCEPT_NAME }}
            </router-link>
          </v-col>
        </v-row>
      </template>
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
                :items="getValuesArray(filteredChecks, header.value)"
              ></v-select>
            </div>
          </th>
        </tr>
      </template>
    </v-data-table>
    <info-panel
      v-if="getQueryIndex && getQueryIndex.TEMPORAL_CHARACTERIZATION"
      icon="mdi-code-braces"
      details="View export query."
      :link-details="true"
      :link="getSqlQueryLink(getQueryIndex.TEMPORAL_CHARACTERIZATION[0])"
      :divider="true"
    ></info-panel>
  </v-card>
</template>

<script>
import { mapGetters } from "vuex";
import infoPanel from "@/widgets/infoPanel";
import { mixins } from "@/shared/lib/mixins";
import { getLinks } from "@/shared/config/links";

export default {
  name: "TemporalCharacterization",
  components: {
    infoPanel,
  },
  mixins: [mixins, getLinks],
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
    getReportRoute(item) {
      return {
        name: "concept",
        params: {
          domain: item.CDM_TABLE_NAME.toLowerCase(),
          concept: item.CONCEPT_ID,
        },
      };
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
