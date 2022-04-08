export function specVisitStratification(zeroBaseline = false) {
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: "container",
    height: 300,
    mark: "bar",
    encoding: {
      y: {
        field: "CONCEPT_NAME",
        type: "ordinal",
        title: null,
        scale: {
          zero: zeroBaseline
        }
      },
      x: {
        field: "RECORD_COUNT",
        aggregate: "sum",
        title: "Number of Records"
      },
      color: {
        field: "CDM_TABLE_NAME",
        type: "nominal",
        title: "Event Domain Table",
        legend: {
          orient: "bottom",
          title: null
        }
      }
    }
  };
}
