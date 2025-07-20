export default function getEChartsRace({ zeroBaseline = false, data = [] }) {
  const totals = {};
  data.forEach((d) => {
    const key = `${d.CHECK_NAME}|${d.DATA_SOURCE_KEY}`;
    totals[key] = (totals[key] || 0) + +d.COUNT_VALUE;
  });

  const groupMap = {};
  data.forEach((d) => {
    const group = d.DATA_SOURCE_KEY;
    const concept = d.CONCEPT_NAME;
    const key = `${d.CHECK_NAME}|${group}`;
    const percent = +d.COUNT_VALUE / totals[key];
    if (!groupMap[group]) groupMap[group] = {};
    groupMap[group][concept] = (groupMap[group][concept] || 0) + percent;
  });

  const uniqueConcepts = Array.from(new Set(data.map((d) => d.CONCEPT_NAME)));

  const dataSources = Object.keys(groupMap);
  const series = uniqueConcepts.map((concept) => ({
    name: concept,
    type: "bar",
    stack: "total",
    label: { show: false },
    data: dataSources.map((source) => {
      const percent = groupMap[source][concept] || 0;
      return {
        value: percent,
        CONCEPT_NAME: concept,
        DATA_SOURCE_KEY: source,
        PERCENT: percent,
      };
    }),
  }));

  return {
    tooltip: {
      trigger: "item",
      formatter: ({ seriesName, data }) =>
        `Ethnicity: ${seriesName}<br/>Percent: ${(data.value * 100).toFixed(
          2
        )}%<br/>Source: ${data.DATA_SOURCE_KEY}`,
    },
    legend: {
      orient: "horizontal",
      title: {
        text: "Race",
      },
      type: "scroll",
    },
    grid: {
      left: "2%",
      right: "2%",
      bottom: 25,
      top: 25,
      containLabel: true,
    },
    xAxis: {
      type: "value",
      name: "% of People",
      nameLocation: "middle",
      axisLabel: {
        formatter: (v) => `${(v * 100).toFixed(0)}%`,
      },
      min: zeroBaseline ? 0 : undefined,
      max: 1,
      nameGap: 30,
      nameTextStyle: {
        fontSize: 14,
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: "category",
      data: dataSources,
    },
    series,
  };
}
