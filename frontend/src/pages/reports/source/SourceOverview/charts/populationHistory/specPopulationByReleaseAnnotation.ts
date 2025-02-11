import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specPopulationByReleaseAnnotation(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    width: "container",
    height: 200,
    data: { name: "conceptData" },
    encoding: {
      x: {
        field: "dateU",
        type: "quantitative",
        timeUnit: "yearmonthdate",
        axis: {
          title: "Release",
        },
      },
      y: {
        field: "count_person",
        type: "quantitative",
        axis: {
          title: "People",
        },
        scale: {
          zero: zeroBaseline,
        },
      },
    },
    layer: [
      {
        mark: { type: "line", interpolate: "linear", point: true },
      },
    ],
  };
}
