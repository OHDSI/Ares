import { QUALITY_RESULTS } from "@/shared/config/files";
import deriveResults from "@/shared/lib/derive-results";

export default function dataQuality(data) {
  const rawData = data[QUALITY_RESULTS];
  const derivedResults = deriveResults(data[QUALITY_RESULTS]);
  const cdmSourceName = rawData.Metadata[0].CDM_SOURCE_NAME;
  const sourceDescription = rawData.Metadata[0].SOURCE_DESCRIPTION;
  const cdmHolder = rawData.Metadata[0].CDM_HOLDER;
  const cdmEtlReference = rawData.Metadata[0].CDM_ETL_REFERENCE;
  const sourceDocumentationReference =
    rawData.Metadata[0].SOURCE_DOCUMENTATION_REFERENCE;
  const cdmVersion = rawData.Metadata[0].CDM_VERSION;
  const vocabularyVersion = rawData.Metadata[0].VOCABULARY_VERSION;
  const sourceReleaseDate = rawData.Metadata[0].SOURCE_RELEASE_DATE;
  const cdmReleaseDate = rawData.Metadata[0].CDM_RELEASE_DATE;
  const checkResults = rawData.CheckResults.map((val) => ({
    ...val,
    NOT_APPLICABLE: val.NOT_APPLICABLE ? "Yes" : "No",
    IS_ERROR: val.IS_ERROR ? "Yes" : "No",
  }));

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
  };
}
