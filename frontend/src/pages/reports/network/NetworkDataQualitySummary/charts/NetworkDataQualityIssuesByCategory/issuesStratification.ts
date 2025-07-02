export default function getEChartsIssueStratificationByCategory({
  zeroBaseline = false,
  data = [],
}) {
  const totalPerCategory = {};
  data.forEach((d) => {
    const category = d.CATEGORY;
    totalPerCategory[category] = (totalPerCategory[category] || 0) + 1;
  });

  const grouped = {};
  data.forEach((d) => {
    const cat = d.CATEGORY;
    const src = d.CDM_SOURCE_ABBREVIATION;
    if (!grouped[cat]) grouped[cat] = {};
    grouped[cat][src] = (grouped[cat][src] || 0) + 1;
  });

  const categories = Object.keys(grouped);
  const sources = Array.from(
    new Set(data.map((d) => d.CDM_SOURCE_ABBREVIATION))
  );

  const series = sources.map((src) => ({
    name: src,
    type: "bar",
    stack: "total",
    label: { show: false },
    data: categories.map((cat) => {
      const count = grouped[cat][src] || 0;
      const total = totalPerCategory[cat] || 1;
      return {
        value: count,
        CATEGORY: cat,
        CDM_SOURCE_ABBREVIATION: src,
        CHECK_COUNT: count,
        PERCENT: count / total,
      };
    }),
  }));

  return {
    tooltip: {
      trigger: "item",
      formatter: ({ seriesName, data }) =>
        `Category: ${data.CATEGORY}<br/>Source: ${seriesName}<br/>` +
        `Number of Issues: ${data.CHECK_COUNT}<br/>` +
        `Percent: ${(data.PERCENT * 100).toFixed(2)}%`,
    },
    legend: {
      orient: "horizontal",
      top: 0,
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
      data: categories,
    },
    series,
  };
}
