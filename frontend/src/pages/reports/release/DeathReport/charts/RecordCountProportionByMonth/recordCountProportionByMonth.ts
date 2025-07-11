import { kmbFormatter } from "@/widgets/echarts/lib/formatters";

export default function getEChartsOptionRecordProportionByMonth({
  zeroBaseline = false,
  data = [],
}) {
  const parsedData = data
    .filter((d) => d.date && d.Y_PREVALENCE_1000PP !== null)
    .map((d) => ({
      date: new Date(d.date),
      value: +d.Y_PREVALENCE_1000PP,
    }));

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
      formatter: (params) => {
        const p = params[0];
        const date = new Date(p.data[0]);
        return `Date: ${date.toISOString().slice(0, 7)}<br/>RPP1000: ${
          p.data[1]
        }`;
      },
    },
    grid: {
      left: "2%",
      right: "2%",
      top: "2%",
      bottom: "10%",
      height: "80%",
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
      nameGap: 30,
      nameTextStyle: {
        fontSize: 14,
      },
      min: zeroBaseline ? 0 : "dataMin",
      axisLabel: {
        formatter: (v) => kmbFormatter(v),
      },
    },
    series: [
      {
        name: "RPP1000",
        type: "scatter",
        symbolSize: 6,
        data: parsedData.map((d) => [d.date, d.value]),
      },
    ],
    dataZoom: [
      {
        type: "slider",
        xAxisIndex: 0,
        bottom: 10,
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
