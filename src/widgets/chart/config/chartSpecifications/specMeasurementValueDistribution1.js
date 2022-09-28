import { VEGA_SCHEMA } from "@/shared/config/links";

export function specMeasurementValueDistribution1(
  zeroBaseline = false,
  minMax = false
) {
  return {
    $schema: VEGA_SCHEMA,
    height: { step: 20 },
    width: "container",
    encoding: {
      y: {
        field: "SOURCE_UNIT_KEY",
        type: "nominal",
        title: null,
        scale: {
          zero: zeroBaseline,
        },
      },
    },
    layer: [
      {
        mark: { type: "rule" },
        encoding: {
          x: {
            field: minMax ? "MIN_VALUE" : "P10_VALUE",
            type: "quantitative",
            scale: { zero: false },
            title: null,
          },
          x2: { field: minMax ? "MAX_VALUE" : "P90_VALUE" },
        },
      },
      {
        mark: { type: "bar", size: 14, tooltip: {} },
        encoding: {
          x: { field: "P25_VALUE", type: "quantitative" },
          x2: { field: "P75_VALUE" },
          color: {
            field: "SOURCE_UNIT_KEY",
            type: "nominal",
            legend: null,
          },
        },
      },
      {
        mark: { type: "tick", color: "white", size: 14 },
        encoding: {
          x: { field: "MEDIAN_VALUE", type: "quantitative" },
        },
      },
    ],
    row: {
      field: "SOURCE_UNIT_KEY",
      type: "nominal",
      title: "Measurement",
    },
  };
}
