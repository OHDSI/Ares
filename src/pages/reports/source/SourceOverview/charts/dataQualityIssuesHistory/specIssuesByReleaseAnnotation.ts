import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specIssuesByReleaseAnnotation(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    width: "container",
    height: 200,
    data: { name: "conceptData" },
    transform: [
      {
        timeUnit: "yearmonthdate",
        field: "release_name",
        as: "date",
      },
    ],
    encoding: {
      x: {
        field: "date",
        type: "quantitative",
        timeUnit: "yearmonthdate",
        axis: {
          title: "Release",
        },
      },
      y: {
        field: "count_data_quality_issues",
        type: "quantitative",
        axis: {
          title: "Issues",
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
