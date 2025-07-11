import { kmbFormatter } from "@/widgets/echarts/lib/formatters";

export default function getEChartsOptionAgeSex({
  zeroBaseline = false,
  data = [],
}) {
  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      top: 0,
      data: ["Male", "Female"],
    },
    grid: {
      left: "3%",
      right: "3%",
      bottom: "10%",
      top: "10%",
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
        id: "filtered",
        fromDatasetId: "raw",
        transform: {
          type: "filter",
          config: {
            and: [
              { dimension: "AGE", gte: 0 },
              { dimension: "AGE", lte: 100 },
            ],
          },
        },
      },
      {
        id: "sorted",
        fromDatasetId: "filtered",
        transform: {
          type: "sort",
          config: {
            dimension: "AGE",
            order: "asc",
          },
        },
      },
      {
        id: "maleFiltered",
        fromDatasetId: "sorted",
        transform: {
          type: "filter",
          config: { dimension: "CONCEPT_NAME", eq: "MALE" },
        },
      },
      {
        id: "femaleFiltered",
        fromDatasetId: "sorted",
        transform: {
          type: "filter",
          config: { dimension: "CONCEPT_NAME", eq: "FEMALE" },
        },
      },
    ],
    xAxis: {
      type: "category",
      name: "Age at First Observation",
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: {
        fontSize: 14,
      },
    },
    yAxis: {
      type: "value",
      name: "Number of People",
      nameLocation: "middle",
      nameRotate: 90,
      nameGap: 40,
      nameTextStyle: {
        fontSize: 14,
      },
      min: zeroBaseline ? 0 : "dataMin",
      axisLabel: {
        formatter: (v) => kmbFormatter(v),
      },
    },
    series: [
      {
        name: "Male",
        type: "bar",
        datasetId: "maleFiltered",
        encode: {
          x: "AGE",
          y: "COUNT_VALUE",
        },
      },
      {
        name: "Female",
        type: "bar",
        datasetId: "femaleFiltered",
        encode: {
          x: "AGE",
          y: "COUNT_VALUE",
        },
      },
    ],
  };
}
