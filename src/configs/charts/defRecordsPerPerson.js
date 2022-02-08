export const defRecordsPerPerson = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  vconcat: [
    {
      height: 150,
      width: "container",
      description: "Domain Data Density",
      encoding: {
        x: {
          field: "date",
          type: "temporal",
          axis: { title: "Date" },
          scale: { domain: { selection: "brush" } },
        },
        y: {
          field: "records",
          type: "quantitative",
          title: "Records",
          format: ",",
        },
        color: { field: "domain", type: "nominal" },
      },
      layer: [
        {
          mark: { type: "line", interpolate: "linear" },
          params: [
            {
              name: "source",
              select: { type: "point", fields: ["domain"] },
              bind: "legend",
            },
          ],
          encoding: {
            opacity: {
              condition: { param: "source", value: 1 },
              value: 0.2,
            },
          },
        },
        {
          transform: [{ filter: { param: "source" } }],
          mark: { type: "point", tooltip: true },
          encoding: {
            tooltip: [
              {
                field: "records",
                type: "quantitative",
                title: "Records per person",
                format: ",",
              },
              {
                field: "date",
                type: "temporal",
                title: "Date",
              },
            ],
          },
        },
      ],
    },

    {
      width: "container",
      height: 50,
      encoding: {
        x: { field: "date", type: "temporal", title: "Date" },
        y: {
          field: "records",
          type: "quantitative",
          axis: { title: "" },
        },
        color: { field: "domain", type: "nominal", title: "Domain" },
      },
      layer: [
        {
          mark: { type: "line", interpolate: "linear" },
          selection: {
            brush: { type: "interval", encodings: ["x"] },
          },
          params: [
            {
              name: "source",
              select: { type: "point", fields: ["domain"] },
              bind: "legend",
            },
          ],
          encoding: {
            opacity: {
              condition: { param: "source", value: 1 },
              value: 0.2,
            },
          },
        },
        {
          transform: [{ filter: { param: "source" } }],
          mark: { type: "point", tooltip: true },
        },
      ],
    },
  ],
};