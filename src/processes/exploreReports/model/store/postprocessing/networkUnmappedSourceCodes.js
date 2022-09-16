import { NETWORK_UNMAPPED_SOURCE_CODES } from "@/shared/config/files";

export default function networkUnmappedSourceCodes(data) {
  return {
    domainTable: data[NETWORK_UNMAPPED_SOURCE_CODES],
  };
}
