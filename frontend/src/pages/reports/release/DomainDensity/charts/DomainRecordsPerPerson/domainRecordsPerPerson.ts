import { kmbFormatter } from "@/shared/lib/formatters";
import { getCdmDomainColor } from "@/shared/lib/chartColors";

export default function getEChartsOptionDomainRecordsPerPerson({
  zeroBaseline = false,
  data = [],
}) {
  return {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
    },
    legend: {
      type: "scroll",
      top: 0,
    },
    grid: [
      {
        top: "10%",
        height: "60%",
        left: 45,
        right: "2%",
        bottom: "10%",
      },
    ],
    dataset: {
      source: data.map((d) => ({
        ...d,
        date: new Date(d.date),
      })),
    },
    xAxis: {
      type: "time",
      nameLocation: "middle",
      nameGap: 25,
    },
    yAxis: {
      type: "value",
      nameLocation: "middle",
      nameGap: 30,
      min: zeroBaseline ? 0 : "dataMin",
      axisLabel: {
        formatter: (v) => kmbFormatter(v),
      },
    },
    dataZoom: [
      {
        type: "inside",
        xAxisIndex: 0,
        start: 0,
        end: 100,
      },
      {
        type: "slider",
        xAxisIndex: 0,
        bottom: "10%",
      },
    ],
    series: [...new Set(data.map((d) => d.domain))].map((domain) => ({
      name: domain,
      type: "line",
      xAxisIndex: 0,
      yAxisIndex: 0,
      showSymbol: false,
      itemStyle: { color: getCdmDomainColor(domain) },
      lineStyle: { color: getCdmDomainColor(domain) },
      data: data
        .filter((d) => d.domain === domain)
        .map((d) => [d.date, d.records]),
    })),
  };
}
