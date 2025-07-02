export default function getEChartsOptionAgeAtFirstObservation({
  zeroBaseline = false,
  data = [],
}) {
  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      top: "2%",
      containLabel: true,
    },
    dataset: [
      {
        id: "raw",
        source: data.map((d) => ({
          ...d,
          INTERVAL_INDEX: +d.INTERVAL_INDEX,
          PERCENT_VALUE: +d.PERCENT_VALUE,
        })),
      },
      {
        id: "sorted",
        fromDatasetId: "raw",
        transform: {
          type: "sort",
          config: {
            dimension: "INTERVAL_INDEX",
            order: "asc",
          },
        },
      },
    ],
    xAxis: {
      type: "value",
      name: "Age",
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: { fontSize: 14 },
      interval: 2,
      axisLabel: {
        formatter: (v) => `${v}`,
      },
    },
    yAxis: {
      type: "value",
      name: "% of People",
      nameLocation: "middle",
      nameRotate: 90,
      nameGap: 40,
      axisLabel: {
        formatter: (v) => `${(v * 100).toFixed(0)}%`,
      },
      nameTextStyle: { fontSize: 14 },
      min: zeroBaseline ? 0 : "dataMin",
    },
    series: [
      {
        type: "line",
        datasetId: "sorted",
        encode: { x: "INTERVAL_INDEX", y: "PERCENT_VALUE" },
      },
    ],
  };
}
