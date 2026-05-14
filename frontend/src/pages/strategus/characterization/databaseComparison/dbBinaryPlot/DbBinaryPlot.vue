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
import { ref, computed, watch, onMounted, nextTick } from "vue";
import Dropdown from "primevue/dropdown";
import Chart from "@/widgets/echarts/echarts";
import { useStore } from "vuex";
import { classifyDomain, domainColors } from "../../shared/domainColors";
import { useCharacterizationUrl } from "@/shared/lib/composables/useCharacterizationUrl";

interface CovRefEntry {
  id: number;
  databaseId: string | number;
  databaseName: string;
  n: number;
}

const props = defineProps<{
  data: any[];
  covRef: CovRefEntry[];
}>();

const store = useStore();
const darkMode = computed(() => store.getters.getSettings.darkMode);
const { readUrl, patchUrl } = useCharacterizationUrl();

const plotXAxis = ref<string | null>(null);
const plotYAxis = ref<string | null>(null);
let _chartReady = false;
let _urlRestored = false;

watch(
  () => props.covRef,
  (newRefs) => {
    if (newRefs.length >= 2) {
      if (!_urlRestored) {
        const url = readUrl();
        const xMatch = url.dbpX
          ? newRefs.find((r) => String(r.databaseId) === url.dbpX)
          : null;
        const yMatch = url.dbpY
          ? newRefs.find((r) => String(r.databaseId) === url.dbpY)
          : null;
        plotXAxis.value = xMatch ? xMatch.id : newRefs[0].id;
        plotYAxis.value = yMatch ? yMatch.id : newRefs[1].id;
        _urlRestored = true;
      } else {
        if (!newRefs.some((r) => r.id === plotXAxis.value))
          plotXAxis.value = newRefs[0].id;
        if (!newRefs.some((r) => r.id === plotYAxis.value))
          plotYAxis.value = newRefs[1].id;
      }
    } else {
      plotXAxis.value = null;
      plotYAxis.value = null;
    }
  },
  { immediate: true }
);

watch([plotXAxis, plotYAxis], ([x, y]) => {
  if (!_chartReady) return;
  const xRef = x != null ? props.covRef.find((r) => r.id === x) : null;
  const yRef = y != null ? props.covRef.find((r) => r.id === y) : null;
  patchUrl({
    dbpX: xRef != null ? String(xRef.databaseId) : null,
    dbpY: yRef != null ? String(yRef.databaseId) : null,
  });
});

onMounted(async () => {
  await nextTick();
  _chartReady = true;
});

const scatterChartSpec = computed(() => {
  const xId = plotXAxis.value;
  const yId = plotYAxis.value;
  const isDark = darkMode.value;

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

    const series: any[] = [];
    for (const [domain, points] of Object.entries(domainMap)) {
      series.push({
        name: domain,
        type: "scatter",
        data: points,
        symbolSize: 8,
        itemStyle: { color: domainColors[domain] ?? "#999" },
      });
      series.push({
        name: `__ghost_${domain}`,
        type: "scatter",
        data: points,
        symbolSize: 28,
        itemStyle: { opacity: 0 },
        emphasis: { itemStyle: { opacity: 0 } },
        legendHoverLink: false,
        z: 10,
      });
    }

    series.push({
      name: "x = y",
      type: "line",
      data: [
        [0, 0],
        [1, 1],
      ],
      symbol: "none",
      lineStyle: { type: "dashed", color: isDark ? "#bbb" : "#666", width: 1 },
      tooltip: { show: false },
    });

    return {
      grid: { bottom: 90, top: 50, left: 20, right: 10, containLabel: true },
      dataZoom: [
        { type: "inside", xAxisIndex: 0, filterMode: "none" },
        { type: "inside", yAxisIndex: 0, filterMode: "none" },
        { type: "slider", xAxisIndex: 0, filterMode: "none", bottom: 10 },
      ],
      legend: { top: 0, orient: "horizontal", data: Object.keys(domainMap) },
      tooltip: {
        trigger: "item",
        appendToBody: true,
        confine: true,
        extraCssText: "max-width: 280px; word-break: break-word;",
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
