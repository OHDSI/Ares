export const defOverview = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  vconcat: [
    {
      height: 150,
      width: "container",
      description: "Domain Data Density",
      selection: {
        domain: { type: "multi", fields: ["domain"], bind: "legend" },
      },
      encoding: {
        x: {
          field: "date",
          type: "temporal",
          scale: { domain: { selection: "brush" } },
          title: "Date",
        },
        y: {
          field: "records",
          type: "quantitative",
          title: "Records",
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
          selection: {
            x: {
              type: "single",
              on: "mousemove",
              encodings: ["x"],
              nearest: true,
            },
          },
          mark: { type: "point", tooltip: true },
          encoding: {
            tooltip: [
              {
                field: "records",
                type: "quantitative",
                title: "# Records",
                format: ",",
              },
              {
                field: "date",
                type: "temporal",
                title: "Date",
              },
              { field: "domain", type: "nominal", title: "Domain" },
            ],
          },
        },
        {
          transform: [
            {
              filter: {
                and: ["x.date", { selection: "x" }],
              },
            },
          ],
          layer: [
            {
              mark: "rule",
              encoding: {
                y: {
                  height: 1,
                },
                color: {
                  value: "black",
                },
              },
            },
          ],
        },
      ],
    },
    {
      width: "container",
      height: 50,
      mark: "line",
      selection: {
        brush: { type: "interval", encodings: ["x"] },
      },
      encoding: {
        x: { field: "date", type: "temporal", title: "Date" },
        y: {
          field: "records",
          type: "quantitative",
          axis: { title: "" },
        },
        color: { field: "domain", type: "nominal" },
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
