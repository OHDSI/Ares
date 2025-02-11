import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specBirthYearAnnotation(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    width: "container",
    height: 100,
    data: { name: "conceptData" },
    layer: [
      {
        params: [
          {
            name: "paintbrush",
            select: { type: "point", on: "mouseover", nearest: false },
          },
        ],
        mark: { type: "bar" },
        encoding: {
          tooltip: [
            { field: "COUNT_PERSON", title: "# of People", format: "," },
            {
              field: "YEAR",
              title: "Year of Birth",
              type: "quantitative",
            },
          ],
          x: {
            field: "YEAR",
            type: "quantitative",
            title: "Year of Birth",
            axis: { format: "0000" },
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
      },
    ],
  };
}
