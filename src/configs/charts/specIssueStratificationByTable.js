export const specIssueStratificationByTable = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  autosize: "fit",
  height: 300,
  mark: "bar",
  encoding: {
    y: {
      field: "CDM_TABLE_NAME",
      type: "ordinal",
      title: null,
    },
    x: {
      field: "CHECK_NAME",
      aggregate: "count",
      title: "Number of Issues",
    },
    color: {
      field: "CDM_SOURCE_ABBREVIATION",
      type: "nominal",
      title: "Data Source",
      legend: {
        orient: "right",
        title: null,
        columns: 2,
      },
    },
  },
};
