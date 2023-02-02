<template>
  <v-container fluid>
    <v-data-table
      class="mb-4"
      density="compact"
      :hide-default-footer="true"
      :disable-pagination="true"
      :headers="headers"
      :items="getEstimations"
      :sort-by="['estimation']"
      :sort-desc="[true, false]"
    >
      <template v-slot:item.domain_percent.data="{ item }">{{
        item.raw.domain_percent.data
          ? (item.raw.domain_percent.data * 100).toFixed(2)
          : "No data"
      }}</template>
      <template v-slot:item.observation_percent.data="{ item }">{{
        item.raw.observation_percent.data
          ? (item.raw.observation_percent.data * 100).toFixed(2)
          : "No data"
      }}</template>
      <template v-slot:item.visit_types_percent.data="{ item }">{{
        item.raw.visit_types_percent.data
          ? (item.raw.visit_types_percent.data * 100).toFixed(2)
          : "No data"
      }}</template>
      <template v-slot:item.concepts_percent.data="{ item }">{{
        item.raw.concepts_percent.data
          ? (item.raw.concepts_percent.data * 100).toFixed(2)
          : "No data"
      }}</template>
      <template v-slot:item.cumulative_duration_percent.data="{ item }">{{
        item.raw.cumulative_duration_percent.data
          ? (item.raw.cumulative_duration_percent.data * 100).toFixed(2)
          : "No data"
      }}</template>
      <template v-slot:item.population.data="{ item }">{{
        item.raw.population.data
          ? formatComma(item.raw.population.data)
          : "No data"
      }}</template>
      <template v-slot:item.estimation="{ item }">{{
        item.raw.estimation
          ? formatComma(item.raw.estimation.toFixed(2))
          : "No data"
      }}</template>
      <template v-slot:item.population_age_percent.data="{ item }">{{
        item.raw.population_age_percent.data
          ? (item.raw.population_age_percent.data * 100).toFixed(2)
          : "No data"
      }}</template>
      <template v-slot:item.desired_domain_value.data="{ item }">{{
        item.raw.desired_domain_value.data ? "Present" : "No data"
      }}</template>
    </v-data-table>
    <v-divider></v-divider>
    <v-alert color="message" dark dense icon="mdi-help-rhombus" prominent>
      This section derives data from the sections above. The contents of the
      table depend on the sections used in calculations.
    </v-alert>
  </v-container>
</template>

<script setup lang="ts">
import * as d3Format from "d3-format";
import { VDataTable } from "vuetify/labs/VDataTable";
import { computed, defineProps } from "vue";
import { useStore } from "vuex";

const store = useStore();

interface Props {
  data: object;
}
const props = defineProps<Props>();

const formatComma = function (value) {
  return d3Format.format(",")(value);
};

const headers = computed(function () {
  return [
    {
      title: "Data Source",
      align: "start",
      sortable: false,
      key: "cdm_name",
      show: true,
    },
    {
      title: "Source population",
      align: "end",
      key: "population.data",
      show: true,
    },
    {
      title: "% Required Domains",
      align: "end",
      key: "domain_percent.data",
      show: getEstimations.value[0].domain_percent.isIncluded,
    },
    {
      title: "Desired Domains",
      align: "end",
      key: "desired_domain_value.data",
      show: getEstimations.value[0].desired_domain_value.isIncluded,
    },
    {
      title: "% Cumulative Observation",
      align: "end",
      key: "cumulative_duration_percent.data",
      show: getEstimations.value[0].cumulative_duration_percent.isIncluded,
    },
    {
      title: "% Population by age",
      align: "end",
      key: "population_age_percent.data",
      show: getEstimations.value[0].population_age_percent.isIncluded,
    },
    {
      title: "% Observed",
      align: "end",
      key: "observation_percent.data",
      show: getEstimations.value[0].observation_percent.isIncluded,
    },
    {
      title: "% Visit types",
      align: "end",
      key: "visit_types_percent.data",
      show: getEstimations.value[0].visit_types_percent.isIncluded,
    },
    {
      title: "% Concepts",
      align: "end",
      key: "concepts_percent.data",
      show: getEstimations.value[0].concepts_percent.isIncluded,
    },
    {
      title: "Estimated population",
      align: "end",
      key: "estimation",
      show: true,
    },
  ].filter((x) => x.show);
});
const getEstimations = computed(function () {
  const estimations = store.getters.getSources.map((data) => ({
    cdm_name: data.cdm_source_abbreviation,
  }));

  return estimations
    .map((obj) => {
      const domainData = props.data.domainData.filter(
        (value) => obj.cdm_name === value.cdm_name
      );
      const rangeData = props.data.rangeData.filter(
        (value) => value.cdm_name === obj.cdm_name
      );

      const visitTypesData = props.data.visitTypes.filter(
        (value) => obj.cdm_name === value.cdm_name
      );

      const sourcePopulation = props.data.sourcePopulation.filter(
        (value) => obj.cdm_name === value.source.cdm_source_abbreviation
      );

      const requiredConcepts = props.data.requiredConcepts.filter(
        (value) => value.cdm_name === obj.cdm_name
      );

      const desiredDomains = props.data.desiredDomains.filter(
        (value) => value.cdm_name === obj.cdm_name
      );

      return {
        ...obj,
        domain_percent: {
          data: domainData[0]?.percentage,
          isIncluded: props.data.domainData.length,
        },
        cumulative_duration_percent: {
          data: rangeData[0]?.cumulative_duration,
          isIncluded: props.data.rangeData.length,
        },
        population_age_percent: {
          data: rangeData[0]?.population_age_percent,
          isIncluded: props.data.rangeData.length,
        },
        observation_percent: {
          data: rangeData[0]?.average_population_percentage,
          isIncluded: props.data.rangeData.length,
        },
        visit_types_percent: {
          data: visitTypesData[0]?.percentage,
          isIncluded: props.data.visitTypes.length,
        },
        population: {
          data: sourcePopulation[0]?.data.SUMMARY[1].ATTRIBUTE_VALUE,
          isIncluded: props.data.sourcePopulation.length,
        },
        concepts_percent: {
          data: requiredConcepts[0]?.concepts
            .reduce(
              (prevValue, current) => [...prevValue, current.percentage],
              []
            )
            .sort((a, b) => a - b)[0],
          isIncluded: props.data.requiredConcepts.length,
        },
        desired_domain_value: {
          data: desiredDomains[0]?.allDomainsPresent ? 1 : 0,
          isIncluded: props.data.desiredDomains.length,
        },
      };
    })
    .map((obj) => ({
      ...obj,
      estimation: Math.floor(
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
      ),
    }));
});
</script>

<script lang="ts">
export default {
  name: "FinalEstimation",
};
</script>

<style scoped></style>
