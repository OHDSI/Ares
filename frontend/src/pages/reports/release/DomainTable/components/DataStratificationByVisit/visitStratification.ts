export default function getEChartsOptionSpecVisitStratification({
  zeroBaseline = false,
  data = [],
}) {
  const aggregated = {};
  data.forEach((d) => {
    const concept = d.CONCEPT_NAME;
    const table = d.CDM_TABLE_NAME;
    if (!aggregated[concept]) aggregated[concept] = {};
    if (!aggregated[concept][table]) aggregated[concept][table] = 0;
    aggregated[concept][table] += +d.RECORD_COUNT;
  });

  const tableNames = Array.from(new Set(data.map((d) => d.CDM_TABLE_NAME)));

  const conceptNames = Object.keys(aggregated);
  const seriesData = tableNames.map((table) => ({
    name: table,
    type: "bar",
    stack: "total",
    data: conceptNames.map((concept) => aggregated[concept][table] || 0),
  }));

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "10%",
      containLabel: true,
    },
    legend: {
      type: "scroll",
      orient: "horizontal",
      top: 0,
    },
    xAxis: {
      type: "value",
      name: "Number of Records",
      nameLocation: "middle",
      nameGap: 30,
      interval: 10000,
      nameTextStyle: { fontSize: 14 },
      min: zeroBaseline ? 0 : "dataMin",
    },
    yAxis: {
      type: "category",
      data: conceptNames,
      name: null,
      axisLabel: { interval: 0 },
    },
    series: seriesData,
  };
}
