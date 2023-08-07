import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specCumulativeObservation(zeroBaseline = false) {
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
      color: {
        field: "DATA_SOURCE_KEY",
        type: "nominal",
        title: "Data Source",
      },
    },
    layer: [
      {
        mark: { type: "line", interpolate: "linear" },
        params: [
          {
            name: "source",
            select: { type: "point", fields: ["DATA_SOURCE_KEY"] },
            bind: "legend",
          },
        ],
        encoding: {
          opacity: {
            condition: { param: "source", value: 1 },
            value: 0.2,
          },
        },
      },
      {
        selection: {
          x: {
            type: "single",
            on: "mousemove",
            encodings: ["x"],
            nearest: true,
          },
        },
        mark: { type: "point", tooltip: true },
      },
      {
        transform: [
          {
            filter: {
              and: ["x.YEARS", { selection: "x" }],
            },
          },
        ],
        layer: [
          {
            mark: "rule",
            encoding: {
              y: {
                height: 1,
              },
            },
          },
        ],
      },
    ],
  };
}
