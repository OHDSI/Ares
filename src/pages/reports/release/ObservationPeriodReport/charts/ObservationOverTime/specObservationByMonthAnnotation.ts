import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specObservationByMonthAnnotation(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    vconcat: [
      {
        height: 150,
        width: "container",
        data: { name: "conceptData" },

        encoding: {
          x: {
            field: "DATE",
            type: "quantitative",
            scale: { domain: { selection: "brush" } },
            timeUnit: "yearmonth",
            axis: { title: "" },
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
        ],
      },
      {
        width: "container",
        height: 50,
        mark: "line",
        data: { name: "conceptData" },

        selection: {
          brush: { type: "interval", encodings: ["x"], resolve: "global" },
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
