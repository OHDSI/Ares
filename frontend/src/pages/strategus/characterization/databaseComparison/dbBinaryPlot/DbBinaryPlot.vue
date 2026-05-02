<template>
  <div>
    <div v-if="covRef.length >= 2" class="plot-row">
      <div>
        <label>X-Axis</label>
        <Dropdown
          v-model="plotXAxis"
          :options="covRef"
          optionLabel="databaseName"
          optionValue="id"
          class="w-full"
        />
      </div>
      <div>
        <label>Y-Axis</label>
        <Dropdown
          v-model="plotYAxis"
          :options="covRef"
          optionLabel="databaseName"
          optionValue="id"
          class="w-full"
        />
      </div>
    </div>
    <div v-if="covRef.length >= 2" class="scatter-container">
      <Chart
        :data="data"
        :chart-spec="scatterChartSpec"
        id="db-comparison-scatter"
        height="500px"
      />
    </div>
    <p v-else class="table-note">Need at least 2 databases to plot.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import Dropdown from "primevue/dropdown";
import Chart from "@/widgets/echarts/echarts";
import { classifyDomain, domainColors } from "../../shared/domainColors";

interface CovRefEntry {
  id: string;
  databaseName: string;
  n: number;
}

const props = defineProps<{
  data: any[];
  covRef: CovRefEntry[];
  darkMode: boolean;
}>();

const plotXAxis = ref<string | null>(null);
const plotYAxis = ref<string | null>(null);

watch(
  () => props.data,
  () => {
    if (props.covRef.length >= 2) {
      plotXAxis.value = props.covRef[0].id;
      plotYAxis.value = props.covRef[1].id;
    } else {
      plotXAxis.value = null;
      plotYAxis.value = null;
    }
  }
);

watch(
  () => props.covRef,
  (newRefs) => {
    if (newRefs.length >= 2) {
      plotXAxis.value = newRefs[0].id;
      plotYAxis.value = newRefs[1].id;
    } else {
      plotXAxis.value = null;
      plotYAxis.value = null;
    }
  },
  { immediate: true }
);

const scatterChartSpec = computed(() => {
  const xId = plotXAxis.value;
  const yId = plotYAxis.value;

  return ({ data }: { data: any[] }) => {
    if (xId == null || yId == null || !data?.length) return {};

    const xField = `averageValue_${xId}`;
    const yField = `averageValue_${yId}`;
    const xRef = props.covRef.find((r) => r.id === xId);
    const yRef = props.covRef.find((r) => r.id === yId);

    const domainMap: Record<string, [number, number, string][]> = {};
    for (const row of data) {
      const domain = classifyDomain(row.covariateName);
      if (!domainMap[domain]) domainMap[domain] = [];
      domainMap[domain].push([
        row[xField] ?? 0,
        row[yField] ?? 0,
        row.covariateName,
      ]);
    }

    const series: any[] = Object.entries(domainMap).map(([domain, points]) => ({
      name: domain,
      type: "scatter",
      data: points,
      symbolSize: 8,
      itemStyle: { color: domainColors[domain] ?? "#999" },
    }));

    series.push({
      name: "x = y",
      type: "line",
      data: [
        [0, 0],
        [1, 1],
      ],
      symbol: "none",
      lineStyle: { type: "dashed", color: "#000", width: 1 },
      tooltip: { show: false },
    });

    return {
      legend: { right: 0, orient: "vertical", data: Object.keys(domainMap) },
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          if (params.seriesName === "x = y") return "";
          const [x, y, name] = params.data;
          return `<strong>${name}</strong><br/>${xRef?.databaseName}: ${(
            x * 100
          ).toFixed(1)}%<br/>${yRef?.databaseName}: ${(y * 100).toFixed(1)}%`;
        },
      },
      xAxis: {
        name: `${xRef?.databaseName ?? ""} %`,
        nameLocation: "center",
        nameGap: 30,
        min: 0,
        max: 1,
        axisLabel: { formatter: (v: number) => `${(v * 100).toFixed(0)}%` },
      },
      yAxis: {
        name: `${yRef?.databaseName ?? ""} %`,
        nameLocation: "center",
        nameGap: 40,
        min: 0,
        max: 1,
        axisLabel: { formatter: (v: number) => `${(v * 100).toFixed(0)}%` },
      },
      series,
    };
  };
});
</script>

<style scoped>
@import "../../shared/styles.css";

.plot-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  max-width: 500px;
  margin-bottom: 0.75rem;
}

.plot-row > div {
  flex: 1;
  min-width: 130px;
}

.plot-row label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--color-text-label);
}
</style>
