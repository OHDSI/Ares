export const specAgeAtFirstObservation = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  height: 200,
  width: "container",
  encoding: {
    x: {
      field: "INTERVAL_INDEX",
      type: "quantitative",
      title: "Age",
    },
    y: {
      field: "PERCENT_VALUE",
      type: "quantitative",
      axis: { format: "0.0%" },
      title: "% of Population",
    },
  },
  layer: [
    {
      mark: { type: "line", interpolate: "linear" },
    },
    {
      selection: {
        x: {
          type: "single",
          on: "mousemove",
          encodings: ["x"],
          nearest: true,
        },
      },
      mark: { type: "point", tooltip: true },
    },
    {
      transform: [
        {
          filter: {
            and: ["x.INTERVAL_INDEX", { selection: "x" }],
          },
        },
      ],
      layer: [
        {
          mark: "rule",
          encoding: {
            y: {
              height: 1,
            },
            color: {
              value: "black",
            },
          },
        },
      ],
    },
  ],
};
