export function specQuantity(zeroBaseline = false) {
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    height: 100,
    width: "container",
    layer: [
      {
        mark: { type: "rule" },
        encoding: {
          x: {
            field: "MIN_VALUE",
            type: "quantitative",
            scale: { zero: false },
            title: "Amount",
          },
          x2: { field: "MAX_VALUE" },
        },
      },
      {
        mark: { type: "bar", size: 28, tooltip: {} },
        encoding: {
          x: { field: "P25_VALUE", type: "quantitative" },
          x2: { field: "P75_VALUE" },
        },
      },
      {
        mark: { type: "tick", color: "white", size: 28 },
        encoding: {
          x: { field: "MEDIAN_VALUE", type: "quantitative" },
        },
      },
    ],
  };
}
