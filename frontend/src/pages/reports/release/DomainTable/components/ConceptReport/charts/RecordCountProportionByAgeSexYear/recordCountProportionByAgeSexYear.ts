import { kmbFormatter } from "@/widgets/echarts/lib/formatters";

export default function getEChartsOptionRecordProportionByAgeSexYear({
  zeroBaseline = false,
  data = [],
}) {
  const trellises = [...new Set(data.map((d) => d?.TRELLIS_NAME))];
  const series = [];
  const grids = [];
  const xAxes = [];
  const yAxes = [];
  const trellisToIndex = {};

  trellises.forEach((trellis, i) => {
    const filtered = data.filter((d) => d?.TRELLIS_NAME === trellis);
    const sexGroups = [...new Set(filtered.map((d) => d?.SERIES_NAME))];
    const gridTop = 20 + i * 100;

    trellisToIndex[trellis] = i;

    grids.push({
      top: `${gridTop}px`,
      height: 60,
      left: 35,
      right: 35,
      bottom: i === trellises.length - 1 ? 40 : 0,
    });

    xAxes.push({
      type: "category",
      name: trellis,
      nameLocation: "middle",
      nameGap: 20,
      nameTextStyle: {
        fontSize: 12,
        fontWeight: "bold",
      },
      gridIndex: i,
      boundaryGap: false,
      axisLabel: {
        show: true,
      },
      axisTick: {
        show: false,
      },
      axisLine: {
        show: i === trellises.length - 1,
      },
      splitLine: { show: true },
    });

    yAxes.push({
      type: "value",
      gridIndex: i,
      axisTick: { show: true },
      splitLine: { show: true },
      scale: !zeroBaseline,
      min: zeroBaseline ? 0 : undefined,
      axisLabel: {
        formatter: (v) => kmbFormatter(v),
      },
    });

    sexGroups.forEach((sex) => {
      const lineData = filtered
        .filter((d) => d.SERIES_NAME === sex)
        .sort((a, b) => a.X_CALENDAR_YEAR - b.X_CALENDAR_YEAR)
        .map((d) => [d.X_CALENDAR_YEAR.toString(), d.Y_PREVALENCE_1000PP]);

      series.push({
        name: sex,
        type: "line",
        data: lineData,
        xAxisIndex: i,
        yAxisIndex: i,
        symbol: "circle",
        symbolSize: 5,
        lineStyle: { width: 1.5 },
        tooltip: {
          valueFormatter: (val) => val.toFixed(3),
        },
      });
    });
  });

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "line",
        snap: true,
      },
      formatter: function (params) {
        const year = params[0]?.axisValue;
        const lines = params
          .map(
            (p) =>
              `${p.marker}${p.seriesName}: ${p.data[1].toFixed(3)} per 1000`
          )
          .join("<br/>");
        const trellis = Object.keys(trellisToIndex).find(
          (k) => trellisToIndex[k] === params[0].axisIndex
        );
        return `Year: ${year}<br/>${lines}<br/>Age Decile: ${trellis}`;
      },
    },
    legend: {
      orient: "horizontal",
      type: "scroll",
    },
    grid: grids,
    xAxis: xAxes,
    yAxis: yAxes,
    series: series,
  };
}
