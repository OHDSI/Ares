import { formatComma, kmbFormatter } from "@/shared/lib/formatters";

export default function getEChartsComparisonBirthYear({
  zeroBaseline = false,
  data = [],
}) {
  const grouped = {};
  data.forEach((d) => {
    const source = d.DATA_SOURCE_KEY;
    if (!grouped[source]) grouped[source] = [];
    const year = d.YEAR instanceof Date ? d.YEAR : new Date(+d.YEAR, 0);
    grouped[source].push({ x: year, y: +d.COUNT_PERSON });
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
      formatter: (params) => {
        const year = new Date(params[0].value[0]).getFullYear();
        return (
          `Year: ${year}<br/>` +
          params
            .map(
              (p) => `${p.marker}${p.seriesName}: ${formatComma(p.value[1])}`,
            )
            .join("<br/>")
        );
      },
    },
    legend: { top: 0, type: "scroll" },
    grid: {
      left: 50,
      right: "2%",
      bottom: "10%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "time",
      name: "Year of Birth",
      nameLocation: "middle",
      nameGap: 25,
      boundaryGap: false,
      axisLabel: { formatter: "{yyyy}" },
    },
    yAxis: {
      type: "value",
      name: "# of People",
      nameLocation: "middle",
      nameGap: 50,
      min: zeroBaseline ? 0 : undefined,
      axisLabel: { formatter: (v) => kmbFormatter(v) },
    },
    series,
  };
}
