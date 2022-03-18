export const specDataQualityResults = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 100,
  encoding: {
    tooltip: [
      {
        field: "cdm_release_date",
        title: "CDM Release Date",
        type: "temporal",
        format: "%Y-%m-%d",
        scale: {
          type: "utc",
        },
      },
      { field: "count_failed", title: "Checks Failed" },
    ],
    x: {
      field: "cdm_release_date",
      type: "temporal",
      timeUnit: "yearmonthdate",
      axis: {
        title: "CDM Release Date",
      },
      scale: {
        type: "utc",
      },
    },
    y: {
      field: "count_failed",
      type: "quantitative",
      axis: {
        title: "Checks Failed",
      },
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
          fields: ["cdm_release_date"],
          nearest: true,
        },
      },
      mark: { type: "point", tooltip: true },
    },
    {
      transform: [
        {
          filter: {
            and: ["x.cdm_release_date", { selection: "x" }],
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
