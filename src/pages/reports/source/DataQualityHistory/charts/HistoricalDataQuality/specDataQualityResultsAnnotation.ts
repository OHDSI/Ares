import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specDataQualityResultsAnnotation(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    width: "container",
    height: 100,
    data: { name: "conceptData" },
    encoding: {
      x: {
        field: "cdm_release_date",
        type: "quantitative",
        timeUnit: "yearmonth",
        axis: {
          title: "CDM Release Date",
        },
      },
      y: {
        field: "count_failed",
        type: "quantitative",
        axis: {
          title: "Checks Failed",
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
