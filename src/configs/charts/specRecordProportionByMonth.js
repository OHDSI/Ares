export const specRecordProportionByMonth = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  vconcat: [
    {
      height: 150,
      width: "container",
      description: "Domain Data Density",
      mark: { type: "circle" },
      encoding: {
        x: {
          field: "date",
          type: "temporal",
          timeUnit: "yearmonth",
          scale: { domain: { selection: "brush" } },
          axis: { title: "" },
        },
        y: {
          field: "Y_PREVALENCE_1000PP",
          type: "quantitative",
          title: "Record Proportion per 1000",
        },
        tooltip: [
          {
            field: "Y_PREVALENCE_1000PP",
            title: "RPP1000",
            type: "quantitative",
          },
          {
            field: "date",
            title: "Date",
            type: "temporal",
            timeUnit: "yearmonth",
          },
        ],
      },
    },
    {
      width: "container",
      height: 25,
      mark: "line",
      selection: {
        brush: { type: "interval", encodings: ["x"] },
      },
      encoding: {
        x: {
          field: "date",
          type: "temporal",
          title: "Date",
          timeUnit: "yearmonth",
        },
        y: {
          field: "Y_PREVALENCE_1000PP",
          type: "quantitative",
          title: "",
        },
      },
    },
  ],
};
