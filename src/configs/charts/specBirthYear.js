export const specBirthYear = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  width: "container",
  height: 100,
  mark: "bar",
  encoding: {
    tooltip: [{ field: "COUNT_PERSON", title: "# of People", format: "," }],
    x: {
      field: "YEAR",
      type: "temporal",
      title: "Year of Birth",
    },
    y: {
      field: "COUNT_PERSON",
      aggregate: "sum",
      title: "Number of People",
    },
  },
};
