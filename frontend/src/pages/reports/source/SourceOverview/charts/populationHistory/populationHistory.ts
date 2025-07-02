export default function getEChartsPopulationByRelease({
  zeroBaseline = false,
  data = [],
}) {
  const seriesData = data
    .map((d) => [d.release_name, +d.count_person])
    .sort((a, b) => new Date(a[0]) - new Date(b[0]));

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          show: true,
          formatter: (params) => {
            const date = new Date(params.value);
            const yyyy = date.getUTCFullYear();
            const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
            const dd = String(date.getUTCDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}`;
          },
        },
      },
      formatter: (params) => {
        const item = params[0];
        const [dt, pop] = item.value;
        const date = new Date(dt);
        const yyyy = date.getUTCFullYear();
        const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(date.getUTCDate()).padStart(2, "0");
        return `Release date: ${yyyy}-${mm}-${dd}<br/>Population: ${pop.toLocaleString()}`;
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
      name: "People",
      nameLocation: "middle",
      nameRotate: 90,
      nameGap: 40,
      splitLine: { show: true },
      axisTick: { show: true },
      min: zeroBaseline ? 0 : "dataMin",
    },
    grid: {
      left: "4%",
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
