export default function getEChartsDataQualityDelta({
  zeroBaseline = false,
  data = [],
}) {
  const releases = data.map((d) => d.release);

  const variables = ["NEW", "EXISTING", "RESOLVED", "STABLE"];

  const series = variables.map((variable) => ({
    name: variable,
    type: "line",
    data: data.map((d) => +d[variable] || 0),
    showSymbol: true,
    symbol: "circle",
    symbolSize: 6,
  }));

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "line" },
    },
    legend: {
      data: variables,
      orient: "horizontal",
      selectedMode: "multiple",
    },
    grid: {
      left: "2%",
      right: "2%",
      bottom: "7%",
      top: "7%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      name: "Release Name",
      data: releases,
      nameLocation: "middle",
      nameGap: 30,
      splitLine: { show: true },
      axisTick: { show: true },
    },
    yAxis: {
      type: "value",
      name: "Count",
      nameLocation: "middle",
      nameRotate: 90,
      nameGap: 45,
      splitLine: { show: true },
      axisTick: { show: true },
      ...(zeroBaseline ? { min: 0 } : {}),
    },
    series,
  };
}
