export default function getEChartsIssueStratificationByTable({
  zeroBaseline = false,
  data = [],
}) {
  const totalPerTable = {};
  data.forEach((d) => {
    const table = d.CDM_TABLE_NAME;
    totalPerTable[table] = (totalPerTable[table] || 0) + 1;
  });

  const grouped = {};
  data.forEach((d) => {
    const table = d.CDM_TABLE_NAME;
    const source = d.CDM_SOURCE_ABBREVIATION;
    if (!grouped[table]) grouped[table] = {};
    grouped[table][source] = (grouped[table][source] || 0) + 1;
  });

  const tables = Object.keys(grouped);
  const sources = Array.from(
    new Set(data.map((d) => d.CDM_SOURCE_ABBREVIATION))
  );

  const series = sources.map((source) => ({
    name: source,
    type: "bar",
    stack: "total",
    label: { show: false },
    data: tables.map((table) => {
      const count = grouped[table][source] || 0;
      const total = totalPerTable[table] || 1;
      return {
        value: count,
        CDM_TABLE_NAME: table,
        CDM_SOURCE_ABBREVIATION: source,
        CHECK_COUNT: count,
        PERCENT: count / total,
      };
    }),
  }));

  return {
    tooltip: {
      trigger: "item",
      formatter: ({ seriesName, data }) =>
        `Table: ${data.CDM_TABLE_NAME}<br/>Source: ${seriesName}<br/>` +
        `Number of Issues: ${data.CHECK_COUNT}<br/>` +
        `Percent: ${(data.PERCENT * 100).toFixed(2)}%`,
    },
    legend: {
      orient: "horizontal",
      top: 0,
      type: "scroll",
    },
    grid: {
      left: "2%",
      right: "2%",
      bottom: "10%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      name: "Number of Issues",
      nameLocation: "middle",
      min: zeroBaseline ? 0 : undefined,
      nameGap: 30,
      nameTextStyle: {
        fontSize: 14,
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: "category",
      data: tables,
      axisLabel: {
        fontSize: 14,
      },
    },
    series,
  };
}
