export const specDrugTypeStratification = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  data: null,
  width: "container",
  height: 300,
  mark: "bar",
  encoding: {
    y: {
      field: "CONCEPT_NAME",
      type: "ordinal",
      title: null,
    },
    x: {
      field: "RECORD_COUNT",
      aggregate: "sum",
      title: "Number of Records",
    },
  },
};
