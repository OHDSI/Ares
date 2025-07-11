export default function getEChartsRecordsByUnitFaceted({ data = [] }) {
  const grouped = {};
  const allConcepts = new Set();
  const allSources = new Set();

  data.forEach((d) => {
    const source = d.SOURCE || "Unknown";
    const concept = d.CONCEPT_NAME;
    const count = +d.COUNT_VALUE;

    allSources.add(source);
    allConcepts.add(concept);

    if (!grouped[source]) grouped[source] = {};
    grouped[source][concept] = (grouped[source][concept] || 0) + count;
  });

  const yCategories = Array.from(allSources);
  const concepts = Array.from(allConcepts);

  const totalsBySource = {};
  yCategories.forEach((source) => {
    totalsBySource[source] = Object.values(grouped[source]).reduce(
      (sum, v) => sum + v,
      0
    );
  });

  const series = concepts.map((concept) => ({
    name: concept,
    type: "bar",
    stack: "total",
    barWidth: "60%",
    label: { show: false },
    data: yCategories.map((source) => {
      const count = grouped[source]?.[concept] || 0;
      const percent =
        totalsBySource[source] > 0 ? count / totalsBySource[source] : 0;
      return {
        value: percent,
        COUNT_VALUE: count,
        PERCENT: percent,
        SOURCE: source,
      };
    }),
  }));

  return {
    tooltip: {
      trigger: "item",
      formatter: ({ seriesName, data }) => {
        return [
          `Unit type: ${seriesName}`,
          `Source: ${data.SOURCE}`,
          `Number of Records: ${data.COUNT_VALUE.toLocaleString()}`,
          `Percent: ${(data.PERCENT * 100).toFixed(2)}%`,
        ].join("<br/>");
      },
    },
    legend: {
      type: "scroll",
      orient: "horizontal",
      top: "2%",
      type: "scroll",
    },
    grid: {
      left: "2%",
      right: "2%",
      bottom: "10%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      name: "% of Records",
      nameLocation: "middle",
      nameGap: 30,
      axisLabel: {
        formatter: (v) => `${(v * 100).toFixed(0)}%`,
      },
      min: 0,
      max: 1,
      splitLine: { show: false },
    },
    yAxis: {
      type: "category",
      data: yCategories,
    },
    series,
  };
}
