import * as d3 from "d3-dsv";

export default function csvParse(data) {
  if (data) {
    return d3.csvParse(data);
  }
}
