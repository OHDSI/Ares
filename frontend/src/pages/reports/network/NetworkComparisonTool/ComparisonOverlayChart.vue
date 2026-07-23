<template>
  <Echarts :id="chartId" :data="chartData" :chart-spec="panel.chartSpec" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import Echarts from "@/widgets/echarts/echarts";
import type { ComparisonOverlayChartPanel } from "@/processes/exploreReports/config/viewRegistry";
import { getByPath } from "./lib/getByPath";

const props = defineProps<{
  panel: ComparisonOverlayChartPanel;
  dataSources: Record<string, any>;
  sources: string[];
}>();

const chartId = computed(
  () => `comparison-${props.panel.name.replace(/\s+/g, "-").toLowerCase()}`,
);

const chartData = computed(() => {
  return props.sources.flatMap((source) => {
    const rows =
      (getByPath(
        props.dataSources[source],
        props.panel.sourceField,
      ) as any[]) || [];
    return rows.map((row) => ({ ...row, DATA_SOURCE_KEY: source }));
  });
});
</script>
