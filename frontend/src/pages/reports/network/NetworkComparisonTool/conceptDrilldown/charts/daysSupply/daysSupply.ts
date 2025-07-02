export default function getEChartsOptionDaysSupplyFaceted({
  zeroBaseline = false,
  data = [],
  minMax = false,
}) {
  const grouped = {};
  data.forEach((row) => {
    const key = row.SOURCE || "Unknown";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({
      MIN_VALUE: +row.MIN_VALUE,
      P10_VALUE: +row.P10_VALUE,
      P25_VALUE: +row.P25_VALUE,
      MEDIAN_VALUE: +row.MEDIAN_VALUE,
      P75_VALUE: +row.P75_VALUE,
      P90_VALUE: +row.P90_VALUE,
      MAX_VALUE: +row.MAX_VALUE,
    });
  });

  const yCategories = Object.keys(grouped);

  const boxData = [];
  const tooltipMap = [];

  yCategories.forEach((source) => {
    const d = grouped[source][0];
    const values = minMax
      ? [d.MIN_VALUE, d.P25_VALUE, d.MEDIAN_VALUE, d.P75_VALUE, d.MAX_VALUE]
      : [d.P10_VALUE, d.P25_VALUE, d.MEDIAN_VALUE, d.P75_VALUE, d.P90_VALUE];

    boxData.push(values);
    tooltipMap.push(d);
  });

  return {
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        const d = tooltipMap[params.dataIndex];
        return [
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
      left: "2%",
      right: "2%",
      bottom: "10%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      name: "Days Supply",
      nameLocation: "middle",
      nameGap: 30,
      interval: 1,
      min: zeroBaseline ? 0 : "dataMin",
      splitLine: { show: true },
    },
    yAxis: {
      type: "category",
      data: yCategories,
      axisLine: { show: true },
    },
    series: [
      {
        name: "Days Supply",
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
