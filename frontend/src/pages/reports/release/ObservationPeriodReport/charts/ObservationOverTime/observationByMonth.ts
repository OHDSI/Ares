export default function getEChartsOptionObservationByMonth({
  zeroBaseline = false,
  data = [],
}) {
  const parsed = data
    .map((d) => ({
      date: new Date(d.DATE),
      count: +d.COUNT_VALUE,
      pct: +d.PERCENT_VALUE,
    }))
    .sort((a, b) => a.date - b.date);

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      formatter: (pts) => {
        const p = pts.find((p) => p.seriesName === "% of People") || pts[0];
        const d = parsed[p.dataIndex];
        return [
          `Date: ${d.date.toISOString().slice(0, 7)}`,
          `# of People: ${d.count.toLocaleString()}`,
          `% of People: ${(d.pct * 100).toFixed(2)}%`,
        ].join("<br/>");
      },
    },
    grid: { left: "4%", right: "4%", top: "2%", bottom: "15%" },
    xAxis: {
      type: "time",
      splitLine: { show: true },
      name: "Date",
      splitNumber: 20,
      axisLabel: {
        formatter: (v) => new Date(v).toISOString().slice(0, 7),
        interval: 0,
      },
    },
    yAxis: {
      type: "value",
      name: "% of People",
      splitLine: { show: true },
      nameLocation: "middle",
      nameRotate: 90,
      nameGap: 40,
      nameTextStyle: {
        fontSize: 14,
      },
      axisLabel: { formatter: (v) => `${(v * 100).toFixed(0)}%` },
      min: zeroBaseline ? 0 : null,
    },
    dataZoom: [
      {
        type: "slider",
        xAxisIndex: 0,
        filterMode: "none",
        height: 30,
        bottom: "5%",
      },
      {
        type: "inside",
        xAxisIndex: 0,
      },
    ],
    series: [
      {
        name: "% of People",
        type: "line",
        data: parsed.map((d) => [d.date, d.pct]),
        showSymbol: true,
        symbolSize: 4,
        lineStyle: { width: 1 },
      },
    ],
  };
}
