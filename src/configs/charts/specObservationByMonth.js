export const specObservationByMonth = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  vconcat: [
    {
      height: 150,
      width: "container",
      mark: {
        type: "line",
        point: true,
        strokeWidth: 1,
      },
      encoding: {
        x: {
          field: "DATE",
          type: "temporal",
          scale: { domain: { selection: "brush" } },
          axis: { title: "" },
          timeUnit: "yearmonth",
        },
        y: {
          field: "PERCENT_VALUE",
          type: "quantitative",
          title: "% of People",
          axis: { format: "%" },
        },
        tooltip: [
          {
            field: "DATE",
            title: "Date",
            timeUnit: "yearmonth",
          },
          {
            field: "COUNT_VALUE",
            title: "# of People",
            format: ",",
          },
          {
            field: "PERCENT_VALUE",
            title: "% of People",
            format: "0.2%",
          },
        ],
      },
    },
    {
      width: "container",
      height: 50,
      mark: "line",
      selection: {
        brush: { type: "interval", encodings: ["x"] },
      },
      encoding: {
        x: { field: "DATE", type: "temporal", title: "Date" },
        y: {
          field: "COUNT_VALUE",
          type: "quantitative",
          axis: null,
        },
      },
    },
  ],
};
