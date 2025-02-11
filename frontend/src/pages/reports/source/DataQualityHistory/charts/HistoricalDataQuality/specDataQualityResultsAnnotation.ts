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
    ],
  };
}
