import { formatComma } from "@/shared/lib/formatters";

export interface AttritionRow {
  ruleName: string;
  personCount: number;
  dropCount: number;
  dropPercent: string;
  retainPercent: string;
}

const BAR_H = 40;
const AXIS_PAD = 60;

export function attritionChartHeight(data: AttritionRow[]): string {
  return `${data.length * BAR_H + AXIS_PAD}px`;
}

export function attritionChartSpec({
  data,
  darkMode,
}: {
  data: AttritionRow[];
  darkMode: boolean;
}) {
  if (!data.length) return {};

  const maxCount = data[0]?.personCount ?? 1;
  const [r, g, b] = darkMode ? [99, 179, 237] : [49, 130, 206];

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter(params: { seriesIndex: number; dataIndex: number }[]) {
        const p = params.find((item) => item.seriesIndex === 1);
        if (!p) return "";
        const row = data[p.dataIndex];
        return [
          `<b>${row.ruleName}</b>`,
          `N: ${formatComma(row.personCount)}`,
          `Number Lost: ${formatComma(row.dropCount)} (${row.dropPercent})`,
          `Retained: ${row.retainPercent}`,
        ].join("<br/>");
      },
    },
    grid: {
      left: "2%",
      right: "2%",
      top: "2%",
      bottom: "2%",
      containLabel: true,
    },

    xAxis: { type: "value", max: maxCount, show: false },
    yAxis: {
      type: "category",
      data: data.map((row) => row.ruleName),
      inverse: true,
      axisLabel: { width: 220, overflow: "truncate", fontSize: 12 },
    },
    series: [
      {
        type: "bar",
        stack: "funnel",
        data: data.map((row) => (maxCount - row.personCount) / 2),
        itemStyle: { color: "transparent" },
        silent: true,
        emphasis: { disabled: true },
        label: { show: false },
      },
      {
        type: "bar",
        stack: "funnel",
        data: data.map((row) => row.personCount),
        barWidth: BAR_H - 8,
        label: {
          show: true,
          position: "inside",
          color: "#fff",
          fontSize: 11,
          formatter: (p: { dataIndex: number }) => {
            const row = data[p.dataIndex];
            return `N: ${formatComma(row.personCount)}   Lost: ${formatComma(
              row.dropCount
            )} (${row.dropPercent})`;
          },
        },
        itemStyle: {
          color: (p: { dataIndex: number }) => {
            const pct =
              maxCount > 0 ? data[p.dataIndex].personCount / maxCount : 1;
            const alpha = 0.4 + pct * 0.6;
            return `rgba(${r},${g},${b},${alpha})`;
          },
        },
      },
    ],
  };
}
