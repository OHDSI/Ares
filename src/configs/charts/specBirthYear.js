export function specBirthYear(zeroBaseline = false) {
  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: "container",
    height: 100,
    params: [
      {
        name: "paintbrush",
        select: { type: "point", on: "mouseover", nearest: true }
      }
    ],
    mark: { type: "bar" },
    encoding: {
      tooltip: [{ field: "COUNT_PERSON", title: "# of People", format: "," }],
      x: {
        field: "YEAR",
        type: "temporal",
        title: "Year of Birth"
      },
      y: {
        field: "COUNT_PERSON",
        aggregate: "sum",
        title: "Number of People",
        scale: {
          zero: zeroBaseline
        }
      },
      color: {
        condition: {
          param: "paintbrush",
          field: "YEAR",
          type: "ordinal",
          legend: null
        },
        value: "grey"
      }
    }
  };
}
