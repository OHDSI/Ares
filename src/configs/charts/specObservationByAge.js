export const specObservationByAge = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  height: { step: "20" },
  width: "container",
  encoding: {
    y: {
      field: "CATEGORY",
      type: "nominal",
      title: null,
      sort: { field: "categoryOrder" },
    },
  },
  layer: [
    {
      mark: { type: "rule" },
      encoding: {
        x: {
          field: "MIN_VALUE",
          type: "quantitative",
          scale: { zero: false },
          title: "Years",
          format: ".0d",
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
  row: {
    field: "CATEGORY",
    type: "nominal",
    title: "Measurement",
  },
};
