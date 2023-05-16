import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specIssueStratificationByTable(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    width: "container",
    autosize: "fit",
    height: 300,
    data: { name: "conceptData" },
    mark: "bar",
    transform: [
      {
        joinaggregate: [
          {
            op: "count",
            field: "CHECK_NAME",
            as: "totalRecords",
          },
        ],
        groupby: ["CDM_TABLE_NAME"],
      },
      {
        joinaggregate: [
          {
            op: "count",
            field: "CHECK_NAME",
            as: "recordsByCDM",
          },
        ],
        groupby: ["CDM_SOURCE_ABBREVIATION", "CDM_TABLE_NAME"],
      },
      {
        calculate: "datum.recordsByCDM/datum.totalRecords",
        as: "percentOfTotal",
      },
    ],
    encoding: {
      tooltip: [
        { field: "CHECK_NAME", title: "Number of issues", aggregate: "count" },
        { field: "percentOfTotal", title: "Percent", format: "0.2%" },
        { field: "CDM_TABLE_NAME", title: "Table" },
        { field: "CDM_SOURCE_ABBREVIATION", title: "Data Source" },
      ],
      y: {
        field: "CDM_TABLE_NAME",
        type: "ordinal",
        title: null,
        scale: {
          zero: zeroBaseline,
        },
      },
      x: {
        field: "CHECK_NAME",
        aggregate: "count",
        title: "Number of Issues",
      },
      color: {
        field: "CDM_SOURCE_ABBREVIATION",
        type: "nominal",
        title: "Data Source",
        legend: {
          orient: "right",
          title: null,
          columns: 2,
        },
      },
    },
  };
}
