export default function getEChartsOptionCumulativeObservation({
  zeroBaseline = false,
  data = [],
}) {
  return {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          formatter: (params) => {
            if (params.axisDimension === "y") {
              return `${(params.value * 100).toFixed(0)}%`;
            }
            return `${params.value}`;
          },
        },
      },
      formatter: (params) => {
        const value = params[0]?.data?.PERCENT_PEOPLE;
        return value != null ? `${(value * 100).toFixed(0)}%` : "N/A";
      },
    },
    grid: {
      left: 20,
      right: 20,
      bottom: "10%",
      top: "2%",
      containLabel: true,
    },
    dataset: [
      {
        id: "raw",
        source: data.map((d) => ({
          ...d,
          AGE: +d.AGE,
          COUNT_VALUE: +d.COUNT_VALUE,
        })),
      },
      {
        id: "sorted",
        fromDatasetId: "raw",
        transform: {
          type: "sort",
          config: {
            dimension: "YEARS",
            order: "asc",
          },
        },
      },
    ],
    xAxis: {
      type: "value",
      name: "Years of Observation",
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: { fontSize: 14 },
      interval: 2,
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
        encode: { x: "YEARS", y: "PERCENT_PEOPLE" },
      },
    ],
  };
}
