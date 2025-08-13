import { NETWORK_UNMAPPED_SOURCE_CODES } from "@/shared/config/files";
import { QualityCompletenessType } from "@/processes/exploreReports/model/interfaces/files/QualityCompletenessType";

export default function networkUnmappedSourceCodes(data) {
  const domainTable: QualityCompletenessType[] =
    data[NETWORK_UNMAPPED_SOURCE_CODES];
  return {
    domainTable,
  };
}
