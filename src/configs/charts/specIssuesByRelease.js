export const specIssuesByRelease = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 200,
  mark: { type: "line", interpolate: "linear", point: true },
  encoding: {
    tooltip: [
      {
        field: "release_name",
        title: "Release",
        type: "temporal",
        format: "%Y-%m-%d",
      },
      { field: "count_data_quality_issues", title: "Issues" },
    ],
    x: {
      field: "release_name",
      type: "temporal",
      timeUnit: "yearmonthdate",
      axis: {
        title: "Release",
      },
    },
    y: {
      field: "count_data_quality_issues",
      type: "quantitative",
      axis: {
        title: "Issues",
      },
      scale: {
        zero: false,
      },
    },
  },
};
