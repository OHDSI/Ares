<template>
  <div v-if="!store.getters.getErrors">
    <v-container fluid>
      <v-responsive min-width="900">
        <v-layout class="ma-0 mb-5 d-flex justify-space-between">
          <h2 v-if="store.getters.getData.metadata" class="text-uppercase">
            {{ store.getters.getData.metadata.conceptName }}
            NETWORK REPORT
          </h2>
          <ReturnButton />
        </v-layout>
        <v-row v-if="store.getters.getData.metadata" justify="start">
          <v-col cols="2" align="center">
            <v-icon left color="info">mdi-identifier</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="store.getters.getData.metadata.conceptId"
            ></v-badge>
            <p class="text-caption">Concept Identifier</p>
          </v-col>
          <v-col cols="2" align="center">
            <v-icon left color="info">mdi-account-group</v-icon>
            <v-badge
              tile
              inline
              dark
              color="info"
              :content="store.getters.getData.metadata.numPersons"
            ></v-badge>
            <p class="text-caption">Number of People in Network</p>
          </v-col>
        </v-row>
        <v-card
          v-if="store.getters.getData.table"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-data-table
            density="compact"
            :headers="headers"
            :items="store.getters.getData.table.measurementValueDistribution"
          >
          </v-data-table>
        </v-card>
        <v-card
          v-if="store.getters.getData.chart"
          :loading="!store.getters.getData"
          elevation="10"
          class="ma-4 pa-2"
        >
          <v-card-title
            >Measurement Value Distributions by Database and Unit</v-card-title
          >
          <v-layout class="pa-4">
            <v-select
              v-model="selectedMeasurementUnits"
              class="mr-13"
              :items="getMeasurementUnits"
              variant="outlined"
              hide-selected
              closable-chips
              chips
              label="Filter units"
              multiple
            ></v-select>
          </v-layout>
          <Chart
            id="viz-measurementvaluedistribution"
            ref="measurementvalue"
            :config="chartConfigs.specMeasurementValueDistribution"
            :data="
              getSelectedMeasurementUnits ? getSelectedMeasurementUnits : []
            "
          />
          <infopanel
            details="Learn how
              to interpret this plot."
            route-link="/help"
            :divider="true"
            :link-details="true"
          ></infopanel>
          <infopanel
            v-if="store.getters.getQueryIndex"
            icon="mdi-code-braces"
            details="View export query."
            :link-details="true"
            :link="
              links.getSqlQueryLink(
                store.getters.getQueryIndex.MEASUREMENT
                  .MEASUREMENT_VALUE_DISTRIBUTION[0]
              )
            "
            :divider="false"
          ></infopanel>
        </v-card>
      </v-responsive>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import ReturnButton from "@/features/returnToPreviousPage";
import { chartConfigs, Chart } from "@/widgets/chart";
import { VDataTable } from "vuetify/labs/VDataTable";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { DataTableHeader } from "@/shared/interfaces/DataTableHeader";

import { computed, Ref, ref } from "vue";
import Infopanel from "@/widgets/infoPanel/ui/InfoPanel.vue";

const store = useStore();

const headers: Ref<DataTableHeader[]> = ref([
  {
    title: "Source",
    sortable: true,
    key: "SOURCE",
    align: "start",
  },
  {
    title: "Unit",
    sortable: true,
    key: "CATEGORY",
    align: "start",
  },
  {
    title: "Release",
    sortable: true,
    key: "RELEASE",
    align: "start",
  },
  {
    title: "Count value",
    sortable: true,
    key: "UNIT_COUNT",
    align: "start",
  },
  {
    title: "Min Value",
    sortable: true,
    key: "MIN_VALUE",
    align: "start",
  },
  {
    title: "P10 Value",
    sortable: true,
    key: "P10_VALUE",
    align: "start",
  },
  {
    title: "P25 Value",
    sortable: true,
    key: "P25_VALUE",
    align: "start",
  },
  {
    title: "Median Value",
    sortable: true,
    key: "MEDIAN_VALUE",
    align: "start",
  },
  {
    title: "P75 Value",
    sortable: true,
    key: "P75_VALUE",
    align: "start",
  },
  {
    title: "P90 Value",
    sortable: true,
    key: "P90_VALUE",
    align: "start",
  },
  {
    title: "Max Value",
    sortable: true,
    key: "MAX_VALUE",
    align: "start",
  },
]);

const getMeasurementUnits = computed(function () {
  return [
    ...new Set(
      store.getters.getData?.chart?.measurementValueDistribution.map(
        (value) => value.CATEGORY
      )
    ),
  ];
});

const selectedMeasurementUnits: Ref<string[]> = ref([]);

const getSelectedMeasurementUnits = computed(function () {
  return selectedMeasurementUnits.value.length
    ? store.getters.getData?.chart?.measurementValueDistribution.filter(
        (value) => selectedMeasurementUnits.value.includes(value.CATEGORY)
      )
    : store.getters.getData?.chart?.measurementValueDistribution;
});
</script>

<style scoped>
.viz-container {
  width: 90%;
}
</style>
