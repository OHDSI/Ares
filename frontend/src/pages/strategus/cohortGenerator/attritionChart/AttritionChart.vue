<template>
  <Chart
    :data="rows"
    :chart-spec="chartSpec"
    :height="chartHeight"
    id="attrition-chart"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import Chart from "@/widgets/echarts/echarts";

import {
  attritionChartSpec,
  attritionChartHeight,
  AttritionRow,
} from "./chartSpec";

const props = defineProps<{ rows: AttritionRow[] }>();

const store = useStore();
const darkMode = computed(() => store.getters.getSettings.darkMode);

const chartHeight = computed(() => attritionChartHeight(props.rows));

const chartSpec = computed(
  () =>
    ({ data }: { data: AttritionRow[] }) =>
      attritionChartSpec({ data, darkMode: darkMode.value })
);
</script>
