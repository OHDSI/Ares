import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specPopulationByReleaseAnnotation(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    width: "container",
    height: 200,
    data: { name: "conceptData" },
    encoding: {
      x: {
        field: "dateU",
        type: "quantitative",
        timeUnit: "yearmonthdate",
        axis: {
          title: "Release",
        },
      },
      y: {
        field: "count_person",
        type: "quantitative",
        axis: {
          title: "People",
        },
        scale: {
          zero: zeroBaseline,
        },
      },
    },
    layer: [
      {
        mark: { type: "line", interpolate: "linear", point: true },
      },
      {
        mark: { type: "rect", opacity: 0.1 },
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
          ],
          x: {
            field: "start",
            type: "quantitative",
            timeUnit: "yearmonth",
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
            timeUnit: "yearmonth",
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
