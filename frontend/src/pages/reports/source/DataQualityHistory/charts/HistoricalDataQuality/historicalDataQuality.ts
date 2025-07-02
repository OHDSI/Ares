export default function getEChartsDataQualityResults({
  zeroBaseline = false,
  data = [],
}) {
  const seriesData = data.map((d) => [d.cdm_release_date, d.count_failed]);

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "line",
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
    },
    xAxis: {
      type: "time",
      name: "CDM Release Date",
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
      name: "Checks Failed",
      nameLocation: "middle",
      nameRotate: 90,
      nameGap: 40,
      splitLine: { show: true },
      axisTick: { show: true },
      ...(zeroBaseline ? { min: 0 } : {}),
    },
    grid: {
      left: "2%",
      right: "2%",
      bottom: "7%",
      top: "5%",
      containLabel: true,
    },
    series: [
      {
        name: "Checks Failed",
        type: "line",
        data: seriesData,
        showSymbol: false,
        hoverAnimation: true,
        symbol: "circle",
        symbolSize: 6,
      },
    ],
  };
}
