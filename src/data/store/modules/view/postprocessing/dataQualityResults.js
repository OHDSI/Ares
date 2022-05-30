import { QUALITY_RESULTS } from "@/data/services/getFilePath";
import deriveResults from "@/services/derive-results";

export default function dataQuality(data) {
  const rawData = data[QUALITY_RESULTS];
  const derivedResults = deriveResults(data[QUALITY_RESULTS]);
  return {
    rawData,
    derivedResults,
  };
}
