import { VEGA_SCHEMA } from "@/shared/config/links";

export function specDrugTypeStratification(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    data: null,
    width: "container",
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
