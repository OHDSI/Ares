import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specRecordProportionByMonthAnnotation(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    data: { name: "conceptData" },
    vconcat: [
      {
        height: 150,
        width: "container",
        description: "Domain Data Density",
        layer: [
          {
            mark: { type: "circle" },
            encoding: {
              y: {
                field: "Y_PREVALENCE_1000PP",
                type: "quantitative",
                scale: {
                  zero: zeroBaseline,
                },
              },
            },
          },
        ],
        encoding: {
          x: {
            field: "date",
            type: "quantitative",
            timeUnit: "yearmonth",
            scale: { domain: { selection: "brush" } },
            axis: { title: "" },
          },
          y: {
            field: "Y_PREVALENCE_1000PP",
            type: "quantitative",
            title: "Record Proportion per 1000",
            scale: {
              zero: zeroBaseline,
            },
          },
          tooltip: [
            {
              field: "Y_PREVALENCE_1000PP",
              title: "RPP1000",
              type: "quantitative",
            },
            {
              field: "date",
              title: "Date",
              type: "temporal",
              timeUnit: "yearmonth",
            },
          ],
        },
      },
      {
        width: "container",
        height: 25,
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
            field: "Y_PREVALENCE_1000PP",
            type: "quantitative",
            title: "",
          },
        },
      },
    ],
  };
}
