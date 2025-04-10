import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specAgeSexAnnotation(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    width: "container",
    height: 75,
    data: { name: "conceptData" },
    params: [
      {
        name: "paintbrush",
        select: { type: "point", on: "mouseover", nearest: true },
      },
    ],
    mark: "bar",
    transform: [{ filter: "datum.AGE >= 0" }],
    encoding: {
      tooltip: [
        { field: "CONCEPT_NAME", title: "Sex" },
        { field: "AGE", title: "Age" },
        { field: "COUNT_VALUE", title: "# of People", format: "," },
      ],
      color: {
        condition: {
          param: "paintbrush",
          field: "CONCEPT_NAME",
          type: "ordinal",
          legend: null,
        },
        value: "grey",
      },
      /* color: {
        field: "CONCEPT_NAME",
        legend: null,
      },*/
      /* row: {
        field: "CONCEPT_NAME",
        title: null,
        header: {
          title: "Number of People",
          labelOrient: "top",
          labelAnchor: "start",
          labelFontSize: 12,
          labelPadding: 2,
          labelFontWeight: "bold",
        },
      },*/
      x: {
        field: "AGE",
        title: "Age at First Observation",
        type: "quantitative",
        scale: { domain: [0, 100] },
      },
      y: {
        aggregate: "sum",
        field: "COUNT_VALUE",
        title: null,
        scale: {
          zero: zeroBaseline,
        },
      },
    },
  };
}
