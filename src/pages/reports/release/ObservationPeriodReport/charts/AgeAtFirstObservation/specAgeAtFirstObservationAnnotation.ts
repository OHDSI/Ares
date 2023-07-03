import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specAgeAtFirstObservationAnnotation(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    height: 200,
    width: "container",
    data: { name: "conceptData" },

    encoding: {
      x: {
        field: "INTERVAL_INDEX",
        type: "quantitative",
        title: "Age",
      },
      y: {
        field: "PERCENT_VALUE",
        type: "quantitative",
        axis: { format: ",.2%" },
        title: "% of Population",
        scale: {
          zero: zeroBaseline,
        },
      },
    },
    layer: [
      {
        mark: { type: "line", interpolate: "linear" },
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
  };
}
