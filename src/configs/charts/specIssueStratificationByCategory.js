export function specIssueStratificationByCategory(zeroBaseline = false) {
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: "container",
    autosize: "fit",
    height: 200,
    mark: "bar",
    params: [
      {
        name: "select",
        on: [{ events: "mousedown", update: "datum" }]
      }
    ],
    encoding: {
      y: {
        field: "CATEGORY",
        type: "ordinal",
        title: null,
        scale: {
          zero: zeroBaseline
        }
      },
      x: {
        field: "CHECK_NAME",
        aggregate: "count",
        title: "Number of Issues"
      },
      color: {
        field: "CDM_SOURCE_ABBREVIATION",
        type: "nominal",
        title: "Data Source",
        legend: {
          orient: "right",
          title: null,
          columns: 2
        }
      },
      detail: [
        { field: "RELEASE_ID", type: "nominal" },
        { field: "CDM_SOURCE_KEY", type: "nominal" }
      ]
    }
  };
}
