import { kmbFormatter } from "@/widgets/echarts/lib/formatters";

export default function getEChartsIssuesHistory({
  zeroBaseline = false,
  data = [],
}) {
  const seriesData = data
    .map((d) => [d.release_name, +d.count_data_quality_issues])
    .sort((a, b) => new Date(a[0]) - new Date(b[0]));

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          show: true,
        },
      },
      formatter: (params) => {
        const item = params[0];
        const [dt, pop] = item.value;
        const date = new Date(dt);
        const yyyy = date.getUTCFullYear();
        const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(date.getUTCDate()).padStart(2, "0");
        return `Release date: ${yyyy}-${mm}-${dd}<br/>Issues: ${pop.toLocaleString()}`;
      },
    },
    xAxis: {
      type: "time",
      name: "Release",
      nameLocation: "middle",
      nameGap: 30,
      axisLabel: {
        formatter: (value) => {
          const date = new Date(value);
          const yyyy = date.getUTCFullYear();
          const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
          const dd = String(date.getUTCDate()).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}`;
        },
      },
      splitLine: { show: true },
      axisTick: { show: true },
    },
    yAxis: {
      type: "value",
      name: "# Issues",
      nameLocation: "middle",
      nameRotate: 90,
      nameGap: 50,
      splitLine: { show: true },
      axisTick: { show: true },
      min: zeroBaseline ? 0 : "dataMin",
      axisLabel: {
        formatter: (v) => kmbFormatter(v),
      },
    },
    grid: {
      left: 40,
      right: "1%",
      bottom: "7%",
      top: "5%",
      containLabel: true,
    },
    series: [
      {
        name: "Population",
        type: "line",
        data: seriesData,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 1 },
      },
    ],
  };
}
