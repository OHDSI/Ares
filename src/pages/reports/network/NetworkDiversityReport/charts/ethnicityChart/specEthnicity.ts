import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specEthnicity(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    width: "container",
    mark: "bar",
    data: { name: "conceptData" },
    transform: [
      {
        joinaggregate: [
          {
            op: "sum",
            field: "COUNT_VALUE",
            as: "TOTAL_RECORDS",
          },
        ],
        groupby: ["CHECK_NAME", "DATA_SOURCE_KEY"],
      },
      {
        calculate: "datum.COUNT_VALUE/datum.TOTAL_RECORDS",
        as: "PERCENT",
      },
    ],
    encoding: {
      tooltip: [
        { field: "CONCEPT_NAME", title: "Ethnicity" },
        { field: "COUNT_VALUE", title: "Count" },
        { field: "PERCENT", title: "Percent", format: ",.2%" },
      ],
      x: {
        field: "PERCENT",
        type: "quantitative",
        aggregate: "sum",
        title: "% of People",
        axis: {
          format: "0%",
        },
      },
      y: {
        field: "DATA_SOURCE_KEY",
        type: "ordinal",
        title: null,
        scale: {
          zero: zeroBaseline,
        },
      },
      color: {
        field: "CONCEPT_NAME",
        legend: {
          orient: "right",
          columns: 2,
          title: "Ethnicity",
        },
      },
    },
  };
}
