<template>
  <v-container>
    <v-data-table
      dense
      :hide-default-footer="true"
      :disable-pagination="true"
      :headers="headers"
      :items="getEstimations"
    >
      <template v-slot:item.domain_percent.data="{ item }">{{
        item.domain_percent.data
          ? (item.domain_percent.data * 100).toFixed(2)
          : "No data"
      }}</template>
      <template v-slot:item.observation_percent.data="{ item }">{{
        item.observation_percent.data
          ? (item.observation_percent.data * 100).toFixed(2)
          : "No data"
      }}</template>
      <template v-slot:item.visit_types_percent.data="{ item }">{{
        item.visit_types_percent.data
          ? (item.visit_types_percent.data * 100).toFixed(2)
          : "No data"
      }}</template>
      <template v-slot:item.concepts_percent.data="{ item }">{{
        item.concepts_percent.data
          ? (item.concepts_percent.data * 100).toFixed(2)
          : "No data"
      }}</template>
      <template v-slot:item.population.data="{ item }">{{
        item.population.data ? formatComma(item.population.data) : "No data"
      }}</template>
      <template v-slot:item.overall="{ item }">{{
        item.overall ? formatComma(item.overall.toFixed(2)) : "No data"
      }}</template>
      <template v-slot:item.percent_population_age.data="{ item }">{{
        item.percent_population_age.data
          ? (item.percent_population_age.data * 100).toFixed(2)
          : "No data"
      }}</template>
    </v-data-table>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import * as d3Format from "d3-format";

export default {
  name: "FinalEstimation",
  props: {
    data: Object,
  },
  data() {
    return {};
  },
  methods: {
    formatComma: function (value) {
      return d3Format.format(",")(value);
    },
  },
  computed: {
    headers: function () {
      return [
        {
          text: "Data Source",
          align: "start",
          sortable: false,
          value: "cdm_name",
          show: true,
        },
        {
          text: "Population",
          align: "end",
          value: "population.data",
          show: true,
        },
        {
          text: "% Domains",
          align: "end",
          value: "domain_percent.data",
          show: this.getEstimations[0].domain_percent.isIncluded,
        },
        {
          text: "% Population by age",
          align: "end",
          value: "percent_population_age.data",
          show: this.getEstimations[0].percent_population_age.isIncluded,
        },
        {
          text: "% observation",
          align: "end",
          value: "observation_percent.data",
          show: this.getEstimations[0].observation_percent.isIncluded,
        },
        {
          text: "% visit types",
          align: "end",
          value: "visit_types_percent.data",
          show: this.getEstimations[0].visit_types_percent.isIncluded,
        },
        {
          text: "% concepts",
          align: "end",
          value: "concepts_percent.data",
          show: this.getEstimations[0].concepts_percent.isIncluded,
        },
        {
          text: "Estimated population",
          align: "end",
          value: "overall",
          show: true,
        },
      ].filter((x) => x.show);
    },
    getEstimations: function () {
      const estimations = this.getSources.map((data) => ({
        cdm_name: data.cdm_source_abbreviation,
      }));

      return estimations
        .map((obj) => ({
          ...obj,
          domain_percent: {
            data: this.data.domainData.filter(
              (domainData) => obj.cdm_name === domainData.cdm_name
            )[0]?.percentage,
            isIncluded: this.data.domainData.length,
          },
          percent_population_age: {
            data: this.data.rangeData.filter(
              (domainData) => obj.cdm_name === domainData.cdm_name
            )[0]?.percentPopulationByAge,
            isIncluded: this.data.rangeData.length,
          },
          observation_percent: {
            data: this.data.rangeData.filter(
              (domainData) => obj.cdm_name === domainData.cdm_name
            )[0]?.average_population_percentage,
            isIncluded: this.data.rangeData.length,
          },
          visit_types_percent: {
            data: this.data.visitTypes.filter(
              (visitData) => obj.cdm_name === visitData.cdm_name
            )[0]?.percentage,
            isIncluded: this.data.visitTypes.length,
          },
          population: {
            data: this.data.sourcePopulation.filter(
              (personData) =>
                obj.cdm_name === personData.source.cdm_source_abbreviation
            )[0]?.data.SUMMARY[1].ATTRIBUTE_VALUE,
            isIncluded: this.data.sourcePopulation.length,
          },
          concepts_percent: {
            data: this.data.requiredConcepts
              .filter((concept) => concept.cdm_name === obj.cdm_name)[0]
              ?.concepts.reduce(
                (prevValue, current) => [...prevValue, current.percentage],
                []
              )
              .sort((a, b) => a - b)[0],
            isIncluded: this.data.requiredConcepts.length,
          },
        }))
        .map((obj) => {
          return {
            ...obj,
            overall:
              obj.population.data *
              (obj.domain_percent.isIncluded
                ? obj.domain_percent.data || 0
                : 1) *
              (obj.observation_percent.isIncluded
                ? obj.observation_percent.data || 0
                : 1) *
              (obj.visit_types_percent.isIncluded
                ? obj.visit_types_percent.data || 0
                : 1) *
              (obj.concepts_percent.isIncluded
                ? obj.concepts_percent.data || 0
                : 1),
          };
        });
    },
    ...mapGetters(["getSources"]),
  },
};
</script>

<style scoped></style>
