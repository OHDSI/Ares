export const specDataQualityResultsByCategory = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 150,
  mark: { type: "line", interpolate: "linear", point: true },
  selection: {
    category: { type: "multi", fields: ["category"], bind: "legend" },
  },
  encoding: {
    opacity: {
      condition: { selection: "category", value: 1 },
      value: 0.2,
    },
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
};
