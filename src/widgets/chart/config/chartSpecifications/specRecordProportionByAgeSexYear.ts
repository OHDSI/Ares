import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specRecordProportionByAgeSexYear(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    spacing: 10,
    autosize: { resize: true },
    facet: {
      row: {
        field: "TRELLIS_NAME",
        title: "Age Deciles",
        sort: { field: "trellisOrder" },
      },
      field: "TRELLIS_NAME",
      type: "nominal",
      title: null,
    },
    spec: {
      width: "container",
      height: 30,
      encoding: {
        x: {
          field: "X_CALENDAR_YEAR",
          type: "quantitative",
          title: "",
          axis: {
            format: "d",
          },
        },
        y: {
          field: "Y_PREVALENCE_1000PP",
          type: "quantitative",
          title: "",
          scale: {
            zero: zeroBaseline,
          },
        },
        color: {
          title: "Sex",
          field: "SERIES_NAME",
          type: "nominal",
          legend: {
            orient: "right",
            offset: 5,
          },
        },
        tooltip: [
          { field: "X_CALENDAR_YEAR", title: "Year" },
          {
            field: "Y_PREVALENCE_1000PP",
            title: "Record Proportion per 1000",
          },
          { field: "TRELLIS_NAME", title: "Age Decile" },
        ],
      },
      layer: [
        {
          mark: { type: "line", interpolate: "linear" },
          params: [
            {
              name: "source",
              select: { type: "point", fields: ["SERIES_NAME"] },
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
              fields: ["SERIES_NAME"],
              bind: "legend",
            },
            x: {
              type: "single",
              on: "mousemove",
              encodings: ["x"],
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
                and: ["x.X_CALENDAR_YEAR", { selection: "x" }],
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
                color: {
                  value: "black",
                },
              },
            },
          ],
        },
      ],
    },
  };
}
