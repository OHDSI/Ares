import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec, Config } from "vega-lite";

export function specRecordsByUnit(zeroBaseline = false, minNax, labelColor) {
  return {
    $schema: VEGA_SCHEMA,
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
    data: { name: "conceptData" },
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
      autosize: "fit",
      height: 75,
      mark: "bar",
      encoding: {
        tooltip: [
          { field: "CONCEPT_NAME", title: "Unit Type" },
          { field: "UNIT_CONCEPT_ID", title: "Unit Concept ID" },
          { field: "COUNT_VALUE", title: "Number of Records", format: "," },
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
            title: null,
            columns: 2,
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
