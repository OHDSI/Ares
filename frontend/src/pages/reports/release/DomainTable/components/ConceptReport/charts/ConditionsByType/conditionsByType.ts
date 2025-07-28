export default function getEChartsConditionsByType({ data = [] }) {
  const domainCosts = data.reduce((acc, d) => {
    const CONCEPT_NAME = d.CONCEPT_NAME;
    const cost = +d.COUNT_VALUE;
    acc[CONCEPT_NAME] = (acc[CONCEPT_NAME] || 0) + cost;
    return acc;
  }, {});
  const totalCost = Object.values(domainCosts).reduce((sum, c) => sum + c, 0);

  const series = Object.entries(domainCosts).map(([CONCEPT_NAME, cost]) => ({
    name: CONCEPT_NAME,
    type: "bar",
    stack: "total",
    label: { show: false },
    data: [
      { value: cost / totalCost, CONCEPT_NAME: CONCEPT_NAME, TOTAL_COST: cost },
    ],
  }));

  return {
    tooltip: {
      trigger: "item",
      formatter: ({ seriesName, data }) =>
        `Domain: ${seriesName}<br/>Percent: ${(data.value * 100).toFixed(
          2
        )}%<br/>Cost: ${data.TOTAL_COST.toLocaleString()}`,
    },
    legend: {
      orient: "horizontal",
      top: "2%",
      title: {
        text: "Domain",
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
      name: "% of Cost",
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
