import { kmbFormatter } from "@/shared/lib/formatters";
import {
  compareSex,
  getGenderColor,
  sexKey,
  sexLabel,
} from "@/shared/lib/chartColors";

export default function getEChartsOptionAgeSex({
  zeroBaseline = false,
  data = [],
}) {
  const rows = data
    .map((d) => ({
      sex: sexKey(d.CONCEPT_NAME),
      age: +d.AGE,
      count: +d.COUNT_VALUE,
    }))
    .filter((d) => d.age >= 0 && d.age <= 100);

  const ages = [...new Set(rows.map((d) => d.age))].sort((a, b) => a - b);

  const groups = new Map<string, Map<number, number>>();
  rows.forEach(({ sex, age, count }) => {
    if (!groups.has(sex)) groups.set(sex, new Map());
    const counts = groups.get(sex);
    counts.set(age, (counts.get(age) ?? 0) + count);
  });

  const series = [...groups.keys()].sort(compareSex).map((key) => {
    const counts = groups.get(key);
    const label = sexLabel(key);
    return {
      name: label,
      type: "bar",
      data: ages.map((age) => counts.get(age) ?? null),
      itemStyle: { color: getGenderColor(label) },
    };
  });

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      top: 0,
      data: series.map((s) => s.name),
    },
    grid: {
      left: 50,
      right: 20,
      bottom: "10%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: ages,
      name: "Age at First Observation",
      nameLocation: "middle",
      nameGap: 30,
      nameTextStyle: {
        fontSize: 14,
      },
    },
    yAxis: {
      type: "value",
      name: "Number of People",
      nameLocation: "middle",
      nameRotate: 90,
      nameGap: 50,
      nameTextStyle: {
        fontSize: 14,
      },
      min: zeroBaseline ? 0 : "dataMin",
      axisLabel: {
        formatter: (v) => kmbFormatter(v),
      },
    },
    series,
  };
}
