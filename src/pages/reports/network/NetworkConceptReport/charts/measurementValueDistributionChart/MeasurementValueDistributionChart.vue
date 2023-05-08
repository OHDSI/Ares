<template>
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
      id="viz-networkmeasurementvaluedistribution"
      ref="measurementvalue"
      :config="specMeasurementValueDistribution"
      :data="getSelectedMeasurementUnits ? getSelectedMeasurementUnits : []"
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
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import Infopanel from "@/widgets/infoPanel/ui/InfoPanel.vue";
import { specMeasurementValueDistribution } from "./specMeasurementValueDistribution";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { computed, ref, Ref } from "vue";

const store = useStore();

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

<style scoped></style>
