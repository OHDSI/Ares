import { VEGA_SCHEMA } from "@/shared/config/links";

export function specRecordsByUnit(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    width: "container",
    autosize: "fit",
    height: 75,
    mark: "bar",
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
        { field: "CONCEPT_NAME", title: "Unit Type" },
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
  };
}
