import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specCumulativeObservationAnnotation(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    height: 150,
    width: "container",
    data: { name: "conceptData" },
    encoding: {
      x: {
        field: "YEARS",
        type: "quantitative",
        title: "Years of Observation",
      },
      y: {
        field: "PERCENT_PEOPLE",
        type: "quantitative",
        title: "% of People",
        axis: { format: ",.2%" },
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
    signals: [
      {
        name: "brushCoordinates",
        value: [0, 0, 0, 0], // [x1, y1, x2, y2]
      },
    ],
    on: [
      {
        events: { signal: "brushCoordinates" },
        update: "notesBrush = brushCoordinates",
      },
    ],
  };
}
