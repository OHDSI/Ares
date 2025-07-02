export default function getEChartsOptionCohortTimeDistribution({
  zeroBaseline = false,
  data = [],
  minMax = false,
}) {
  const d = {
    ...data[0],
    MIN_VALUE: +data[0].min_value,
    P10_VALUE: +data[0].p_10_value,
    P25_VALUE: +data[0].p_25_value,
    MEDIAN_VALUE: +data[0].median_value,
    P75_VALUE: +data[0].p_75_value,
    P90_VALUE: +data[0].p_90_value,
    MAX_VALUE: +data[0].max_value,
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
          `Min: ${d.min_value}`,
          `P10: ${d.p_10_value}`,
          `P25: ${d.p_25_value}`,
          `Median: ${d.median_value}`,
          `P75: ${d.p_75_value}`,
          `P90: ${d.p_90_value}`,
          `Max: ${d.max_value}`,
        ].join("<br/>");
      },
    },
    grid: { left: "2%", right: "2%", top: "2%", bottom: "15%" },
    xAxis: {
      type: "value",
      name: "Time in Days",
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: { fontSize: 14 },
      scale: true,
      min: zeroBaseline ? 0 : null,
    },
    yAxis: {
      type: "category",
      data: [""],
      show: false,
    },
    series: [
      {
        type: "boxplot",
        data: boxData,
        boxWidth: 28,
        itemStyle: {
          borderWidth: 1,
        },
      },
    ],
  };
}
