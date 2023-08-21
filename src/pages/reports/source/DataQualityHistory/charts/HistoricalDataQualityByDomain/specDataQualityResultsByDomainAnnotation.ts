import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specDataQualityResultsByDomainAnnotation(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    width: "container",
    height: 150,
    description: "Data Quality Results by Date",
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
        field: "cdm_table_name",
        title: "Check Domain",
      },
    },
    layer: [
      {
        mark: { type: "line", interpolate: "linear", point: true },
        params: [
          {
            name: "source",
            select: { type: "point", fields: ["cdm_table_name"] },
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
            fields: ["cdm_table_name"],
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
