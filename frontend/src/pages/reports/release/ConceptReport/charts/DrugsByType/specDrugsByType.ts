import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specDrugsByType(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    width: "container",
    height: 75,
    mark: "bar",
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
    encoding: {
      tooltip: [
        { field: "CONCEPT_NAME", title: "Drug Type" },
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
  };
}
