export function cohortIncidenceChartHeight(data: any[]): string {
  if (!data.length) return "400px";
  const rows = new Set(data.map((r) => r.databaseName)).size;
  return `${Math.max(400, rows * 280)}px`;
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
      data.map((r) => `${r.outcomeName} (clean win ${r.cleanWindow}): ${r.tar}`)
    ),
  ];
  const facetRow = [...new Set(data.map((r) => r.databaseName))];
  const xCategories = [...new Set(data.map((r) => r[xField]))];
  const colorField = plotSexStratify ? "genderName" : "databaseName";
  const colorValues = [...new Set(data.map((r) => r[colorField]))];
  const colors = [
    "#4e79a7",
    "#f28e2b",
    "#e15759",
    "#76b7b2",
    "#59a14f",
    "#edc948",
    "#b07aa1",
    "#ff9da7",
  ];

  const cols = facetCol.length;
  const rows = facetRow.length;
  const cellW = 100 / Math.max(cols, 1);
  const cellH = 100 / Math.max(rows, 1);
  const grids = [],
    xAxes = [],
    yAxes = [],
    titles = [],
    seriesList = [];
  let gi = 0;
  const globalMax = Math.max(...data.map((r) => r.incidenceRateP100py), 1);

  for (let ri = 0; ri < rows; ri++) {
    for (let ci = 0; ci < cols; ci++) {
      const dbName = facetRow[ri];
      const facetLabel = facetCol[ci];

      grids.push({
        left: `${ci * cellW + 8}%`,
        top: `${ri * cellH + 8}%`,
        width: `${cellW - 12}%`,
        height: `${cellH - 18}%`,
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
        name: ri === 0 && ci === 0 ? "Rate /100py" : "",
        max: plotFixedY ? Math.ceil(globalMax * 1.1) : undefined,
      });
      titles.push({
        text: ri === 0 ? facetLabel : "",
        subtext: ci === 0 ? dbName : "",
        left: `${ci * cellW + cellW / 2 + 2}%`,
        top: `${ri * cellH}%`,
        textAlign: "center",
        textStyle: { fontSize: 11, fontWeight: "normal" },
        subtextStyle: { fontSize: 11, fontWeight: "bold" },
      });

      const facetData = data.filter(
        (r) =>
          r.databaseName === dbName &&
          `${r.outcomeName} (clean win ${r.cleanWindow}): ${r.tar}` ===
            facetLabel
      );
      for (let vi = 0; vi < colorValues.length; vi++) {
        const cv = colorValues[vi];
        const points = xCategories.map((x) => {
          const row = facetData.find(
            (r) => r[xField] === x && r[colorField] === cv
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
    title: [
      {
        text: "Incidence Rates",
        left: "center",
        top: 0,
        textStyle: { fontSize: 14 },
      },
      ...titles,
    ],
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
