export default function getEChartsDataQualityResultsByDomain({
  zeroBaseline = false,
  data = [],
}) {
  const agg = {};
  data.forEach((d) => {
    const domain = d.cdm_table_name;
    const date = d.cdm_release_date;
    const count = +d.count_value;
    if (!agg[domain]) agg[domain] = {};
    if (!agg[domain][date]) agg[domain][date] = 0;
    agg[domain][date] += count;
  });

  const series = Object.keys(agg).map((domain) => {
    const dateMap = agg[domain];
    const entries = Object.keys(dateMap)
      .map((dt) => [dt, dateMap[dt]])
      .sort((a, b) => new Date(a[0]) - new Date(b[0]));
    return {
      name: domain,
      type: "line",
      data: entries,
      showSymbol: true,
      symbol: "circle",
      symbolSize: 4,
    };
  });

  const domains = Object.keys(agg);

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "line",
        label: {
          show: true,
        },
      },
    },
    legend: {
      data: domains,
      orient: "horizontal",
      selectedMode: "multiple",
    },
    grid: {
      left: "2%",
      right: "2%",
      bottom: "7%",
      top: "20%",
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
