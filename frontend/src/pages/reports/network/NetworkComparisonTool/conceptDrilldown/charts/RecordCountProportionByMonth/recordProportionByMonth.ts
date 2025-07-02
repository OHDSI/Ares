export default function getEChartsOptionRecordProportionByMonthNetwork({
  zeroBaseline = false,
  data = [],
}) {
  const grouped = {};
  for (const d of data) {
    if (d.date && d.Y_PREVALENCE_1000PP !== null) {
      const key = d.SOURCE || "Unknown";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({
        date: new Date(d.date),
        value: +d.Y_PREVALENCE_1000PP,
      });
    }
  }

  const sources = Object.keys(grouped);

  return {
    legend: {
      top: 10,
      data: sources,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
      formatter: (params) => {
        const lines = params.map((p) => {
          const date = new Date(p.data[0]);
          return `<b>${p.seriesName}</b><br/>Date: ${date
            .toISOString()
            .slice(0, 7)}<br/>RPP1000: ${p.data[1]}`;
        });
        return lines.join("<br/><br/>");
      },
    },
    grid: {
      left: 60,
      right: 30,
      top: 60,
      bottom: 80,
    },
    xAxis: {
      type: "time",
      boundaryGap: false,
      axisLabel: { formatter: "{yyyy}-{MM}" },
    },
    yAxis: {
      type: "value",
      name: "Record Proportion per 1000",
      nameLocation: "middle",
      nameGap: 35,
      nameTextStyle: {
        fontSize: 14,
      },
      min: zeroBaseline ? 0 : "dataMin",
    },
    series: sources.map((source) => ({
      name: source,
      type: "scatter",
      symbolSize: 6,
      data: grouped[source].map((d) => [d.date, d.value]),
    })),
    dataZoom: [
      {
        type: "slider",
        xAxisIndex: 0,
        bottom: 30,
        height: 30,
        start: 0,
        end: 100,
      },
      {
        type: "inside",
        xAxisIndex: 0,
      },
    ],
  };
}
