import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specCostDomains(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    width: "container",
    height: 75,
    mark: "bar",
    data: { name: "conceptData" },
    transform: [
      {
        aggregate: [
          {
            op: "sum",
            field: "TOTAL_COST",
            as: "TOTAL_COST",
          },
        ],
        groupby: ["DOMAIN_ID"],
      },
      {
        joinaggregate: [
          {
            op: "sum",
            field: "TOTAL_COST",
            as: "TOTAL_VALUE",
          },
        ],
      },
      {
        calculate: "datum.TOTAL_COST / datum.TOTAL_VALUE",
        as: "PERCENT",
      },
    ],
    encoding: {
      tooltip: [
        { field: "DOMAIN_ID", title: "Domain" },
        { field: "PERCENT", title: "Percent", format: "0.2%" },
        { field: "TOTAL_COST", title: "Cost", format: "," },
      ],
      x: {
        field: "PERCENT",
        type: "quantitative",
        title: "% of Cost",
        axis: { format: "0%" },
      },
      color: {
        field: "DOMAIN_ID",
        type: "nominal",
        legend: {
          orient: "right",
          title: "Domain",
        },
      },
      order: {
        field: "TOTAL_COST",
        type: "quantitative",
        sort: "descending",
      },
    },
  };
}
