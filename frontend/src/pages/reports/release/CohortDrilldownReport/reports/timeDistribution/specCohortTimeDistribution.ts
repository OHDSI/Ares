import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specCohortTimeDistribution(
  zeroBaseline = false,
  minMax = false,
  labelColor
): TopLevelSpec {
  return {
    $schema: VEGA_SCHEMA,
    data: { name: "conceptData" },
    layer: [
      {
        mark: { type: "rule" },
        encoding: {
          x: {
            field: minMax ? "min_value" : "p_10_value",
            type: "quantitative",
            scale: { zero: false },
            title: "Time in Days",
          },
          x2: { field: minMax ? "max_value" : "p_90_value" },
        },
      },
      {
        mark: { type: "bar", size: 28, tooltip: true },
        encoding: {
          tooltip: [
            { field: "min_value", title: "MIN_VALUE" },
            { field: "p_10_value", title: "P10_VALUE" },
            { field: "p_25_value", title: "P25_VALUE" },
            { field: "median_value", title: "MEDIAN_VALUE" },
            { field: "p_75_value", title: "P75_VALUE" },
            { field: "p_90_value", title: "P90_VALUE" },
            { field: "max_value", title: "MAX_VALUE" },
          ],
          x: { field: "p_25_value", type: "quantitative" },
          x2: { field: "p_75_value" },
        },
      },
      {
        mark: { type: "tick", color: "white", size: 28 },
        encoding: {
          x: { field: "median_value", type: "quantitative" },
        },
      },
    ],
    height: 100,
    width: "container",
  };
}
