import { CDM_SOURCE, METADATA } from "@/data/services/getFilePath";
import * as d3 from "d3-dsv";

export default function metadata(data) {
  const metadataData = data[METADATA];
  const cdmsourceData = data[CDM_SOURCE];
  return {
    metadataData,
    cdmsourceData,
  };
}
