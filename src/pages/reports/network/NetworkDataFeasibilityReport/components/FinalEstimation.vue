<template>
  <Panel toggleable header="Data Source Feasibility Overview">
    <DataTable
      removable-sort
      size="small"
      sortField="estimation"
      :sortOrder="-1"
      :value="getEstimations"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
    >
      <Column header="Data Source" field="cdm_name"></Column>
      <Column sortable header="Source population" field="population.data">
        <template #body="slotProps">
          {{
            slotProps.data.population.data
              ? formatComma(slotProps.data.population.data)
              : "No data"
          }}
        </template>
      </Column>
      <Column
        :hidden="!getEstimations[0].domain_percent.isIncluded"
        sortable
        header="% Required Domains"
        field="domain_percent.data"
      >
        <template #body="slotProps">
          {{
            slotProps.data.domain_percent.data
              ? (slotProps.data.domain_percent.data * 100).toFixed(2)
              : "No data"
          }}
        </template>
      </Column>
      <Column
        :hidden="!getEstimations[0].desired_domain_value.isIncluded"
        sortable
        header="Desired Domains"
        field="desired_domain_value.data"
      >
        <template #body="slotProps">
          {{ slotProps.data.desired_domain_value.data ? "Present" : "No data" }}
        </template>
      </Column>
      <Column
        :hidden="!getEstimations[0].cumulative_duration_percent.isIncluded"
        sortable
        header="% Cumulative Observation"
        field="cumulative_duration_percent.data"
      >
        <template #body="slotProps">
          {{
            slotProps.data.cumulative_duration_percent.data
              ? (slotProps.data.cumulative_duration_percent.data * 100).toFixed(
                  2
                )
              : "No data"
          }}
        </template>
      </Column>
      <Column
        :hidden="!getEstimations[0].population_age_percent.isIncluded"
        sortable
        header="% Population by age"
        field="population_age_percent.data"
      >
        <template #body="slotProps">
          {{
            slotProps.data.population_age_percent.data
              ? (slotProps.data.population_age_percent.data * 100).toFixed(2)
              : "No data"
          }}
        </template>
      </Column>
      <Column
        :hidden="!getEstimations[0].observation_percent.isIncluded"
        sortable
        header="% Observed"
        field="observation_percent.data"
      >
        <template #body="slotProps">
          {{
            slotProps.data.observation_percent.data
              ? (slotProps.data.observation_percent.data * 100).toFixed(2)
              : "No data"
          }}
        </template>
      </Column>
      <Column
        :hidden="!getEstimations[0].visit_types_percent.isIncluded"
        sortable
        header="% Visit types"
        field="visit_types_percent.data"
      >
        <template #body="slotProps">
          {{
            slotProps.data.visit_types_percent.data
              ? (slotProps.data.visit_types_percent.data * 100).toFixed(2)
              : "No data"
          }}
        </template>
      </Column>
      <Column
        :hidden="!getEstimations[0].concepts_percent.isIncluded"
        sortable
        header="% Concepts"
        field="concepts_percent.data"
      >
        <template #body="slotProps">
          {{
            slotProps.data.concepts_percent.data
              ? (slotProps.data.concepts_percent.data * 100).toFixed(2)
              : "No data"
          }}
        </template>
      </Column>
      <Column sortable header="Estimated population" field="estimation">
        <template #body="slotProps">
          {{
            slotProps.data.estimation
              ? formatComma(slotProps.data.estimation.toFixed(2))
              : "No data"
          }}
        </template>
      </Column>
    </DataTable>
    <Divider />
    <Message :closable="false" severity="info">
      This section derives data from the sections above. The contents of the
      table depend on the sections used in calculations.
    </Message>
  </Panel>
</template>

<script setup lang="ts">
import * as d3Format from "d3-format";
import { computed, defineProps } from "vue";
import { useStore } from "vuex";
import Message from "primevue/message";
import Divider from "primevue/divider";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Panel from "primevue/panel";

const store = useStore();

interface Props {
  data: object;
}
const props = defineProps<Props>();

const formatComma = function (value) {
  return d3Format.format(",")(value);
};

const filterData = (data, cdm_name) =>
  data.filter((value) => value.cdm_name === cdm_name);

const prepareData = computed(function () {
  const estimations = store.getters.getSources.map((data) => ({
    cdm_name: data.cdm_source_abbreviation,
  }));

  return estimations.map((obj) => {
    const domainData = filterData(props.data.domainData, obj.cdm_name);
    const rangeData = filterData(props.data.rangeData, obj.cdm_name);
    const visitTypesData = filterData(props.data.visitTypes, obj.cdm_name);
    const sourcePopulation = props.data.sourcePopulation.filter(
      (value) => obj.cdm_name === value.source.cdm_source_abbreviation
    );
    const requiredConcepts = filterData(
      props.data.requiredConcepts,
      obj.cdm_name
    );
    const desiredDomains = filterData(props.data.desiredDomains, obj.cdm_name);

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
  });
});

const getEstimations = computed(() => {
  return prepareData.value.map((obj) => ({
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
        (obj.concepts_percent.isIncluded ? obj.concepts_percent.data || 0 : 1) *
        (obj.desired_domain_value.isIncluded
          ? obj.desired_domain_value.data || 0
          : 1)
    ),
  }));
});
</script>
