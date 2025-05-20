import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specCostTimeseries(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    width: "container",
    height: 150,
    data: { name: "conceptData" },
    encoding: {
      x: {
        field: "MONTH_YEAR",
        type: "temporal",
        timeUnit: "yearmonth",
        axis: {
          title: "Date",
        },
        scale: {
          type: "utc",
        },
      },
      y: {
        field: "TOTAL_COST",
        type: "quantitative",
        axis: {
          title: "Total Cost",
        },
        scale: {
          zero: zeroBaseline,
        },
      },
      color: {
        field: "DOMAIN_ID",
        title: "Domain",
      },
      tooltip: [
        {
          field: "MONTH_YEAR",
          title: "Date",
          type: "temporal",
          format: "%Y-%m-%d",
          scale: {
            type: "utc",
          },
        },
        { field: "DOMAIN_ID", title: "Domain" },
        {
          field: "TOTAL_COST",
          type: "quantitative",
          title: "Cost",
          format: ",",
        },
      ],
    },
    layer: [
      {
        mark: { type: "line", interpolate: "linear", point: true },
        params: [
          {
            name: "source",
            select: { type: "point", fields: ["DOMAIN_ID"] },
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
            fields: ["DOMAIN_ID"],
            bind: "legend",
          },
          x: {
            type: "single",
            on: "mousemove",
            fields: ["MONTH_YEAR"],
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
              and: ["x.MONTH_YEAR", { selection: "x" }],
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
