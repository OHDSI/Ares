export const specCumulativeObservation = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  height: 150,
  width: "container",
  encoding: {
    x: {
      field: "YEARS",
      type: "quantitative",
      title: "Years of Observation",
    },
    y: {
      field: "PERCENT_PEOPLE",
      type: "quantitative",
      title: "% of People",
      axis: { format: "0.0%" },
    },
    color: {
      field: "DATA_SOURCE_KEY",
      title: "Data Source",
      legend: { orient: "right", columns: 2 },
    },
  },

  layer: [
    {
      mark: { type: "line", interpolate: "linear" },
      params: [
        {
          name: "source",
          select: { type: "point", fields: ["DATA_SOURCE_KEY"] },
          bind: "legend",
        },
      ],
      encoding: {
        opacity: {
          condition: { param: "source", value: 1 },
          value: 0.2,
        },
      },
    },
    {
      selection: {
        dataSource: {
          type: "multi",
          fields: ["DATA_SOURCE_KEY"],
          bind: "legend",
        },
        x: {
          type: "single",
          on: "mousemove",
          encodings: ["x"],
          nearest: true,
        },
      },
      transform: [
        {
          filter: { selection: "dataSource" },
        },
      ],
      mark: { type: "point", tooltip: true },
    },
    {
      transform: [
        {
          filter: {
            and: ["x.YEARS", { selection: "x" }],
          },
        },
        { filter: { selection: "dataSource" } },
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
