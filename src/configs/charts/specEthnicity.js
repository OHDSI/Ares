export const specEthnicity = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 100,
  mark: "bar",
  encoding: {
    x: {
      field: "COUNT_VALUE",
      aggregate: "sum",
      title: "Number of People",
    },
    color: {
      field: "CONCEPT_NAME",
      legend: {
        orient: "right",
        columns: 2,
        title: "Ethnicity",
      },
    },
  },
};
