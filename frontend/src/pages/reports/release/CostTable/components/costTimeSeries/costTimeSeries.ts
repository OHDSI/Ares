import { kmbFormatter } from "@/widgets/echarts/lib/formatters";

export default function getEChartsOptionCostTimeseries({
  zeroBaseline = false,
  data = [],
}) {
  const domainIds = [...new Set(data.map((d) => d.DOMAIN_ID))];

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
      formatter: (params) => {
        const lines = params.map((p) => {
          const cost = Number(p.data[1]).toLocaleString();
          return `${p.marker}${p.seriesName}: ${cost}`;
        });
        const date = new Date(params[0].data[0]).toISOString().split("T")[0];
        return `Date: ${date}<br/>${lines.join("<br/>")}`;
      },
    },
    legend: {
      top: 0,
      type: "scroll",
      title: {
        text: "Domain",
      },
    },
    grid: {
      top: "10%",
      bottom: "10%",
      left: 50,
      right: 15,
    },
    dataset: {
      source: data.map((d) => ({
        ...d,
        MONTH_YEAR: new Date(d.MONTH_YEAR),
        TOTAL_COST: +d.TOTAL_COST,
      })),
    },
    xAxis: {
      type: "time",
      name: "Date",
      nameLocation: "middle",
      nameGap: 30,
      axisLabel: {
        formatter: (value) => {
          const date = new Date(value);
          return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1)
            .toString()
            .padStart(2, "0")}`;
        },
      },
    },
    yAxis: {
      type: "value",
      min: zeroBaseline ? 0 : "dataMin",
      axisLabel: {
        formatter: (v) => kmbFormatter(v),
      },
    },
    series: domainIds.map((domainId) => ({
      name: domainId,
      type: "line",
      showSymbol: true,
      symbolSize: 6,
      data: data
        .filter((d) => d.DOMAIN_ID === domainId)
        .map((d) => [new Date(d.MONTH_YEAR), +d.TOTAL_COST]),
    })),
  };
}
