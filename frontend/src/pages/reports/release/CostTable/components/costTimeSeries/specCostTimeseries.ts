import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specCostTimeseries(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    width: "container",
    height: 100,
    data: { name: "conceptData" },
    mark: { type: "line", point: true },
    encoding: {
      tooltip: [
        {
          field: "MONTH_YEAR",
          title: "Date",
          type: "temporal",
          timeUnit: "yearmonth",
        },
        {
          field: "TOTAL_COST",
          title: "Total Cost",
          type: "nominal",
          format: ",",
        },
      ],
      x: {
        field: "MONTH_YEAR",
        type: "temporal",
        title: "Date",
      },
      y: {
        field: "TOTAL_COST",
        title: "Cost",
        type: "quantitative",
        // scale: {
        //   zero: zeroBaseline,
        // },
      },
      // color: {
      //   condition: {
      //     param: "paintbrush",
      //     type: "nominal",
      //     legend: null,
      //   },
      //   value: "grey",
      // },
    },
    layer: [
      {
        mark: {
          type: "line",
          point: true,
          strokeWidth: 1,
        },
        encoding: {
          y: { field: "TOTAL_COST", type: "quantitative" },
        },
      },
      {
        mark: { type: "point" },
        encoding: {
          y: { field: "TOTAL_COST", type: "quantitative" },
          opacity: { value: 0 },
        },
        params: [
          {
            name: "index",
            select: {
              type: "point",
              fields: ["MONTH_YEAR"],
              on: "mousemove",
              nearest: true,
            },
          },
        ],
      },
      {
        transform: [
          {
            filter: {
              and: ["index.MONTH_YEAR", { param: "index" }],
            },
          },
        ],
        mark: "rule",
        encoding: {
          y: {
            height: 1,
            color: "black",
          },
        },
      },
    ],
  };
}
