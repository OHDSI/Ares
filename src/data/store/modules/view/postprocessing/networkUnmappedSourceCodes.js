import { NETWORK_UNMAPPED_SOURCE_CODES } from "@/data/services/getFilePath";

export default function networkUnmappedSourceCodes(data) {
  return {
    domainTable: data[NETWORK_UNMAPPED_SOURCE_CODES],
  };
}
