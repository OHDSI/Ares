import * as d3 from "d3-dsv";

export default function networkQualitySummary(data) {
  if (data) {
    return d3.csvParse(data);
  }
}
