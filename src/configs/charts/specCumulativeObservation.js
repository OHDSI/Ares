export const specCumulativeObservation = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  height: 150,
  width: "container",
  mark: { type: "area", point: true, tooltip: {} },
  data: {},
  encoding: {
    x: {
      field: "YEARS",
      type: "quantitative",
      title: "Years of Observation",
    },
    y: {
      field: "PERCENT_PEOPLE",
      type: "quantitative",
      title: "% of People",
      axis: { format: "%" },
    },
    tooltip: [
      {
        field: "PERCENT_PEOPLE",
        title: "% of People",
        format: "0.2p",
      },
      {
        field: "YEARS",
        title: "Years of Observation",
        format: "0.3",
      },
    ],
  },
};
