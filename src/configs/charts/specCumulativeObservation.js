export function specCumulativeObservation(zeroBaseline = false) {
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    height: 150,
    width: "container",
    encoding: {
      x: {
        field: "YEARS",
        type: "quantitative",
        title: "Years of Observation"
      },
      y: {
        field: "PERCENT_PEOPLE",
        type: "quantitative",
        title: "% of People",
        axis: { format: "0.0%" },
        scale: {
          zero: zeroBaseline
        }
      }
    },
    layer: [
      {
        mark: { type: "line", interpolate: "linear" }
      },
      {
        selection: {
          x: {
            type: "single",
            on: "mousemove",
            encodings: ["x"],
            nearest: true
          }
        },
        mark: { type: "point", tooltip: true }
      },
      {
        transform: [
          {
            filter: {
              and: ["x.YEARS", { selection: "x" }]
            }
          }
        ],
        layer: [
          {
            mark: "rule",
            encoding: {
              y: {
                height: 1
              }
            }
          }
        ]
      }
    ]
  };
}
