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
    ],
  };
}
