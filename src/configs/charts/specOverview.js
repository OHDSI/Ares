export function specOverview(zeroBaseline = false) {
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    facet: {
      row: {
        field: "domain",
        title: null,
        header: {
          title: "# Records by Domain Table",
          labelOrient: "top",
          labelAnchor: "start",
          labelFontSize: 12,
          labelPadding: 2,
          labelFontWeight: "bold"
        }
      }
    },
    config: {
      facet: { spacing: 5 }
    },
    spec: {
      height: 75,
      width: 600,
      description: "Domain Continuity",
      encoding: {
        x: {
          field: "release_date",
          type: "temporal",
          axis: { title: null },
          timeUnit: "yearmonthdate"
        },
        y: {
          field: "count_records",
          type: "quantitative",
          title: null,
          header: { title: null },
          axis: { tickCount: 4 },
          scale: {
            zero: zeroBaseline
          }
        },
        tooltip: [
          { field: "count_records", title: "# of Records", format: "," }
        ],
        color: { field: "domain", type: "nominal", legend: null }
      },
      layer: [
        {
          mark: {
            type: "line",
            point: true
          }
        },
        {
          selection: {
            x: {
              type: "single",
              on: "mousemove",
              fields: ["release_date"],
              nearest: true
            }
          },
          mark: { type: "point", tooltip: true }
        },
        {
          transform: [
            {
              filter: {
                and: ["x.release_date", { selection: "x" }]
              }
            }
          ],
          layer: [
            {
              mark: "rule",
              encoding: {
                y: {
                  height: 1
                },
                color: {
                  value: "black"
                }
              }
            }
          ]
        }
      ]
    },
    resolve: { scale: { y: "independent" } }
  };
}
