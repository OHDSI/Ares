import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function defOverview(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    transform: [
      {
        timeUnit: "yearmonth",
        field: "date",
        as: "transformedDate",
      },
    ],
    data: { name: "conceptData" },
    vconcat: [
      {
        height: 150,
        width: "container",
        description: "Domain Data Density",
        selection: {
          domain: { type: "multi", fields: ["domain"], bind: "legend" },
        },
        encoding: {
          x: {
            field: "date",
            type: "temporal",
            timeUnit: "yearmonth",
            scale: { domain: { selection: "brush" } },
            title: "Date",
          },
          y: {
            field: "records",
            type: "quantitative",
            title: "Records",
            scale: {
              zero: zeroBaseline,
            },
          },
          color: { field: "domain", type: "nominal" },
        },
        layer: [
          {
            mark: { type: "line", interpolate: "linear" },
            params: [
              {
                name: "source",
                select: { type: "point", fields: ["domain"] },
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
            transform: [{ filter: { param: "source" } }],
            selection: {
              x: {
                type: "single",
                on: "mouseover",
                fields: ["transformedDate"],
                nearest: true,
              },
            },
            mark: { type: "point", tooltip: true },
            encoding: {
              tooltip: [
                {
                  field: "records",
                  type: "quantitative",
                  title: "# Records",
                  format: ",",
                },
                {
                  field: "transformedDate",
                  type: "temporal",
                  title: "Date",
                },
                { field: "domain", type: "nominal", title: "Domain" },
              ],
            },
          },
          {
            transform: [
              {
                filter: {
                  and: ["x.transformedDate", { selection: "x" }],
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
                  color: {
                    value: "black",
                  },
                },
              },
            ],
          },
        ],
      },
      {
        width: "container",
        height: 50,
        mark: "line",
        selection: {
          brush: { type: "interval", encodings: ["x"] },
        },
        encoding: {
          x: {
            field: "date",
            type: "temporal",
            title: "Date",
            timeUnit: "yearmonth",
          },
          y: {
            field: "records",
            type: "quantitative",
            axis: { title: "" },
          },
          color: { field: "domain", type: "nominal" },
        },
        layer: [
          {
            mark: { type: "line", interpolate: "linear" },
            selection: {
              brush: { type: "interval", encodings: ["x"] },
            },
            params: [
              {
                name: "source",
                select: { type: "point", fields: ["domain"] },
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
            transform: [{ filter: { param: "source" } }],
            mark: { type: "point", tooltip: true },
          },
        ],
      },
    ],
  };
}
