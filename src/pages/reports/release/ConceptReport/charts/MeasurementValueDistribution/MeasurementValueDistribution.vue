<template>
  <Panel
    header="Measurement Value Distributions By Unit"
    v-if="store.getters.getData.conceptData.MEASUREMENT_VALUE_DISTRIBUTION"
  >
    <MultiSelect
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
    ></MultiSelect>

    <Chart
      v-if="store.getters.dataInStore"
      id="viz-measurementvaluedistribution"
      ref="measurementvalue"
      :chartSpec="specMeasurementValueDistribution"
      :data="getSelectedMeasurementUnits"
    />
    <template #footer>
      <div class="flex flex-row gap-2">
        <ChartActionIcon
          :icon="mdiCheckNetwork"
          tooltip="Check measurement value distributions across the network"
          @iconClicked="router.push(getNetworkConceptRoute())"
        />
        <ChartActionIcon
          :icon="mdiHelpCircle"
          tooltip="Learn how
                  to interpret this plot."
          @iconClicked="router.push({ name: 'help' })"
        />
        <ChartActionIcon
          v-if="store.getters.getQueryIndex"
          :icon="mdiCodeBraces"
          tooltip="View Export Query"
          @iconClicked="
            helpers.openNewTab(
              links.getSqlQueryLink(
                store.getters.getQueryIndex[route.params.domain.toUpperCase()]
                  .MEASUREMENT_VALUE_DISTRIBUTION[0]
              )
            )
          "
        />
      </div>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";

import { links } from "@/shared/config/links";
import { specMeasurementValueDistribution } from "./specMeasurementValueDistribution";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { computed, ref, Ref } from "vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import Panel from "primevue/panel";
import { mdiCheckNetwork, mdiCodeBraces, mdiHelpCircle } from "@mdi/js";

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
const router = useRouter();
</script>

<style scoped></style>
