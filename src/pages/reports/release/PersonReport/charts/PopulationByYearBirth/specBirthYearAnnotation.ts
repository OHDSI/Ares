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
      {
        mark: { type: "rect", opacity: 0.3 },
        data: {
          name: "notesData",
        },
        params: [
          {
            name: "justBrush",
            select: {
              type: "point",
              on: "mousedown",
              encodings: ["x", "x2", "y", "y2"],
              value: { x: [55, 160], y: [13, 37] },
            },
          },
          {
            name: "notesBrush",
            select: {
              type: "interval",
              encodings: ["x", "y"],
            },
          },
        ],
        encoding: {
          tooltip: [
            { field: "title", title: "Title" },
            {
              field: "description",
              title: "Description",
            },
          ],
          x: {
            field: "start",
            type: "quantitative",
          },
          color: {
            condition: {
              param: "justBrush",
              field: "CONCEPT_NAME",
              type: "ordinal",
              legend: null,
            },
            value: "grey",
          },
          x2: {
            field: "end",
            type: "quantitative",
          },
          y: {
            field: "y",
            type: "quantitative",
          },
          y2: {
            field: "y1",
            type: "quantitative",
          },
        },
      },
    ],
  };
}
