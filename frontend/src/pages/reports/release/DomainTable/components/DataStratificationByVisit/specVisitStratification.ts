import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec, Config } from "vega-lite";

export function specVisitStratification(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    width: "container",
    height: 300,
    data: { name: "conceptData" },
    mark: "bar",
    encoding: {
      y: {
        field: "CONCEPT_NAME",
        type: "ordinal",
        title: null,
        scale: {
          zero: zeroBaseline,
        },
      },
      x: {
        field: "RECORD_COUNT",
        aggregate: "sum",
        title: "Number of Records",
      },
      color: {
        field: "CDM_TABLE_NAME",
        type: "nominal",
        title: "Event Domain Table",
        legend: {
          orient: "bottom",
          title: null,
        },
      },
    },
  };
}
