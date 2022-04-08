<template>
  <v-container>
    <v-data-table
      class="mb-4"
      dense
      :hide-default-footer="true"
      :disable-pagination="true"
      :headers="headers"
      :items="getEstimations"
      :sort-by="['estimation']"
      :sort-desc="[true, false]"
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
      <template v-slot:item.cumulative_duration_percent.data="{ item }">{{
        item.cumulative_duration_percent.data
          ? (item.cumulative_duration_percent.data * 100).toFixed(2)
          : "No data"
      }}</template>
      <template v-slot:item.population.data="{ item }">{{
        item.population.data ? formatComma(item.population.data) : "No data"
      }}</template>
      <template v-slot:item.estimation="{ item }">{{
        item.estimation ? formatComma(item.estimation.toFixed(2)) : "No data"
      }}</template>
      <template v-slot:item.population_age_percent.data="{ item }">{{
        item.population_age_percent.data
          ? (item.population_age_percent.data * 100).toFixed(2)
          : "No data"
      }}</template>
      <template v-slot:item.desired_domain_value.data="{ item }">{{
        item.desired_domain_value.data ? "Present" : "No data"
      }}</template>
    </v-data-table>
    <v-divider></v-divider>
    <v-alert color="grey darken-3" dark dense icon="mdi-help-rhombus" prominent>
      This section derives data from the sections above. The contents of the
      table depend on the sections used in calculations.
    </v-alert>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import * as d3Format from "d3-format";

export default {
  name: "FinalEstimation",
  props: {
    data: Object
  },
  data() {
    return {};
  },
  methods: {
    formatComma: function(value) {
      return d3Format.format(",")(value);
    }
  },
  computed: {
    headers: function() {
      return [
        {
          text: "Data Source",
          align: "start",
          sortable: false,
          value: "cdm_name",
          show: true
        },
        {
          text: "Source population",
          align: "end",
          value: "population.data",
          show: true
        },
        {
          text: "% Required Domains",
          align: "end",
          value: "domain_percent.data",
          show: this.getEstimations[0].domain_percent.isIncluded
        },
        {
          text: "% Desired Domains",
          align: "end",
          value: "desired_domain_value.data",
          show: this.getEstimations[0].desired_domain_value.isIncluded
        },
        {
          text: "% Cumulative Observation",
          align: "end",
          value: "cumulative_duration_percent.data",
          show: this.getEstimations[0].cumulative_duration_percent.isIncluded
        },
        {
          text: "% Population by age",
          align: "end",
          value: "population_age_percent.data",
          show: this.getEstimations[0].population_age_percent.isIncluded
        },
        {
          text: "% Observed",
          align: "end",
          value: "observation_percent.data",
          show: this.getEstimations[0].observation_percent.isIncluded
        },
        {
          text: "% Visit types",
          align: "end",
          value: "visit_types_percent.data",
          show: this.getEstimations[0].visit_types_percent.isIncluded
        },
        {
          text: "% Concepts",
          align: "end",
          value: "concepts_percent.data",
          show: this.getEstimations[0].concepts_percent.isIncluded
        },
        {
          text: "Estimated population",
          align: "end",
          value: "estimation",
          show: true
        }
      ].filter(x => x.show);
    },
    getEstimations: function() {
      const estimations = this.getSources.map(data => ({
        cdm_name: data.cdm_source_abbreviation
      }));

      return estimations
        .map(obj => {
          const domainData = this.data.domainData.filter(
            value => obj.cdm_name === value.cdm_name
          );
          const rangeData = this.data.rangeData.filter(
            value => value.cdm_name === obj.cdm_name
          );

          const visitTypesData = this.data.visitTypes.filter(
            value => obj.cdm_name === value.cdm_name
          );

          const sourcePopulation = this.data.sourcePopulation.filter(
            value => obj.cdm_name === value.source.cdm_source_abbreviation
          );

          const requiredConcepts = this.data.requiredConcepts.filter(
            value => value.cdm_name === obj.cdm_name
          );

          const desiredDomains = this.data.desiredDomains.filter(
            value => value.cdm_name === obj.cdm_name
          );

          return {
            ...obj,
            domain_percent: {
              data: domainData[0]?.percentage,
              isIncluded: this.data.domainData.length
            },
            cumulative_duration_percent: {
              data: rangeData[0]?.cumulative_duration,
              isIncluded: this.data.rangeData.length
            },
            population_age_percent: {
              data: rangeData[0]?.population_age_percent,
              isIncluded: this.data.rangeData.length
            },
            observation_percent: {
              data: rangeData[0]?.average_population_percentage,
              isIncluded: this.data.rangeData.length
            },
            visit_types_percent: {
              data: visitTypesData[0]?.percentage,
              isIncluded: this.data.visitTypes.length
            },
            population: {
              data: sourcePopulation[0]?.data.SUMMARY[1].ATTRIBUTE_VALUE,
              isIncluded: this.data.sourcePopulation.length
            },
            concepts_percent: {
              data: requiredConcepts[0]?.concepts
                .reduce(
                  (prevValue, current) => [...prevValue, current.percentage],
                  []
                )
                .sort((a, b) => a - b)[0],
              isIncluded: this.data.requiredConcepts.length
            },
            desired_domain_value: {
              data: desiredDomains[0]?.allDomainsPresent ? 1 : 0,
              isIncluded: this.data.desiredDomains.length
            }
          };
        })
        .map(obj => ({
          ...obj,
          estimation:
            obj.population.data *
            (obj.domain_percent.isIncluded ? obj.domain_percent.data || 0 : 1) *
            (obj.population_age_percent.isIncluded
              ? obj.population_age_percent.data || 0
              : 1) *
            (obj.cumulative_duration_percent.isIncluded
              ? obj.cumulative_duration_percent.data || 0
              : 1) *
            (obj.observation_percent.isIncluded
              ? obj.observation_percent.data || 0
              : 1) *
            (obj.visit_types_percent.isIncluded
              ? obj.visit_types_percent.data || 0
              : 1) *
            (obj.concepts_percent.isIncluded
              ? obj.concepts_percent.data || 0
              : 1) *
            (obj.desired_domain_value.isIncluded
              ? obj.desired_domain_value.data || 0
              : 1)
        }));
    },
    ...mapGetters(["getSources"])
  }
};
</script>

<style scoped></style>
