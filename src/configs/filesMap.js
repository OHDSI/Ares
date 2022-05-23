import {
  ACHILLES_PERFORMANCE,
  CDM_SOURCE,
  CONCEPT,
  DEATH,
  DENSITY_RECORDS_PERSON,
  DENSITY_TOTAL,
  DOMAIN_DRUG_STRATIFICATION,
  DOMAIN_ISSUES,
  DOMAIN_SUMMARY,
  DOMAIN_VISIT_STRATIFICATION,
  INDEX,
  METADATA,
  OBSERVATION_PERIOD,
  PERSON,
  QUALITY_COMPLETENESS,
  QUALITY_INDEX,
  QUALITY_RESULTS,
  RECORDS_DOMAIN,
  SOURCE_CONCEPT,
  SOURCE_HISTORY_INDEX,
} from "@/data/services/getFilePath";

export function getFilesByView() {
  return {
    network: {
      dataFeasibility: [],
      dataQualitySummary: [CONCEPT],
      dataStrand: [RECORDS_DOMAIN],
      population: [OBSERVATION_PERIOD],
    },
    release: {
      concept: [CONCEPT, DOMAIN_SUMMARY],
      dataQuality: [QUALITY_RESULTS],
      death: [DEATH],
      domainDensity: [DENSITY_RECORDS_PERSON, DENSITY_TOTAL],
      domainTable: [
        DOMAIN_SUMMARY,
        DOMAIN_ISSUES,
        DOMAIN_DRUG_STRATIFICATION,
        DOMAIN_VISIT_STRATIFICATION,
      ],
      metadataReport: [METADATA, CDM_SOURCE],
      observationPeriod: [OBSERVATION_PERIOD],
      performanceTable: [ACHILLES_PERFORMANCE],
      person: [PERSON],
      unmappedSourceCodes: [QUALITY_COMPLETENESS],
    },
    source: {
      dataQualityHistory: [QUALITY_INDEX],
      domainContinuity: [SOURCE_HISTORY_INDEX],
      sourceConcept: [SOURCE_CONCEPT],
      sourceOverview: [INDEX],
    },
  };
}
