<template>
  <v-card
    v-if="store.getters.getData.conceptData.MEASUREMENT_VALUE_DISTRIBUTION"
    :loading="!store.getters.dataInStore"
    elevation="10"
    class="ma-4 pa-2"
  >
    <v-card-title>Measurement Value Distributions</v-card-title>
    <v-layout class="pa-4">
      <v-select
        v-model="selectedMeasurementUnits"
        class="mr-13"
        :items="getMeasurementUnits"
        attach
        variant="outlined"
        hide-selected
        closable-chips
        chips
        label="Filter units"
        multiple
      ></v-select>
    </v-layout>
    <Chart
      v-if="store.getters.dataInStore"
      id="viz-measurementvaluedistribution"
      ref="measurementvalue"
      :config="specMeasurementValueDistribution"
      :data="getSelectedMeasurementUnits"
    />
    <info-panel
      details="Check measurement value distributions across the network"
      icon="mdi-check-network"
      link-details
      :route-link="getNetworkConceptRoute()"
      :divider="true"
    ></info-panel>
    <info-panel
      details="Learn how
              to interpret this plot."
      icon="mdi-help-circle"
      link-details
      :route-link="{ name: 'help' }"
      divider
    ></info-panel>
    <info-panel
      v-if="store.getters.getQueryIndex"
      details="View export query."
      icon="mdi-code-braces"
      link-details
      :link="
        links.getSqlQueryLink(
          store.getters.getQueryIndex[route.params.domain.toUpperCase()]
            .MEASUREMENT_VALUE_DISTRIBUTION[0]
        )
      "
      divider
    ></info-panel>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import InfoPanel from "@/widgets/infoPanel";
import { links } from "@/shared/config/links";
import { specMeasurementValueDistribution } from "./specMeasurementValueDistribution";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { computed, ref, Ref } from "vue";

const selectedMeasurementUnits: Ref<string[]> = ref([]);

const getMeasurementUnits = computed((): string[] => {
  if (store.getters.getData?.conceptData?.MEASUREMENT_VALUE_DISTRIBUTION) {
    return store.getters.getData.conceptData.MEASUREMENT_VALUE_DISTRIBUTION.map(
      (value) => value.CATEGORY
    );
  } else {
    return [];
  }
});

const getSelectedMeasurementUnits = computed((): string[] => {
  if (store.getters.getData?.conceptData?.MEASUREMENT_VALUE_DISTRIBUTION) {
    return selectedMeasurementUnits.value.length
      ? store.getters.getData.conceptData.MEASUREMENT_VALUE_DISTRIBUTION.filter(
          (value) => selectedMeasurementUnits.value.includes(value.CATEGORY)
        )
      : store.getters.getData.conceptData.MEASUREMENT_VALUE_DISTRIBUTION;
  } else {
    return [];
  }
});

const getNetworkConceptRoute = function (): object {
  return {
    name: "networkConcept",
    params: {
      domain: route.params.domain,
      concept: route.params.concept,
    },
  };
};

const store = useStore();
const route = useRoute();
</script>

<style scoped></style>
