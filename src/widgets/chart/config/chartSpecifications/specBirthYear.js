import { VEGA_SCHEMA } from "@/shared/config/links";

export function specBirthYear(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    width: "container",
    height: 100,
    params: [
      {
        name: "paintbrush",
        select: { type: "point", on: "mouseover", nearest: true },
      },
    ],
    mark: { type: "bar" },
    encoding: {
      tooltip: [
        { field: "COUNT_PERSON", title: "# of People", format: "," },
        {
          field: "YEAR",
          title: "Year of Birth",
          type: "temporal",
          format: "%Y",
        },
      ],
      x: {
        field: "YEAR",
        type: "temporal",
        title: "Year of Birth",
      },
      y: {
        field: "COUNT_PERSON",
        aggregate: "sum",
        title: "Number of People",
        scale: {
          zero: zeroBaseline,
        },
      },
      color: {
        condition: {
          param: "paintbrush",
          type: "nominal",
          legend: null,
        },
        value: "grey",
      },
    },
  };
}
