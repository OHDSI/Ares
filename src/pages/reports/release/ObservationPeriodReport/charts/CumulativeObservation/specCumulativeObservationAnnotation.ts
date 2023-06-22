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
        mark: { type: "rect", opacity: 0.3 },
        data: {
          name: "notesData",
        },
        params: [
          {
            name: "justBrush",
            select: {
              type: "point",
              on: "mouseup",
              encodings: ["x", "x2", "y", "y2"],
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
