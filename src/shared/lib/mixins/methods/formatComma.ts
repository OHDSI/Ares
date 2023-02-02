import * as d3Format from "d3-format";

export const formatComma = function (value: number): string {
  return d3Format.format(",")(value);
};
