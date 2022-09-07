export function specAgeBySex(zeroBaseline = false, minMax = false) {
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    height: 75,
    width: "container",
    encoding: {
      y: {
        field: "CATEGORY",
        type: "nominal",
        title: null,
        scale: {
          zero: zeroBaseline,
        },
      },
    },
    layer: [
      {
        mark: { type: "rule" },
        encoding: {
          x: {
            field: minMax ? "MIN_VALUE" : "P10_VALUE",
            type: "quantitative",
            title: null,
          },
          x2: { field: minMax ? "MAX_VALUE" : "P90_VALUE" },
        },
      },
      {
        mark: { type: "bar", size: 14, tooltip: {} },
        encoding: {
          x: { field: "P25_VALUE", type: "quantitative" },
          x2: { field: "P75_VALUE" },
          color: { field: "CATEGORY", type: "nominal", legend: null },
        },
      },
      {
        mark: { type: "tick", color: "white", size: 14 },
        encoding: {
          x: { field: "MEDIAN_VALUE", type: "quantitative" },
        },
      },
    ],
    row: {
      field: "CATEGORY",
      type: "nominal",
      title: "Measurement",
    },
  };
}
