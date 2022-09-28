import { VEGA_SCHEMA } from "@/shared/config/links";

export function specEthnicity(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    width: "container",
    height: 100,
    mark: "bar",
    transform: [
      {
        joinaggregate: [
          {
            op: "sum",
            field: "COUNT_VALUE",
            as: "TOTAL_RECORDS",
          },
        ],
        groupby: ["CHECK_NAME"],
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
        field: "COUNT_VALUE",
        aggregate: "sum",
        title: "Number of People",
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
