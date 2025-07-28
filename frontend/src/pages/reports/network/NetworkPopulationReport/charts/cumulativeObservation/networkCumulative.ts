export default function getEChartsNetworkCumulative({
  zeroBaseline = false,
  data = [],
}) {
  const grouped = {};
  data.forEach((d) => {
    const source = d.DATA_SOURCE_KEY;
    if (!grouped[source]) grouped[source] = [];
    grouped[source].push({
      x: +d.YEARS,
      y: +d.PERCENT_PEOPLE,
    });
  });

  Object.values(grouped).forEach((arr) => arr.sort((a, b) => a.x - b.x));

  const series = Object.entries(grouped).map(([source, values]) => ({
    name: source,
    type: "line",
    showSymbol: false,
    emphasis: { focus: "series" },
    data: values.map((d) => [d.x, d.y]),
  }));

  return {
    tooltip: {
      trigger: "axis",
      formatter: (params) => {
        const age = params[0].value[0];
        return (
          `Age: ${age}<br/>` +
          params
            .map(
              (p) =>
                `${p.marker}${p.seriesName}: ${(p.value[1] * 100).toFixed(2)}%`
            )
            .join("<br/>")
        );
      },
    },
    legend: {
      top: 0,
      type: "scroll",
    },
    grid: {
      left: 35,
      right: "2%",
      bottom: "10%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      name: "Years of Observation",
      nameLocation: "middle",
      nameGap: 25,
    },
    yAxis: {
      type: "value",
      name: "% of People",
      nameLocation: "middle",
      nameGap: 50,
      axisLabel: {
        formatter: (v) => `${(v * 100).toFixed(0)}%`,
      },
      min: zeroBaseline ? 0 : undefined,
    },
    series,
  };
}
