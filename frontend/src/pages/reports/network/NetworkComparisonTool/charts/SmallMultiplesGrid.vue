<template>
  <div
    class="grid gap-4"
    style="grid-template-columns: repeat(auto-fill, minmax(340px, 1fr))"
  >
    <div
      v-for="source in sources"
      :key="source"
      class="rounded p-2"
      :class="
        source === referenceKey
          ? 'border-2 border-blue-500 dark:border-blue-400'
          : 'border dark:border-surface-700 border-surface-200'
      "
    >
      <div class="text-sm font-medium mb-1">
        {{ source }}
        <span
          v-if="source === referenceKey"
          class="text-xs font-medium text-blue-500 dark:text-blue-400 ml-1"
          >(reference)</span
        >
      </div>
      <Echarts
        :id="`${chartIdPrefix}-${source}`"
        :data="getRows(source)"
        :chart-spec="panel.chartSpec"
        height="260px"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Echarts from "@/widgets/echarts/echarts";
import type { ComparisonSmallMultiplesPanel } from "@/processes/exploreReports/config/viewRegistry";
import { getByPath } from "../lib/getByPath";

const props = defineProps<{
  panel: ComparisonSmallMultiplesPanel;
  dataSources: Record<string, any>;
  sources: string[];
  referenceKey: string | null;
}>();

const chartIdPrefix = computed(
  () => `comparison-${props.panel.name.replace(/\s+/g, "-").toLowerCase()}`,
);

function getRows(source: string): any[] {
  return (
    (getByPath(props.dataSources[source], props.panel.sourceField) as any[]) ||
    []
  );
}
</script>
