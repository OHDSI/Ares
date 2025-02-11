import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specAgeAtFirstObservationAnnotation(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    height: 200,
    width: "container",
    data: { name: "conceptData" },

    encoding: {
      x: {
        field: "INTERVAL_INDEX",
        type: "quantitative",
        title: "Age",
      },
      y: {
        field: "PERCENT_VALUE",
        type: "quantitative",
        axis: { format: ",.2%" },
        title: "% of Population",
        scale: {
          zero: zeroBaseline,
        },
      },
    },
    layer: [
      {
        mark: { type: "line", interpolate: "linear" },
      },
    ],
  };
}
