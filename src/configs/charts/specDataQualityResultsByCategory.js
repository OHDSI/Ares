export const specDataQualityResultsByCategory = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 150,
  encoding: {
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
      field: "count_value",
      aggregate: "sum",
      type: "quantitative",
      axis: {
        title: "Checks Failed",
      },
    },
    color: {
      field: "category",
      title: "Check Category",
    },
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
      { field: "category", title: "Check Category" },
      {
        field: "count_value",
        aggregate: "sum",
        type: "quantitative",
        title: "Checks Failed",
      },
    ],
  },
  layer: [
    {
      mark: { type: "line", interpolate: "linear", point: true },
      params: [
        {
          name: "source",
          select: { type: "point", fields: ["category"] },
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
          fields: ["category"],
          bind: "legend",
        },
        x: {
          type: "single",
          on: "mousemove",
          fields: ["cdm_release_date"],
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
            and: ["x.cdm_release_date", { selection: "x" }],
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
