import { classifyDomain, domainColors } from "../shared/domainColors";

export function scatterChartSpec({
  data = [],
  selectedDatabaseName = "",
  darkMode = false,
}: {
  data: any[];
  selectedDatabaseName?: string;
  darkMode?: boolean;
}) {
  if (!data.length) return {};

  const domainMap: Record<string, [number, number, string][]> = {};
  for (const row of data) {
    const x = Math.max(row.averageValue_1 ?? 0, 0);
    const y = Math.max(row.averageValue_2 ?? 0, 0);
    const domain = classifyDomain(row.covariateName);
    if (!domainMap[domain]) domainMap[domain] = [];
    domainMap[domain].push([x, y, row.covariateName]);
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
    lineStyle: { type: "dashed", color: darkMode ? "#bbb" : "#666", width: 1 },
    tooltip: { show: false },
  });

  return {
    backgroundColor: "transparent",
    grid: { bottom: 90, top: 70, left: 20, right: 10, containLabel: true },
    dataZoom: [
      { type: "inside", xAxisIndex: 0, filterMode: "none" },
      { type: "inside", yAxisIndex: 0, filterMode: "none" },
      { type: "slider", xAxisIndex: 0, filterMode: "none", bottom: 10 },
    ],
    title: {
      text: `Database: ${selectedDatabaseName}`,
      left: "center",
      top: 30,
      textStyle: { fontSize: 14 },
    },
    legend: { top: 0, orient: "horizontal", data: Object.keys(domainMap) },
    tooltip: {
      trigger: "item",
      appendToBody: true,
      confine: true,
      extraCssText: "max-width: 280px; word-break: break-word;",
      formatter: (params) => {
        if ((params as any).seriesName === "x = y") return "";
        const [x, y, name] = (params as any).data;
        return `<strong>${name}</strong><br/>Target: ${(x * 100).toFixed(
          1
        )}%<br/>Comparator: ${(y * 100).toFixed(1)}%`;
      },
    },
    xAxis: {
      name: "Target %",
      nameLocation: "center",
      nameGap: 30,
      min: 0,
      max: 1,
      axisLabel: { formatter: (v) => `${(v * 100).toFixed(0)}%` },
    },
    yAxis: {
      name: "Comparator %",
      nameLocation: "center",
      nameGap: 40,
      min: 0,
      max: 1,
      axisLabel: { formatter: (v) => `${(v * 100).toFixed(0)}%` },
    },
    series,
  };
}
