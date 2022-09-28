import { QUALITY_COMPLETENESS } from "@/shared/config/files";

export default function unmappedSourceCodes(data) {
  return {
    domainTable: data[QUALITY_COMPLETENESS],
  };
}
