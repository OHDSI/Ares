import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specDaysSupply(
  zeroBaseline = false,
  minMax = false
): TopLevelSpec {
  return {
    $schema: VEGA_SCHEMA,
    height: 100,
    width: "container",
    data: { name: "conceptData" },

    layer: [
      {
        mark: { type: "rule" },
        encoding: {
          x: {
            field: minMax ? "MIN_VALUE" : "P10_VALUE",
            type: "quantitative",
            scale: { zero: false },
            title: "Days Supply",
          },
          x2: { field: minMax ? "MAX_VALUE" : "P90_VALUE" },
        },
      },
      {
        mark: { type: "bar", size: 28, tooltip: true },
        encoding: {
          tooltip: [
            { field: "MIN_VALUE", title: "MIN_VALUE" },
            { field: "P10_VALUE", title: "P10_VALUE" },
            { field: "P25_VALUE", title: "P25_VALUE" },
            { field: "MEDIAN_VALUE", title: "MEDIAN_VALUE" },
            { field: "P75_VALUE", title: "P75_VALUE" },
            { field: "P90_VALUE", title: "P90_VALUE" },
            { field: "MAX_VALUE", title: "MAX_VALUE" },
          ],
          x: { field: "P25_VALUE", type: "quantitative" },
          x2: { field: "P75_VALUE" },
        },
      },
      {
        mark: { type: "tick", color: "white", size: 28 },
        encoding: {
          x: { field: "MEDIAN_VALUE", type: "quantitative" },
        },
      },
    ],
  };
}
