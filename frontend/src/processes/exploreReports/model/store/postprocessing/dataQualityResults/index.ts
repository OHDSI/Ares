import { QUALITY_RESULTS } from "@/shared/config/files";
import deriveResults from "./derive-results";
import {
  CheckResults,
  QualityResultsType,
} from "@/processes/exploreReports/model/interfaces/files/QualityResultsType";

export default function dataQuality(data) {
  const rawData: QualityResultsType = data[QUALITY_RESULTS];
  let derivedResults;
  if (rawData) {
    derivedResults = deriveResults(rawData.CheckResults);
  }
  const cdmSourceName: string = rawData.Metadata?.[0]?.cdmSourceName;
  const sourceDescription: string = rawData.Metadata?.[0]?.sourceDescription;
  const cdmHolder: string = rawData.Metadata?.[0]?.cdmHolder;
  const cdmEtlReference: string = rawData.Metadata?.[0]?.cdmEtlReference;
  const sourceDocumentationReference: string =
    rawData.Metadata[0]?.sourceDocumentationReference;
  const cdmVersion: string = rawData.Metadata?.[0]?.cdmVersion;
  const vocabularyVersion: string = rawData.Metadata?.[0]?.vocabularyVersion;
  const dqdVersion: string = rawData.Metadata?.[0]?.dqdVersion;
  const sourceReleaseDate: string = rawData.Metadata?.[0]?.sourceReleaseDate;
  const cdmReleaseDate: string = rawData.Metadata?.[0]?.cdmReleaseDate;
  const checkResults: CheckResults[] = rawData.CheckResults;

  return {
    rawData,
    derivedResults,
    checkResults,
    cdmHolder,
    cdmVersion,
    cdmReleaseDate,
    cdmSourceName,
    sourceDescription,
    cdmEtlReference,
    sourceDocumentationReference,
    vocabularyVersion,
    sourceReleaseDate,
    dqdVersion,
  };
}
