import { QUALITY_COMPLETENESS } from "@/shared/config/files";
import { QualityCompletenessType } from "@/processes/exploreReports/model/interfaces/files/QualityCompletenessType";

export default function unmappedSourceCodes(data) {
  const qualityCompleteness: QualityCompletenessType[] =
    data[QUALITY_COMPLETENESS];
  return {
    domainTable: qualityCompleteness,
  };
}
