import * as d3Format from "d3-format";

export const formatPercent = function (value: number): string {
  return d3Format.format("0.0%")(value);
};
