import * as d3Format from "d3-format";

export const formatComma = function (value: number): string {
  const isNan = isNaN(parseFloat(`${value}`));
  return isNan ? "N/A" : d3Format.format(",")(value);
};
