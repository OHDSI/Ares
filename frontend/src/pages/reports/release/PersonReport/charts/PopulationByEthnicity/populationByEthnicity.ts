export default function specEthnicityECharts({ data = [] }) {
  const total = data.reduce((sum, d) => sum + d.COUNT_VALUE, 0);
  const processed = data.map((d) => ({
    ...d,
    PERCENT: d.COUNT_VALUE / total,
  }));

  const series = processed.map((d) => ({
    name: d.CONCEPT_NAME,
    type: "bar",
    stack: "total",
    data: [
      {
        value: d.PERCENT,
        COUNT_VALUE: d.COUNT_VALUE,
      },
    ],
  }));

  return {
    grid: {
      left: 15,
      right: 20,
      top: "10%",
      bottom: "10%",
      containLabel: true,
    },
    legend: {
      orient: "horizontal",
      top: 0,
      left: "center",
      data: processed.map((d) => d.CONCEPT_NAME),
      type: "scroll",
    },
    xAxis: {
      type: "value",
      min: 0,
      max: 1,
      name: "% of People",
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: {
        fontSize: 14,
      },
      splitNumber: 5,
      axisLabel: {
        formatter: (v: number) => `${(v * 100).toFixed(0)}%`,
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
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        return `# People: ${params.data.COUNT_VALUE} <br/>
% People: ${(params.value * 100).toFixed(2)}%`;
      },
    },
    series,
  };
}
