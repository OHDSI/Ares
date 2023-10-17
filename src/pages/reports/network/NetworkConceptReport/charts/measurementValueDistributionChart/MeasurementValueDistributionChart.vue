<template>
  <v-card elevation="2" class="ma-4">
    <ChartHeader title="Measurement Value Distributions by Database and Unit" />
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
      :chartSpec="specMeasurementValueDistribution"
      :data="getSelectedMeasurementUnits ? getSelectedMeasurementUnits : []"
    />
    <v-toolbar density="compact" class="mt-6">
      <ChartActionIcon
        icon="mdi-help-circle"
        tooltip="Learn how
              to interpret this plot."
        @iconClicked="router.push({ name: 'help' })"
      />
      <ChartActionIcon
        v-if="store.getters.getQueryIndex"
        icon="mdi-code-braces"
        tooltip="View Export Query"
        @iconClicked="
          helpers.openNewTab(
            links.getSqlQueryLink(
              store.getters.getQueryIndex.MEASUREMENT
                .MEASUREMENT_VALUE_DISTRIBUTION[0]
            )
          )
        "
      />
    </v-toolbar>
  </v-card>
</template>

<script setup lang="ts">
import { Chart } from "@/widgets/chart";
import { specMeasurementValueDistribution } from "./specMeasurementValueDistribution";
import { links } from "@/shared/config/links";
import { useStore } from "vuex";
import { computed, ref, Ref, defineProps } from "vue";
import ChartHeader from "@/widgets/chart/ui/ChartHeader.vue";
import { helpers } from "@/shared/lib/mixins";
import ChartActionIcon from "@/widgets/chart/ui/ChartActionIcon.vue";
import { useRouter } from "vue-router";
import { DistributionType } from "@/processes/exploreReports/model/interfaces/reportTypes/DistributionType";

const store = useStore();
const router = useRouter();

interface Props {
  data: DistributionType[];
}

const props = defineProps<Props>();

const getMeasurementUnits = computed(function () {
  return [...new Set(props.data.map((value) => value.CATEGORY))];
});

const selectedMeasurementUnits: Ref<string[]> = ref([]);

const getSelectedMeasurementUnits = computed(function () {
  return selectedMeasurementUnits.value.length
    ? props.data.filter((value) =>
        selectedMeasurementUnits.value.includes(value.CATEGORY)
      )
    : props.data;
});
</script>

<style scoped></style>
