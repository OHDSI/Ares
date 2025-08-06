export default function getEChartsOptionMeasurementDistribution({
  zeroBaseline = false,
  data = [],
  minMax = false,
}) {
  const categories = data.map((d) => d.CATEGORY);
  const d = {
    ...data[0],
    MIN_VALUE: +data[0]?.MIN_VALUE,
    P10_VALUE: +data[0]?.P10_VALUE,
    P25_VALUE: +data[0]?.P25_VALUE,
    MEDIAN_VALUE: +data[0]?.MEDIAN_VALUE,
    P75_VALUE: +data[0]?.P75_VALUE,
    P90_VALUE: +data[0]?.P90_VALUE,
    MAX_VALUE: +data[0]?.MAX_VALUE,
  };

  const boxData = [
    minMax
      ? [d.MIN_VALUE, d.P25_VALUE, d.MEDIAN_VALUE, d.P75_VALUE, d.MAX_VALUE]
      : [d.P10_VALUE, d.P25_VALUE, d.MEDIAN_VALUE, d.P75_VALUE, d.P90_VALUE],
  ];

  return {
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        const d = data[params.dataIndex];
        return [
          `<b>${d.CATEGORY}</b>`,
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
      min: zeroBaseline ? 0 : "dataMin",
      splitLine: { show: true },
      interval: 2,
    },
    yAxis: {
      type: "category",
      data: categories,
      nameGap: 40,
      nameTextStyle: { fontSize: 14 },
      nameLocation: "middle",
    },
    series: [
      {
        name: "Measurement Distribution",
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
