import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specDataQualityResultsByCategoryAnnotation(
  zeroBaseline = false
) {
  return {
    $schema: VEGA_SCHEMA,
    width: "container",
    height: 150,
    data: { name: "conceptData" },
    encoding: {
      x: {
        field: "cdm_release_date",
        type: "quantitative",
        timeUnit: "yearmonthdate",
        axis: {
          title: "CDM Release Date",
        },
        scale: {
          type: "utc",
        },
      },
      y: {
        field: "count_value",
        aggregate: "sum",
        type: "quantitative",
        axis: {
          title: "Checks Failed",
        },
        scale: {
          zero: zeroBaseline,
        },
      },
      color: {
        field: "category",
        title: "Check Category",
      },
    },
    layer: [
      {
        mark: { type: "line", interpolate: "linear", point: true },
        params: [
          {
            name: "source",
            select: { type: "point", fields: ["category"] },
            bind: "legend",
          },
        ],
        encoding: {
          opacity: {
            condition: { param: "source", value: 1 },
            value: 0.2,
          },
        },
      },
      {
        selection: {
          dataSource: {
            type: "multi",
            fields: ["category"],
            bind: "legend",
          },
          x: {
            type: "single",
            on: "mousemove",
            fields: ["cdm_release_date"],
            nearest: true,
          },
        },
        transform: [
          {
            filter: { selection: "dataSource" },
          },
        ],
        mark: { type: "point", tooltip: true },
      },
    ],
  };
}
