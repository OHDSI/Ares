import { PALETTE } from "@/shared/lib/chartColors";

const COL_LABEL_H = 30;
const ROW_LABEL_H = 22;
const GRID_H = 175;
const AXIS_H = 45;
const LEGEND_H = 50;
const ROW_H = ROW_LABEL_H + GRID_H + AXIS_H;

export function cohortIncidenceChartHeight(data: any[]): string {
  if (!data.length) return "400px";
  const rows = new Set(data.map((r) => r.databaseName)).size;
  return `${COL_LABEL_H + rows * ROW_H + LEGEND_H}px`;
}

export function cohortIncidenceChartSpec({
  data = [],
  plotXAxis = "Age",
  plotSexStratify = false,
  plotFixedY = true,
}: {
  data: any[];
  plotXAxis?: string;
  plotSexStratify?: boolean;
  plotFixedY?: boolean;
}) {
  if (!data.length) return {};

  const xField = plotXAxis === "Age" ? "ageGroupName" : "startYear";
  const facetCol = [
    ...new Set(
      data.map(
        (r) => `${r.outcomeName} (clean win ${r.cleanWindow}): ${r.tar}`,
      ),
    ),
  ];
  const facetRow = [...new Set(data.map((r) => r.databaseName))];
  const xCategories = [...new Set(data.map((r) => r[xField]))];
  const colorField = plotSexStratify ? "genderName" : "databaseName";
  const colorValues = [...new Set(data.map((r) => r[colorField]))];
  const colors = PALETTE;

  const cols = facetCol.length;
  const rows = facetRow.length;
  const cellW = 100 / Math.max(cols, 1);
  const grids = [],
    xAxes = [],
    yAxes = [],
    titles = [],
    seriesList = [];
  let gi = 0;
  const globalMax = Math.max(...data.map((r) => r.incidenceRateP100py), 1);
  const trunc = (s: string, n = 38) =>
    s.length > n ? s.slice(0, n - 1) + "…" : s;

  for (let ci = 0; ci < cols; ci++) {
    titles.push({
      text: trunc(facetCol[ci]),
      left: `${ci * cellW + cellW / 2 + 2}%`,
      top: 5,
      textAlign: "center",
      textStyle: { fontSize: 11, fontWeight: "normal" },
    });
  }

  for (let ri = 0; ri < rows; ri++) {
    const rowTop = COL_LABEL_H + ri * ROW_H;

    titles.push({
      text: facetRow[ri],
      left: "52%",
      top: rowTop - 6,
      textAlign: "center",
      textStyle: { fontSize: 11, fontWeight: "bold" },
    });

    for (let ci = 0; ci < cols; ci++) {
      const dbName = facetRow[ri];
      const facetLabel = facetCol[ci];

      grids.push({
        left: `${ci * cellW + 8}%`,
        top: rowTop + ROW_LABEL_H,
        width: `${cellW - 12}%`,
        height: GRID_H,
      });
      xAxes.push({
        gridIndex: gi,
        type: "category",
        data: xCategories,
        axisLabel: { rotate: 30, fontSize: 10 },
      });
      yAxes.push({
        gridIndex: gi,
        type: "value",
        max: plotFixedY ? Math.ceil(globalMax * 1.1) : undefined,
      });

      const facetData = data.filter(
        (r) =>
          r.databaseName === dbName &&
          `${r.outcomeName} (clean win ${r.cleanWindow}): ${r.tar}` ===
            facetLabel,
      );
      for (let vi = 0; vi < colorValues.length; vi++) {
        const cv = colorValues[vi];
        const points = xCategories.map((x) => {
          const row = facetData.find(
            (r) => r[xField] === x && r[colorField] === cv,
          );
          return row?.incidenceRateP100py ?? null;
        });
        seriesList.push({
          name: cv,
          type: "line",
          xAxisIndex: gi,
          yAxisIndex: gi,
          data: points,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { color: colors[vi % colors.length] },
          itemStyle: { color: colors[vi % colors.length] },
        });
      }
      gi++;
    }
  }

  return {
    backgroundColor: "transparent",
    title: titles,
    tooltip: {
      trigger: "item",
      formatter: (p) =>
        p.data != null ? `${p.seriesName}: ${p.data.toFixed(2)} /100py` : "",
    },
    legend: { bottom: 0, data: colorValues },
    grid: grids,
    xAxis: xAxes,
    yAxis: yAxes,
    series: seriesList,
  };
}
