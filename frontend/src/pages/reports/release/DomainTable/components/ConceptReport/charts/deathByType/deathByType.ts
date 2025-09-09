export default function getEChartsDeathByType({ data = [] }) {
  const deathTypes = data.reduce((acc, d) => {
    const CONCEPT_NAME = d.DEATH_TYPE_CONCEPT_NAME;
    const cost = +d.COUNT_VALUE;
    acc[CONCEPT_NAME] = (acc[CONCEPT_NAME] || 0) + cost;
    return acc;
  }, {});
  const totalRecords = Object.values(deathTypes).reduce((sum, c) => sum + c, 0);

  const series = Object.entries(deathTypes).map(([CONCEPT_NAME, records]) => ({
    name: CONCEPT_NAME,
    type: "bar",
    stack: "total",
    label: { show: false },
    data: [
      {
        value: records / totalRecords,
        CONCEPT_NAME: CONCEPT_NAME,
        TOTAL_COST: records,
      },
    ],
  }));

  return {
    tooltip: {
      trigger: "item",
      formatter: ({ seriesName, data }) =>
        `Type: ${seriesName}<br/>Percent: ${(data.value * 100).toFixed(
          2
        )}%<br/>Records: ${data.TOTAL_COST.toLocaleString()}`,
    },
    legend: {
      orient: "horizontal",
      top: "2%",
      title: {
        text: "Type",
      },
      type: "scroll",
    },
    grid: {
      left: 15,
      right: 15,
      bottom: "10%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      nameLocation: "middle",
      axisLabel: {
        formatter: (v) => `${(v * 100).toFixed(0)}%`,
      },
      min: 0,
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
      data: [""],
      show: false,
    },
    series,
  };
}
