export default function getEChartsOptionYearOfBirth({
  zeroBaseline = false,
  data = [],
}) {
  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      top: "top",
      data: ["Male", "Female"],
    },
    grid: {
      left: "3%",
      right: "3%",
      bottom: "10%",
      top: "2%",
      containLabel: true,
    },
    dataset: [
      {
        id: "raw",
        source: data.map((d) => ({
          ...d,
          YEAR: +d.YEAR,
          COUNT_VALUE: +d.COUNT_VALUE,
        })),
      },
      {
        id: "sorted",
        fromDatasetId: "raw",
        transform: {
          type: "sort",
          config: {
            dimension: "YEAR",
            order: "asc",
          },
        },
      },
    ],
    xAxis: {
      type: "category",
      name: "Year of Birth",
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: {
        fontSize: 14,
      },
    },
    yAxis: {
      type: "value",
      name: "# of People",
      nameLocation: "middle",
      nameRotate: 90,
      nameGap: 30,
      nameTextStyle: {
        fontSize: 14,
      },
      min: zeroBaseline ? 0 : "dataMin",
    },
    series: [
      {
        type: "bar",
        datasetId: "sorted",
        encode: {
          x: "YEAR",
          y: "COUNT_PERSON",
        },
      },
    ],
  };
}
