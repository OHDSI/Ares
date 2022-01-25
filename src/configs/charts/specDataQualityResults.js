export const specDataQualityResults = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 100,
  mark: { type: "line", interpolate: "linear", point: true },
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
};
