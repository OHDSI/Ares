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
          {
            mark: { type: "rect" },
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
              stroke: {
                condition: [
                  {
                    test: "datum['resize'] === true",
                    value: "black",
                  },
                ],
                value: null,
              },
              strokeWidth: {
                condition: [
                  {
                    test: "datum['resize'] === true",
                    value: 2,
                  },
                ],
                value: 0, // Set strokeWidth value to 0 for other cases
              },
              color: {
                condition: [
                  { test: "datum['resize'] === true", value: "red" },
                  { test: { param: "justBrush" } },
                ],
                value: "grey",
              },
              opacity: {
                condition: { test: "datum['resize'] === true", value: 0.2 },
                value: 0.3,
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
