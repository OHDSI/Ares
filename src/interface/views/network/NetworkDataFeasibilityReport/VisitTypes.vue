<template>
  <v-card elevation="10" class="ma-4" pa-2>
    <v-container>
      <v-card-title>Required visit types</v-card-title>
      <v-row>
        <v-col>
          <v-data-table
            v-model="visitTypesSelected"
            dense
            item-key="concept_id"
            :search="visitTypesSearch"
            :headers="domainSummaryHeaders"
            :items="getVisitTypes"
            show-select
          >
            <template v-slot:top>
              <v-text-field
                v-model="visitTypesSearch"
                label="Search"
                class="mx-4"
              ></v-text-field>
            </template>
          </v-data-table>
        </v-col>
        <v-col>
          <v-data-table
            dense
            :search="resultsSearch"
            item-key="cdm_name"
            :items="getSmallestVisitTypeValue"
            :headers="domainTypesResults"
          >
            <template v-slot:top>
              <v-text-field
                v-model="resultsSearch"
                label="Search"
                class="mx-4"
              ></v-text-field>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
export default {
  name: "VisitTypes",
  props: {
    data: Array,
  },
  data() {
    return {
      visitTypesSearch: "",
      resultsSearch: "",
      visitTypesSelected: [],
      domainSummaryHeaders: [
        {
          text: "Concept ID",
          align: "start",
          sortable: false,
          value: "concept_id",
        },
        { text: "Concept Name", value: "concept_name" },
      ],
      domainTypesResults: [
        {
          text: "Data source",
          align: "start",
          sortable: false,
          value: "cdm_name",
        },
        { text: "Smallest value", value: "percentage" },
      ],
    };
  },
  computed: {
    getVisitTypes: function () {
      const data = this.data.reduce(
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
    },

    filterSelectedVisitTypes: function () {
      const visitTypes = this.visitTypesSelected.map((obj) => obj.concept_id);
      const filtered = this.data.map((source) => ({
        data: source.data.filter((value) =>
          visitTypes.includes(value.CONCEPT_ID)
        ),
        source: source.source,
      }));

      return filtered.filter(
        (value) => value.data.length === visitTypes.length
      );
    },

    getSmallestVisitTypeValue: function () {
      return this.filterSelectedVisitTypes.map((value) => ({
        cdm_name: value.source,
        percentage: value.data
          .map((data) => data.PERCENT_PERSONS)
          .sort((a, b) => a - b)[0],
      }));
    },
  },
  watch: {
    getSmallestVisitTypeValue: function () {
      this.$emit("visitTypesChanged", this.getSmallestVisitTypeValue);
    },
  },
};
</script>

<style scoped></style>
