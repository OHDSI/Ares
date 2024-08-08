import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specDataQualityDelta(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    width: "container",
    height: 150,
    data: { name: "conceptData" },
    encoding: {
      x: { field: "Release", type: "nominal", title: "Release Name" },
      y: { field: "value", type: "quantitative", title: "Count" },
      color: {
        field: "variable",
        type: "nominal",
        title: "Issue status",
      },
    },
    transform: [
      {
        fold: ["NEW", "EXISTING", "RESOLVED", "STABLE"],
        as: ["variable", "value"],
      },
      {
        calculate: "datum.variable",
        as: "copiedVariable",
      },
    ],
    layer: [
      {
        mark: { type: "line", interpolate: "linear", point: true },
        params: [
          {
            name: "source",
            select: { type: "point", fields: ["variable"] },
            bind: "legend",
          },
        ],
        // encoding: {
        //   opacity: {
        //     condition: { param: "source", value: 1 },
        //     value: 0.2,
        //   },
        // },
        transform: [
          {
            filter: { param: "source" },
          },
        ],
      },
      // {
      //   selection: {
      //     release: {
      //       type: "multi",
      //       fields: ["copiedVariable"],
      //       bind: "legend",
      //     },
      //     x: {
      //       type: "single",
      //       on: "mousemove",
      //       fields: ["copiedVariable"],
      //       nearest: true,
      //     },
      //   },
      //   transform: [
      //     {
      //       filter: { selection: "release" },
      //     },
      //   ],
      //   mark: { type: "point", tooltip: true },
      // },
      // {
      //   transform: [
      //     {
      //       filter: {
      //         and: ["x.Release", { selection: "x" }],
      //       },
      //     },
      //     { filter: { selection: "release" } },
      //   ],
      //   layer: [
      //     {
      //       mark: "rule",
      //       encoding: {
      //         y: {
      //           height: 1,
      //         },
      //       },
      //     },
      //   ],
      // },
    ],
  };
}
