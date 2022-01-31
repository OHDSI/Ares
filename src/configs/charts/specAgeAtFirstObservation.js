export const specAgeAtFirstObservation = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  height: 150,
  width: "container",
  mark: { type: "bar", tooltip: {}, width: 10 },
  data: null,
  encoding: {
    x: {
      field: "INTERVAL_INDEX",
      type: "quantitative",
      title: "Age",
      scale: { domainMin: 0 },
    },
    y: {
      field: "COUNT_VALUE",
      type: "quantitative",
      title: "Count People",
    },
    tooltip: [
      {
        field: "INTERVAL_INDEX",
        title: "Age",
      },
      {
        field: "COUNT_VALUE",
        title: "Number of People",
        format: ",",
      },
      { field: "PERCENT_VALUE", title: "% of People", format: "0.1%" },
    ],
  },
};
