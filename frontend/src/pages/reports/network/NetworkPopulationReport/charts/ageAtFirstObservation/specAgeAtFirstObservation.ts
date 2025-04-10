import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specAgeAtFirstObservation(zeroBaseline = false) {
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
          dataSource: {
            type: "multi",
            fields: ["DATA_SOURCE_KEY"],
            bind: "legend",
          },
          x: {
            type: "single",
            on: "mousemove",
            fields: ["INTERVAL_INDEX"],
            nearest: true,
          },
        },
        transform: [
          {
            filter: { selection: "dataSource" },
          },
        ],
        mark: { type: "point", tooltip: true },
      },
      {
        transform: [
          {
            filter: {
              and: ["x.INTERVAL_INDEX", { selection: "x" }],
            },
          },
          { filter: { selection: "dataSource" } },
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
