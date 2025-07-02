export default function getEChartsOptionSpecDrugTypeStratification({
  zeroBaseline = false,
  data = [],
}) {
  const aggregatedData = Object.values(
    data.reduce((acc, d) => {
      const key = d.CONCEPT_NAME;
      if (!acc[key]) {
        acc[key] = { CONCEPT_NAME: key, SUM_RECORD_COUNT: 0 };
      }
      acc[key].SUM_RECORD_COUNT += +d.RECORD_COUNT;
      return acc;
    }, {})
  ).sort((a, b) => b.SUM_RECORD_COUNT - a.SUM_RECORD_COUNT);

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    grid: {
      left: "0%",
      right: "2%",
      bottom: "10%",
      top: "2%",
      containLabel: true,
    },
    dataset: [
      {
        id: "aggregated",
        source: aggregatedData,
      },
    ],
    xAxis: {
      type: "value",
      name: "Number of Records",
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: { fontSize: 14 },
      min: zeroBaseline ? 0 : "dataMin",
      max: "dataMax",
    },
    yAxis: {
      type: "category",
      name: null,
      axisLabel: { interval: 0 },
    },
    series: [
      {
        type: "bar",
        datasetId: "aggregated",
        encode: {
          x: "SUM_RECORD_COUNT",
          y: "CONCEPT_NAME",
        },
      },
    ],
  };
}
