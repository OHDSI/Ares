import { VEGA_SCHEMA } from "@/shared/config/links";

export function specDaysSupply(zeroBaseline = false, minMax = false) {
  return {
    $schema: VEGA_SCHEMA,
    height: 100,
    width: "container",
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
        mark: { type: "bar", size: 28, tooltip: {} },
        encoding: {
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
