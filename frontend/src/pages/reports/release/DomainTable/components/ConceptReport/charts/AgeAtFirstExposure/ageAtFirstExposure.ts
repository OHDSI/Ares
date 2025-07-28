export default function getEChartsOptionAgeAtFirstExposure({
  zeroBaseline = false,
  data = [],
  minMax = false,
}) {
  const source = data.map((d) => ({
    ...d,
    MIN_VALUE: +d.MIN_VALUE,
    P10_VALUE: +d.P10_VALUE,
    P25_VALUE: +d.P25_VALUE,
    MEDIAN_VALUE: +d.MEDIAN_VALUE,
    P75_VALUE: +d.P75_VALUE,
    P90_VALUE: +d.P90_VALUE,
    MAX_VALUE: +d.MAX_VALUE,
  }));

  const sorted = [...source].sort((a, b) => a.categoryOrder - b.categoryOrder);
  const categories = sorted.map((d) => d.CATEGORY);
  const boxData = sorted.map((d) =>
    minMax
      ? [d.MIN_VALUE, d.P25_VALUE, d.MEDIAN_VALUE, d.P75_VALUE, d.MAX_VALUE]
      : [d.P10_VALUE, d.P25_VALUE, d.MEDIAN_VALUE, d.P75_VALUE, d.P90_VALUE]
  );

  return {
    tooltip: {
      trigger: "item",
      formatter: (param) => {
        const d = sorted[param.dataIndex];
        return [
          `<strong>${d.CATEGORY}</strong>`,
          `Min: ${d.MIN_VALUE}`,
          `P10: ${d.P10_VALUE}`,
          `P25: ${d.P25_VALUE}`,
          `Median: ${d.MEDIAN_VALUE}`,
          `P75: ${d.P75_VALUE}`,
          `P90: ${d.P90_VALUE}`,
          `Max: ${d.MAX_VALUE}`,
        ].join("<br/>");
      },
    },
    grid: {
      left: 15,
      right: 15,
      bottom: "10%",
      top: "2%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: { fontSize: 14 },
      min: zeroBaseline ? 0 : "dataMin",
      interval: 2,
      minInterval: 1,
      axisLabel: { formatter: (v) => `${v.toFixed(0)}` },
      splitLine: { show: true },
    },
    yAxis: {
      type: "category",
      nameLocation: "middle",
      nameGap: 40,
      nameTextStyle: { fontSize: 14 },
      inverse: true,
      data: categories,
    },
    series: [
      {
        name: "Observation by Age and Sex",
        type: "boxplot",
        layout: "horizontal",
        data: boxData,
        itemStyle: {
          borderWidth: 1,
        },
      },
    ],
  };
}
