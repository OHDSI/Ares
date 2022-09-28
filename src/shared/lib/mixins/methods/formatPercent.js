import * as d3Format from "d3-format";

export const formatPercent = function (value) {
  return d3Format.format("0.0%")(value);
};
