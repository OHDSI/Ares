export function getEChartsConditionsByTypeFacet({ data = [] }) {
  const groupedBySource = data.reduce((acc, d) => {
    const source = d.SOURCE;
    if (!acc[source]) acc[source] = [];
    acc[source].push(d);
    return acc;
  }, {});

  const sources = Object.keys(groupedBySource);

  const grids = [];
  const xAxes = [];
  const yAxes = [];
  const series = [];

  sources.forEach((source, idx) => {
    const records = groupedBySource[source];
    const conceptTotals = records.reduce((acc, d) => {
      const k = d.CONCEPT_NAME;
      const v = +d.COUNT_VALUE;
      acc[k] = (acc[k] || 0) + v;
      return acc;
    }, {});

    const total = Object.values(conceptTotals).reduce((sum, v) => sum + v, 0);

    const concepts = Object.keys(conceptTotals);
    concepts.forEach((concept) => {
      series.push({
        name: concept,
        type: "bar",
        stack: `total_${idx}`,
        xAxisIndex: idx,
        yAxisIndex: idx,
        label: { show: false },
        data: [
          {
            value: conceptTotals[concept] / total,
            COUNT_VALUE: conceptTotals[concept],
            PERCENT: conceptTotals[concept] / total,
            CONCEPT_NAME: concept,
            SOURCE: source,
          },
        ],
      });
    });

    grids.push({
      top: 30 + idx * 110,
      height: 100,
      left: "1%",
      right: "2%",
      containLabel: true,
    });

    xAxes.push({
      type: "value",
      min: 0,
      max: 1,
      axisLabel: {
        formatter: (v) => `${(v * 100).toFixed(0)}%`,
      },
      name: "% of Records",
      nameLocation: "middle",
      gridIndex: idx,
    });

    yAxes.push({
      type: "category",
      data: [source],
      gridIndex: idx,
    });
  });

  return {
    tooltip: {
      trigger: "item",
      formatter: ({ data }) =>
        `Source: ${data.SOURCE}<br/>Condition Type: ${
          data.CONCEPT_NAME
        }<br/>Number of Records: ${data.COUNT_VALUE}<br/>% of Records: ${(
          data.PERCENT * 100
        ).toFixed(2)}%`,
    },
    legend: {
      orient: "horizontal",
      top: 0,
    },
    grid: grids,
    xAxis: xAxes,
    yAxis: yAxes,
    series,
  };
}
