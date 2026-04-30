export function failsChartSpec({ data = [] }: { data: any[] }) {
  if (!data.length) return {};

  const sorted = [...data].sort(
    (a, b) =>
      a.dechallengeExposureStartDateOffset -
        b.dechallengeExposureStartDateOffset ||
      a.dechallengeOutcomeStartDateOffset -
        b.dechallengeOutcomeStartDateOffset ||
      (a.rechallengeExposureStartDateOffset ?? 0) -
        (b.rechallengeExposureStartDateOffset ?? 0)
  );

  const persons = [...new Set(sorted.map((r) => r.personKey))];
  const pidMap = new Map(persons.map((pk, i) => [pk, persons.length - i]));

  const dechalExposure = [],
    rechalExposure = [],
    dechalOutcome = [],
    rechalOutcome = [];
  const dechalExposureStarts = [],
    rechalExposureStarts = [];

  for (const r of sorted) {
    const y = pidMap.get(r.personKey);
    dechalExposure.push(
      [r.dechallengeExposureStartDateOffset, y, r.dechallengeExposureNumber],
      [r.dechallengeExposureEndDateOffset, y, r.dechallengeExposureNumber],
      [null, null, null]
    );
    dechalExposureStarts.push([
      r.dechallengeExposureStartDateOffset,
      y,
      r.dechallengeExposureNumber,
    ]);
    if (r.dechallengeOutcomeStartDateOffset != null)
      dechalOutcome.push([
        r.dechallengeOutcomeStartDateOffset,
        y,
        r.dechallengeOutcomeNumber,
      ]);
    if (r.rechallengeExposureStartDateOffset != null) {
      rechalExposure.push(
        [r.rechallengeExposureStartDateOffset, y, r.rechallengeExposureNumber],
        [r.rechallengeExposureEndDateOffset, y, r.rechallengeExposureNumber],
        [null, null, null]
      );
      rechalExposureStarts.push([
        r.rechallengeExposureStartDateOffset,
        y,
        r.rechallengeExposureNumber,
      ]);
    }
    if (r.rechallengeOutcomeStartDateOffset != null)
      rechalOutcome.push([
        r.rechallengeOutcomeStartDateOffset,
        y,
        r.rechallengeOutcomeNumber,
      ]);
  }

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      formatter: (p) => {
        if (!p.data || p.data[0] == null) return "";
        const person = persons.length - p.data[1] + 1;
        const eventNum = p.data[2] != null ? `, Event: ${p.data[2]}` : "";
        return `Day: ${p.data[0]}, Person: ${person}${eventNum}`;
      },
    },
    grid: { bottom: 80 },
    dataZoom: [
      { type: "inside", xAxisIndex: 0, filterMode: "none" },
      { type: "slider", xAxisIndex: 0, filterMode: "none", bottom: 8 },
    ],
    xAxis: {
      name: "Time from first exposure",
      nameLocation: "center",
      nameGap: 30,
      type: "value",
    },
    yAxis: {
      name: "Each line is one person",
      nameLocation: "center",
      nameGap: 40,
      type: "value",
      min: 0,
      max: persons.length + 1,
      axisLabel: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    legend: {
      top: 0,
      data: [
        "Dechallenge Exposure",
        "Rechallenge Exposure",
        "Dechallenge Outcome",
        "Rechallenge Outcome",
      ],
    },
    series: [
      {
        name: "Dechallenge Exposure",
        type: "line",
        data: dechalExposure,
        symbol: "none",
        lineStyle: { width: 4, color: "#4169E1" },
        connectNulls: false,
      },
      {
        name: "Rechallenge Exposure",
        type: "line",
        data: rechalExposure,
        symbol: "none",
        lineStyle: { width: 4, color: "#191970" },
        connectNulls: false,
      },
      {
        name: "Dechallenge Outcome",
        type: "scatter",
        data: dechalOutcome,
        symbol: "diamond",
        symbolSize: 10,
        itemStyle: { color: "#FF8C00" },
        label: {
          show: true,
          formatter: (p) => String(p.data[2]),
          color: "#FF8C00",
          position: [6, -10],
          fontSize: 11,
        },
      },
      {
        name: "Rechallenge Outcome",
        type: "scatter",
        data: rechalOutcome,
        symbol: "diamond",
        symbolSize: 10,
        itemStyle: { color: "#FF4500" },
        label: {
          show: true,
          formatter: (p) => String(p.data[2]),
          color: "#FF4500",
          position: [6, -10],
          fontSize: 11,
        },
      },
      {
        name: "Dechallenge Exposure",
        type: "scatter",
        data: dechalExposureStarts,
        symbol: "circle",
        symbolSize: 0,
        silent: true,
        legendHoverLink: false,
        showInLegend: false,
        label: {
          show: true,
          formatter: (p) => String(p.data[2]),
          color: "#4169E1",
          position: [-4, -10],
          fontSize: 11,
          align: "right",
        },
      },
      {
        name: "Rechallenge Exposure",
        type: "scatter",
        data: rechalExposureStarts,
        symbol: "circle",
        symbolSize: 0,
        silent: true,
        legendHoverLink: false,
        showInLegend: false,
        label: {
          show: true,
          formatter: (p) => String(p.data[2]),
          color: "#7B9CD6",
          position: [-4, -10],
          fontSize: 11,
          align: "right",
        },
      },
    ],
  };
}
