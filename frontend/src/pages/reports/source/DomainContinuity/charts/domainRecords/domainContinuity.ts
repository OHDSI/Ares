import { kmbFormatter } from "@/widgets/echarts/lib/formatters";

export function getEChartsOverview({ zeroBaseline = false, data = [] }) {
  const domains = [...new Set(data.map((d) => d.domain))];
  const series = [];
  const grids = [];
  const xAxes = [];
  const yAxes = [];
  const domainToIndex = {};

  domains.forEach((domain, i) => {
    const filtered = data
      .filter((d) => d.domain === domain)
      .sort((a, b) => new Date(a.release_date) - new Date(b.release_date));

    const gridTop = 10 + i * 100;

    domainToIndex[domain] = i;

    grids.push({
      top: `${gridTop}px`,
      height: 75,
      left: 60,
      right: 20,
      bottom: 5,
    });

    xAxes.push({
      type: "time",
      name: domain,
      nameLocation: "middle",
      nameGap: 5,
      nameTextStyle: {
        fontSize: 12,
        fontWeight: "bold",
      },
      gridIndex: i,
      boundaryGap: false,
      axisLabel: {
        show: i === domains.length - 1,
      },
      axisTick: { show: true },
      splitLine: { show: true },
      axisPointer: {
        label: {
          formatter: (params) => {
            const date = new Date(params.value);
            return `${date.getFullYear()}-${
              date.getMonth() + 1
            }-${date.getDate()}`;
          },
        },
      },
    });

    yAxes.push({
      type: "value",
      gridIndex: i,
      axisLabel: {
        formatter: (v) => kmbFormatter(v),
      },
      axisTick: { show: true },
      splitLine: { show: true },
      scale: !zeroBaseline,
      min: zeroBaseline ? 0 : undefined,
    });

    series.push({
      name: domain,
      type: "line",
      data: filtered.map((d) => [d.release_date, d.count_records]),
      xAxisIndex: i,
      yAxisIndex: i,
      symbol: "circle",
      symbolSize: 6,
      lineStyle: { width: 2 },
      emphasis: {
        focus: "series",
      },
    });
  });

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
      formatter: function (params) {
        const p = params[0];
        const date = new Date(p.value[0]);
        return `
                Release: ${date.toLocaleDateString()}<br/>
                # of Records: ${p.value[1].toLocaleString()}`;
      },
    },
    legend: { show: false },
    grid: grids,
    xAxis: xAxes,
    yAxis: yAxes,
    series: series,
  };
}
