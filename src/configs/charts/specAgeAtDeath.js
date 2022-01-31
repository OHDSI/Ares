export const specAgeAtDeath = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  height: 100,
  width: "container",
  encoding: { y: { field: "CATEGORY", type: "nominal", title: null } },
  layer: [
    {
      mark: { type: "rule" },
      encoding: {
        x: {
          field: "MIN_VALUE",
          type: "quantitative",
          scale: { zero: false },
          title: null,
        },
        x2: { field: "MAX_VALUE" },
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
};
