import { kmbFormatter } from "@/shared/lib/formatters";

export default function getEChartsComparisonDeathRecordProportionByMonth({
  zeroBaseline = false,
  data = [],
}) {
  const grouped = {};
  data.forEach((d) => {
    if (
      !d.date ||
      d.Y_PREVALENCE_1000PP === null ||
      d.Y_PREVALENCE_1000PP === undefined
    ) {
      return;
    }
    const source = d.DATA_SOURCE_KEY;
    if (!grouped[source]) grouped[source] = [];
    grouped[source].push({ x: new Date(d.date), y: +d.Y_PREVALENCE_1000PP });
  });

  Object.values(grouped).forEach((arr: any[]) => arr.sort((a, b) => a.x - b.x));

  const series = Object.entries(grouped).map(
    ([source, values]: [string, any[]]) => ({
      name: source,
      type: "line",
      showSymbol: false,
      emphasis: { focus: "series" },
      data: values.map((d) => [d.x, d.y]),
    }),
  );

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      formatter: (params) => {
        const date = new Date(params[0].value[0]);
        return (
          `Date: ${date.toISOString().slice(0, 7)}<br/>` +
          params
            .map((p) => `${p.marker}${p.seriesName}: ${p.value[1]}`)
            .join("<br/>")
        );
      },
    },
    legend: { top: 0, type: "scroll" },
    grid: {
      left: 50,
      right: "2%",
      bottom: "15%",
      top: "10%",
      containLabel: true,
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
      nameGap: 50,
      min: zeroBaseline ? 0 : "dataMin",
      axisLabel: { formatter: (v) => kmbFormatter(v) },
    },
    series,
    dataZoom: [
      {
        type: "slider",
        xAxisIndex: 0,
        bottom: 10,
        height: 24,
        start: 0,
        end: 100,
      },
      { type: "inside", xAxisIndex: 0 },
    ],
  };
}
