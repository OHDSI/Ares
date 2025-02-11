import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specDrugTypeStratification(zeroBaseline = false): TopLevelSpec {
  return {
    $schema: VEGA_SCHEMA,
    width: "container",
    data: { name: "conceptData" },
    height: 300,
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
    },
  };
}
