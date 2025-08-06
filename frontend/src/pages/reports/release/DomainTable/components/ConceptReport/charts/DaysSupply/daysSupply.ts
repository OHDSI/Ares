export default function getEChartsOptionDaysSupply({
  zeroBaseline = false,
  data = [],
  minMax = false,
}) {
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
      formatter: () =>
        [
          `Min: ${d.MIN_VALUE}`,
          `P10: ${d.P10_VALUE}`,
          `P25: ${d.P25_VALUE}`,
          `Median: ${d.MEDIAN_VALUE}`,
          `P75: ${d.P75_VALUE}`,
          `P90: ${d.P90_VALUE}`,
          `Max: ${d.MAX_VALUE}`,
        ].join("<br/>"),
    },
    grid: {
      left: 15,
      right: "2%",
      bottom: "10%",
      top: "2%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      name: "Days Supply",
      nameLocation: "middle",
      nameGap: 30,
      interval: 2,
      nameTextStyle: { fontSize: 14 },
      min: zeroBaseline ? 0 : "dataMin",
      splitLine: { show: true },
    },
    yAxis: {
      type: "category",
      data: [" "],
      nameGap: 40,
      nameTextStyle: { fontSize: 14 },
      nameLocation: "middle",
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
