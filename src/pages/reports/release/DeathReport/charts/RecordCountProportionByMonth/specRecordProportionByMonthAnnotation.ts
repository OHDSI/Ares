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
          {
            mark: { type: "rect", opacity: 0.3 },
            data: {
              name: "notesData",
            },
            params: [
              {
                name: "justBrush",
                select: {
                  type: "point",
                  on: "mousedown",
                  encodings: ["x", "x2", "y", "y2"],
                  value: { x: [55, 160], y: [13, 37] },
                },
              },
              {
                name: "notesBrush",
                select: {
                  type: "interval",
                  encodings: ["x", "y"],
                },
              },
            ],
            encoding: {
              tooltip: [
                { field: "title", title: "Title" },
                {
                  field: "description",
                  title: "Description",
                },
                { field: "createdBy", title: "Author" },
                {
                  field: "id",
                  title: "Created at",
                  timeUnit: "yearmonthdatehoursminutes",
                },
                {
                  field: "updatedAt",
                  title: "Updated at",
                  timeUnit: "yearmonthdatehoursminutes",
                },
              ],
              x: {
                field: "start",
                type: "quantitative",
              },
              color: {
                condition: {
                  param: "justBrush",
                  field: "CONCEPT_NAME",
                  type: "ordinal",
                  legend: null,
                },
                value: "grey",
              },
              x2: {
                field: "end",
                type: "quantitative",
              },
              y: {
                field: "y",
                type: "quantitative",
              },
              y2: {
                field: "y1",
                type: "quantitative",
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
