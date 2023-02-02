import { QUALITY_RESULTS } from "@/shared/config/files";
import deriveResults from "@/shared/lib/derive-results";
import {
  CheckResults,
  QualityResultsType,
} from "@/processes/exploreReports/model/interfaces/files/QualityResultsType";

export default function dataQuality(data) {
  const rawData: QualityResultsType = data[QUALITY_RESULTS];
  const derivedResults = deriveResults(data[QUALITY_RESULTS].CheckResults);
  const cdmSourceName: string = rawData.Metadata[0].CDM_SOURCE_NAME;
  const sourceDescription: string = rawData.Metadata[0].SOURCE_DESCRIPTION;
  const cdmHolder: string = rawData.Metadata[0].CDM_HOLDER;
  const cdmEtlReference: string = rawData.Metadata[0].CDM_ETL_REFERENCE;
  const sourceDocumentationReference: string =
    rawData.Metadata[0].SOURCE_DOCUMENTATION_REFERENCE;
  const cdmVersion: string = rawData.Metadata[0].CDM_VERSION;
  const vocabularyVersion: string = rawData.Metadata[0].VOCABULARY_VERSION;
  const dqdVersion: string = rawData.Metadata[0].DQD_VERSION;
  const sourceReleaseDate: string = rawData.Metadata[0].SOURCE_RELEASE_DATE;
  const cdmReleaseDate: string = rawData.Metadata[0].CDM_RELEASE_DATE;
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
