export default function getEChartsOptionAgeAtFirstOccurrenceFaceted({
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

  const groups = {};
  for (const d of source) {
    if (!groups[d.SOURCE]) groups[d.SOURCE] = [];
    groups[d.SOURCE].push(d);
  }

  const grids = [];
  const xAxes = [];
  const yAxes = [];
  const series = [];
  const titles = [];
  let gridIndex = 0;

  const sources = Object.keys(groups);
  for (const src of sources) {
    const groupData = groups[src].sort(
      (a, b) => a.categoryOrder - b.categoryOrder
    );
    const categories = groupData.map((d) => d.CATEGORY);

    grids.push({
      top: gridIndex * (100 + 30),
      height: 100,
      left: 80,
      right: 20,
      containLabel: true,
    });

    titles.push({
      text: src,
      top: `${gridIndex * (100 + 30)}`,
      textStyle: {
        fontWeight: "bold",
        fontSize: 14,
      },
    });

    xAxes.push({
      type: "value",
      min: zeroBaseline ? 0 : "dataMin",
      gridIndex,
      interval: 2,
      max: "dataMax",
      axisLabel: { formatter: (v) => `${v.toFixed(0)}` },
      splitLine: { show: true },
    });

    yAxes.push({
      type: "category",
      data: categories,
      gridIndex,
      inverse: true,
    });

    const boxData = groupData.map((d) =>
      minMax
        ? [d.MIN_VALUE, d.P25_VALUE, d.MEDIAN_VALUE, d.P75_VALUE, d.MAX_VALUE]
        : [d.P10_VALUE, d.P25_VALUE, d.MEDIAN_VALUE, d.P75_VALUE, d.P90_VALUE]
    );

    series.push({
      name: "Age at Diagnosis",
      type: "boxplot",
      data: boxData,
      xAxisIndex: gridIndex,
      yAxisIndex: gridIndex,
      tooltip: {
        //todo: use this formatter for all dist charts
        formatter: (param) => {
          const d = groupData[param.dataIndex];
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
    });

    gridIndex++;
  }

  return {
    title: titles,
    tooltip: { trigger: "item" },
    grid: grids,
    xAxis: xAxes,
    yAxis: yAxes,
    series: series,
  };
}
