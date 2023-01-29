import { VEGA_SCHEMA } from "@/shared/config/links";
import { TopLevelSpec } from "vega-lite";

export function specRecordProportionByMonthByRelease(zeroBaseline = false) {
  return {
    $schema: VEGA_SCHEMA,
    vconcat: [
      {
        height: 150,
        width: "container",
        description: "Domain Data Density",
        mark: { type: "circle", opacity: 0.5 },
        selection: {
          release: { type: "multi", fields: ["release"], bind: "legend" },
        },
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
            scale: {
              zero: zeroBaseline,
            },
          },
          color: {
            title: "Release",
            field: "release",
          },
          opacity: {
            condition: { selection: "release", value: 1 },
            value: 0.2,
          },
          tooltip: [
            { field: "release", title: "Release" },
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
        mark: { type: "line", opacity: 0.5 },
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
          color: {
            field: "release",
          },
        },
      },
    ],
  };
}
