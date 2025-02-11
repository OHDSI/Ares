import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specRace(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    width: "container",
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
        groupby: ["DATA_SOURCE_KEY"],
      },
      {
        calculate: "datum.COUNT_VALUE/datum.TOTAL_VALUE",
        as: "PERCENT",
      },
    ],
    encoding: {
      tooltip: [
        { field: "CONCEPT_NAME", title: "Race" },
        { field: "PERCENT", title: "Percent", format: "0.2%" },
        { field: "COUNT_VALUE", title: "Number of People", format: ",d" },
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
        type: "nominal",
        legend: {
          orient: "right",
          title: "Race",
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
