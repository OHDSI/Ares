import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specConditionsByType(zeroBaseline = false, minMax, labelColor) {
  return {
    $schema: VEGA_SCHEMA,
    data: { name: "conceptData" },
    facet: {
      row: {
        field: "SOURCE",
        title: "Source",
        header: {
          labelColor: labelColor,
          titleColor: labelColor,
        },
      },
      field: "Source",
      type: "nominal",
      title: null,
    },
    transform: [
      {
        window: [
          {
            op: "sum",
            field: "COUNT_VALUE",
            as: "TOTAL_VALUE",
          },
        ],
        frame: [null, null],
      },
      {
        calculate: "datum.COUNT_VALUE/datum.TOTAL_VALUE",
        as: "PERCENT",
      },
    ],
    spec: {
      width: "container",
      height: 75,
      mark: "bar",
      encoding: {
        tooltip: [
          { field: "CONCEPT_NAME", title: "Condition Type" },
          { field: "COUNT_VALUE", title: "Number of Records" },
          { field: "PERCENT", title: "% of Records", format: "0.2%" },
        ],
        x: {
          field: "PERCENT",
          aggregate: "sum",
          title: "% of Records",
          format: "0%",
          axis: {
            format: "0%",
          },
        },
        color: {
          field: "CONCEPT_NAME",
          type: "nominal",
          legend: {
            orient: "right",
            columns: 2,
            title: null,
          },
        },
        order: {
          aggregate: "sum",
          field: "COUNT_VALUE",
          sort: "descending",
        },
      },
    },
  };
}
