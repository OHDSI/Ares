import { classifyDomain, domainColors } from "../shared/domainColors";

export function scatterChartSpec({
  data = [],
  selectedDatabaseName = "",
}: {
  data: any[];
  selectedDatabaseName?: string;
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
    backgroundColor: "transparent",
    title: {
      text: `Database: ${selectedDatabaseName}`,
      left: "center",
      textStyle: { fontSize: 14 },
    },
    legend: {
      right: 0,
      orient: "vertical",
      top: 30,
      data: Object.keys(domainMap),
    },
    tooltip: {
      trigger: "item",
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
