export default function getEChartsDataQualityResultsByCategory({
  zeroBaseline = false,
  data = [],
}) {
  const agg = {};
  data.forEach((d) => {
    const cat = d.category;
    const date = d.cdm_release_date;
    const count = +d.count_value;
    if (!agg[cat]) agg[cat] = {};
    if (!agg[cat][date]) agg[cat][date] = 0;
    agg[cat][date] += count;
  });

  const series = Object.keys(agg).map((cat) => {
    const dateMap = agg[cat];
    const entries = Object.keys(dateMap)
      .map((dt) => [dt, dateMap[dt]])
      .sort((a, b) => new Date(a[0]) - new Date(b[0]));
    return {
      name: cat,
      type: "line",
      data: entries,
      showSymbol: true,
      symbol: "circle",
      symbolSize: 4,
    };
  });

  const categories = Object.keys(agg);

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
    legend: {
      data: categories,
      orient: "horizontal",
      selectedMode: "multiple",
    },
    grid: {
      left: "2%",
      right: "2%",
      bottom: "10%",
      top: "10%",
      containLabel: true,
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
    series,
  };
}
