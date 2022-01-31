export const INDEX = "index";
export const CONCEPT = "concept";
export const QUALITY_INDEX = "qualityIndex";
export const QUALITY_RESULTS = "qualityResults";
export const DEATH = "death";
export const SOURCE_HISTORY_INDEX = "sourceHistoryIndex";
export const DENSITY_RECORDS_PERSON = "densityRecordsPerson";
export const DENSITY_TOTAL = "densityTotal";
export const DOMAIN_SUMMARY = "domainSummary";
export const HELP = "help";
export const METADATA = "metadata";
export const CDM_SOURCE = "cdmSource";
export const NETWORK_QUALITY_SUMMARY = "networkQualitySummary";
export const RECORDS_DOMAIN = "recordsDomain";
export const OBSERVATION_PERIOD = "observationPeriod";
export const ACHILLES_PERFORMANCE = "achillesPerformance";
export const PERSON = "person";
export const SOURCE_CONCEPT = "sourceConcept";
export const QUALITY_COMPLETENESS = "qualityCompleteness";
export const DOMAIN_ISSUES = "domainIssues";
export const DOMAIN_VISIT_STRATIFICATION = "domainVisitStratification";
export const DOMAIN_DRUG_STRATIFICATION = "domainDrugStratification";

export default function getFilePath(params = "") {
  return {
    [INDEX]: "data/index.json",
    [CONCEPT]: `data/${params.cdm}/${params.release}/concepts/${params.domain}/concept_${params.concept}.json`,
    [QUALITY_INDEX]: `data/${params.cdm}/data-quality-index.json`,
    [QUALITY_RESULTS]: `data/${params.cdm}/${params.release}/dq-result.json`,
    [DEATH]: `data/${params.cdm}/${params.release}/death.json`,
    [SOURCE_HISTORY_INDEX]: `data/${params.cdm}/data-source-history-index.json`,
    [DENSITY_RECORDS_PERSON]: `data/${params.cdm}/${params.release}/datadensity-records-per-person.csv`,
    [DENSITY_TOTAL]: `data/${params.cdm}/${params.release}/datadensity-total.csv`,
    [DOMAIN_SUMMARY]: `data/${params.cdm}/${params.release}/domain-summary-${params.domain}.csv`,
    [HELP]: "doc/DefaultHelp.md",
    [METADATA]: `data/${params.cdm}/${params.release}/metadata.csv`,
    [CDM_SOURCE]: `data/${params.cdm}/${params.release}/cdmsource.csv`,
    [NETWORK_QUALITY_SUMMARY]: "data/network-data-quality-summary.csv",
    [RECORDS_DOMAIN]: `data/${params.cdm}/${params.release}/records-by-domain.csv`,
    [OBSERVATION_PERIOD]: `data/${params.cdm}/${params.release}/observationperiod.json`,
    [ACHILLES_PERFORMANCE]: `data/${params.cdm}/${params.release}/achilles-performance.csv`,
    [PERSON]: `data/${params.cdm}/${params.release}/person.json`,
    [SOURCE_CONCEPT]: `data/${params.cdm}/${params.release}/concepts/${params.domain}/concept_${params.concept}.json`,
    [QUALITY_COMPLETENESS]: `data/${params.cdm}/${params.release}/quality-completeness.csv`,
    [DOMAIN_ISSUES]: `data/${params.cdm}/${params.release}/domain-issues.csv`,
    [DOMAIN_VISIT_STRATIFICATION]: `data/${params.cdm}/${params.release}/domain-visit-stratification.csv`,
    [DOMAIN_DRUG_STRATIFICATION]: `data/${params.cdm}/${params.release}/domain-drug-stratification.csv`,
  };
}
