import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specCumulativeObservationAnnotation(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    height: 150,
    width: "container",
    data: { name: "conceptData" },
    encoding: {
      x: {
        field: "YEARS",
        type: "quantitative",
        title: "Years of Observation",
      },
      y: {
        field: "PERCENT_PEOPLE",
        type: "quantitative",
        title: "% of People",
        axis: { format: ",.2%" },
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
    signals: [
      {
        name: "brushCoordinates",
        value: [0, 0, 0, 0], // [x1, y1, x2, y2]
      },
    ],
    on: [
      {
        events: { signal: "brushCoordinates" },
        update: "notesBrush = brushCoordinates",
      },
    ],
  };
}
