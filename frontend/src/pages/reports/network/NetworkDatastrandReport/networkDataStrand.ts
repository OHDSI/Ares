export default function getEChartsNetworkDatastrand({ data = [] }) {
  const allowed = [
    "condition occurrence",
    "drug exposure",
    "measurement",
    "observation",
    "procedure occurrence",
    "visit occurrence",
    "device exposure",
  ];
  const filtered = data.filter((d) => allowed.includes(d.domain.toLowerCase()));

  const agg = {};
  const totals = {};
  filtered.forEach((d) => {
    const rel = d.cdm_source_abbreviation;
    const dom = d.domain;
    const cnt = +d.count_records;
    if (!agg[rel]) {
      agg[rel] = {};
      totals[rel] = 0;
    }
    agg[rel][dom] = (agg[rel][dom] || 0) + cnt;
    totals[rel] += cnt;
  });

  const releaseKeys = Object.keys(agg).sort();
  const domainSet = new Set();
  releaseKeys.forEach((rel) => {
    Object.keys(agg[rel]).forEach((dom) => domainSet.add(dom));
  });
  const domains = Array.from(domainSet);

  const globalCount = {};
  domains.forEach((dom) => {
    globalCount[dom] = 0;
    releaseKeys.forEach((rel) => {
      globalCount[dom] += agg[rel][dom] || 0;
    });
  });
  domains.sort((a, b) => globalCount[b] - globalCount[a]);

  const series = domains.map((dom) => {
    const dataPoints = releaseKeys.map((rel) => {
      const cnt = agg[rel][dom] || 0;
      const pct = totals[rel] ? cnt / totals[rel] : 0;
      return {
        value: pct,
        count: cnt,
        release: rel,
      };
    });
    return {
      name: dom,
      type: "bar",
      stack: "total",
      label: { show: false },
      data: dataPoints,
    };
  });

  return {
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        const dom = params.seriesName;
        const rel = params.data.release;
        const cnt = params.data.count;
        const pct = params.value;
        return (
          `Data Source: ${rel}<br/>` +
          `Domain: ${dom}<br/>` +
          `Percent: ${(pct * 100).toFixed(2)}%<br/>` +
          `Number of Records: ${cnt.toLocaleString()}`
        );
      },
    },
    legend: {
      data: domains,
      orient: "horizontal",
      selectedMode: "multiple",
      type: "scroll",
    },
    grid: {
      left: "1%",
      right: "1%",
      bottom: 15,
      top: 30,
      containLabel: true,
    },
    xAxis: {
      type: "value",
      name: "% of Records",
      axisLabel: {
        formatter: (v) => `${(v * 100).toFixed(0)}%`,
      },
      splitLine: { show: false },
      min: 0,
      max: 1,
    },
    yAxis: {
      type: "category",
      data: releaseKeys,
      inverse: true,
    },
    series,
  };
}
