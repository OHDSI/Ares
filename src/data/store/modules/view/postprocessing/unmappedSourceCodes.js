import { QUALITY_COMPLETENESS } from "@/data/services/getFilePath";

export default function unmappedSourceCodes(data) {
  return {
    domainTable: data[QUALITY_COMPLETENESS],
  };
}
