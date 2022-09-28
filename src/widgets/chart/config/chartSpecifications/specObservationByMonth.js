import { VEGA_SCHEMA } from "@/shared/config/links";

export function specObservationByMonth(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    vconcat: [
      {
        height: 150,
        width: "container",
        encoding: {
          x: {
            field: "DATE",
            type: "temporal",
            scale: { domain: { selection: "brush" } },
            axis: { title: "" },
            timeUnit: "yearmonth",
          },
          y: {
            field: "PERCENT_VALUE",
            type: "quantitative",
            title: "% of People",
            axis: { format: "%" },
            scale: {
              zero: zeroBaseline,
            },
          },
          tooltip: [
            {
              field: "DATE",
              title: "Date",
              timeUnit: "yearmonth",
            },
            {
              field: "COUNT_VALUE",
              title: "# of People",
              format: ",",
            },
            {
              field: "PERCENT_VALUE",
              title: "% of People",
              format: "0.2%",
            },
          ],
        },
        layer: [
          {
            mark: {
              type: "line",
              point: true,
              strokeWidth: 1,
            },
            encoding: {
              y: { field: "PERCENT_VALUE", type: "quantitative" },
            },
          },
          {
            params: [
              {
                name: "index",
                select: {
                  type: "point",
                  fields: ["DATE"],
                  on: "mousemove",
                  nearest: true,
                },
              },
            ],
            mark: { type: "point" },
            encoding: {
              y: { field: "PERCENT_VALUE", type: "quantitative" },
              opacity: { value: 0 },
            },
          },
          {
            transform: [
              {
                filter: {
                  and: ["index.DATE", { param: "index" }],
                },
              },
            ],
            mark: "rule",
            encoding: {
              y: {
                height: 1,
              },
            },
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
          x: { field: "DATE", type: "temporal", title: "Date" },
          y: {
            field: "COUNT_VALUE",
            type: "quantitative",
            axis: null,
          },
        },
      },
    ],
  };
}
