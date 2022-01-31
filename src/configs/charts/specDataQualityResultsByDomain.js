export const specDataQualityResultsByDomain = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 150,
  description: "Data Quality Results by Date",
  mark: { type: "line", interpolate: "linear", point: true },
  selection: {
    domain: { type: "multi", fields: ["cdm_table_name"], bind: "legend" },
  },
  encoding: {
    opacity: {
      condition: { selection: "domain", value: 1 },
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
      field: "cdm_table_name",
      title: "Check Domain",
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
      { field: "cdm_table_name", title: "Check Domain" },
      {
        field: "count_value",
        aggregate: "sum",
        type: "quantitative",
        title: "Checks Failed",
      },
    ],
  },
};
