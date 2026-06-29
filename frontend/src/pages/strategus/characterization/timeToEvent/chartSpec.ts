import { PALETTE } from "@/shared/lib/chartColors";

const COLORS = PALETTE;

export function tteChartSpec({ data = [] }: { data: any[] }) {
  if (!data.length) return {};

  const facetKeys = [
    ...new Set(data.map((r) => `${r.timeScale}|${r.databaseName}`)),
  ];
  const fillGroups = [
    ...new Set(data.map((r) => `${r.outcomeType}-${r.targetOutcomeType}`)),
  ];
  const cols = Math.min(facetKeys.length, 3);
  const rowCount = Math.ceil(facetKeys.length / cols);
  const cellW = 100 / cols;
  const cellH = 100 / rowCount;

  const ROW_H = 300;
  const TITLE_H = 30;
  const AXIS_BOTTOM = 55;

  const grids = [],
    xAxes = [],
    yAxes = [],
    seriesList = [],
    titles = [];

  for (let fi = 0; fi < facetKeys.length; fi++) {
    const [ts, dbName] = facetKeys[fi].split("|");
    const col = fi % cols;
    const row = Math.floor(fi / cols);

    grids.push({
      left: `${col * cellW + 6}%`,
      top: row * ROW_H + TITLE_H + 10,
      width: `${cellW - 10}%`,
      height: ROW_H - TITLE_H - AXIS_BOTTOM,
    });
    xAxes.push({
      gridIndex: fi,
      type: "value",
      name: "Days",
      nameLocation: "center",
      nameGap: 25,
    });
    yAxes.push({
      gridIndex: fi,
      type: "value",
      name: "# Events",
      nameLocation: "center",
      nameGap: 35,
    });
    titles.push({
      text: `${dbName} - ${ts}`,
      left: `${col * cellW + cellW / 2 + 1}%`,
      top: row * ROW_H + 8,
      textAlign: "center",
      textStyle: { fontSize: 13, fontWeight: "normal" },
    });

    const facetData = data.filter(
      (r) => r.timeScale === ts && r.databaseName === dbName,
    );
    for (let gi = 0; gi < fillGroups.length; gi++) {
      const fg = fillGroups[gi];
      const points = facetData
        .filter((r) => `${r.outcomeType}-${r.targetOutcomeType}` === fg)
        .map((r) => [r.timeToEvent, r.numEvents]);
      seriesList.push({
        name: fg,
        type: "bar",
        xAxisIndex: fi,
        yAxisIndex: fi,
        stack: `stack-${fi}`,
        barWidth: 15,
        data: points,
        itemStyle: { color: COLORS[gi % COLORS.length] },
      });
    }
  }

  return {
    backgroundColor: "transparent",
    title: titles,
    tooltip: {
      trigger: "item",
      formatter: (p) =>
        !p.data
          ? ""
          : `${p.seriesName}<br/>Day ${p.data[0]}: ${p.data[1]} events`,
    },
    legend: { bottom: 0, data: fillGroups },
    grid: grids,
    xAxis: xAxes,
    yAxis: yAxes,
    series: seriesList,
  };
}

export function tteChartHeight(data: any[]): string {
  if (!data.length) return "400px";
  const facetKeys = [
    ...new Set(data.map((r) => `${r.timeScale}|${r.databaseName}`)),
  ];
  const cols = Math.min(facetKeys.length, 3);
  return `${Math.max(400, Math.ceil(facetKeys.length / cols) * 300)}px`;
}
