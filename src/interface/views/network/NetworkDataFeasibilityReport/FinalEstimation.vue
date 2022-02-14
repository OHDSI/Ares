<template>
  <v-card elevation="10" class="ma-4 pa-2">
    <v-card-title>Data Source Domain Overview</v-card-title>
    <v-container>
      <v-data-table
        dense
        :hide-default-footer="true"
        :disable-pagination="true"
        :headers="headers"
        :items="getEstimations"
        class="elevation-1"
      >
      </v-data-table>
    </v-container>
  </v-card>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "FinalEstimation",
  props: {
    data: Object,
  },
  data() {
    return {
      headers: [
        {
          text: "Data Source",
          align: "start",
          sortable: false,
          value: "cdm_name",
        },
        { text: "Population", align: "end", value: "population" },
        { text: "% Domains", align: "end", value: "domain_percent" },
        { text: "% observation", align: "end", value: "observation_percent" },
        { text: "% visit types", align: "end", value: "visit_types_percent" },
        { text: "% concepts", align: "end", value: "concepts_percent" },
        { text: "Overall", align: "end", value: "overall" },
      ],
    };
  },
  computed: {
    getEstimations: function () {
      const estimations = this.getSources.map((data) => ({
        cdm_name: data.cdm_source_abbreviation,
      }));

      return estimations
        .map((obj) => ({
          ...obj,
          domain_percent: this.data.domainData.filter(
            (domainData) => obj.cdm_name === domainData.cdm_name
          )[0]?.percentage,
          observation_percent: this.data.rangeData.filter(
            (domainData) => obj.cdm_name === domainData.cdm_name
          )[0]?.average_population_percentage,
          visit_types_percent: this.data.visitTypes.filter(
            (visitData) => obj.cdm_name === visitData.cdm_name
          )[0]?.percentage,
          population: this.data.sourcePopulation.filter(
            (personData) =>
              obj.cdm_name === personData.source.cdm_source_abbreviation
          )[0]?.data.SUMMARY[1].ATTRIBUTE_VALUE,
          concepts_percent: this.data.requiredConcepts[obj.cdm_name]
            ? this.data.requiredConcepts[obj.cdm_name]
                .reduce(
                  (prevValue, current) => [...prevValue, current.value],
                  []
                )
                .sort((a, b) => a - b)[0]
            : undefined,
        }))
        .map((obj) => ({
          ...obj,
          overall:
            obj.population *
            (obj.domain_percent || 1) *
            (obj.observation_percent || 1) *
            (obj.visit_types_percent || 1) *
            (obj.concepts_percent || 1),
        }));
    },
    ...mapGetters(["getSources"]),
  },
};
</script>

<style scoped></style>
