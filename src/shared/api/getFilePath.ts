import * as files from "@/shared/config/files";

export interface Params {
  cdm?: string;
  domain?: string;
  release?: string;
  concept?: string;
}

export default function getFilePath(params: Params) {
  return {
    [files.INDEX]: "data/index.json",
    [files.CONCEPT]: `data/${params.cdm}/${params.release}/concepts/${params.domain}/concept_${params.concept}.json`,
    [files.QUALITY_INDEX]: `data/${params.cdm}/data-quality-index.json`,
    [files.QUALITY_RESULTS]: `data/${params.cdm}/${params.release}/dq-result.json`,
    [files.DEATH]: `data/${params.cdm}/${params.release}/death.json`,
    [files.SOURCE_HISTORY_INDEX]: `data/${params.cdm}/data-source-history-index.json`,
    [files.DENSITY_RECORDS_PERSON]: `data/${params.cdm}/${params.release}/datadensity-records-per-person.csv`,
    [files.DENSITY_TOTAL]: `data/${params.cdm}/${params.release}/datadensity-total.csv`,
    [files.DOMAIN_SUMMARY]: `data/${params.cdm}/${params.release}/domain-summary-${params.domain}.csv`,
    [files.HELP]: "doc/index.md",
    [files.METADATA]: `data/${params.cdm}/${params.release}/metadata.csv`,
    [files.CDM_SOURCE]: `data/${params.cdm}/${params.release}/cdmsource.csv`,
    [files.NETWORK_QUALITY_SUMMARY]: "data/network-data-quality-summary.csv",
    [files.RECORDS_DOMAIN]: `data/${params.cdm}/${params.release}/records-by-domain.csv`,
    [files.OBSERVATION_PERIOD]: `data/${params.cdm}/${params.release}/observationperiod.json`,
    [files.ACHILLES_PERFORMANCE]: `data/${params.cdm}/${params.release}/achilles-performance.csv`,
    [files.PERSON]: `data/${params.cdm}/${params.release}/person.json`,
    [files.SOURCE_CONCEPT]: `data/${params.cdm}/${params.release}/concepts/${params.domain}/concept_${params.concept}.json`,
    [files.QUALITY_COMPLETENESS]: `data/${params.cdm}/${params.release}/quality-completeness.csv`,
    [files.NETWORK_UNMAPPED_SOURCE_CODES]: `data/network-unmapped-source-codes.csv`,
    [files.DOMAIN_ISSUES]: `data/${params.cdm}/${params.release}/domain-issues.csv`,
    [files.DOMAIN_VISIT_STRATIFICATION]: `data/${params.cdm}/${params.release}/domain-visit-stratification.csv`,
    [files.DOMAIN_DRUG_STRATIFICATION]: `data/${params.cdm}/${params.release}/domain-drug-stratification.csv`,
    [files.DENSITY_DOMAIN_PERSON]: `data/${params.cdm}/${params.release}/datadensity-domains-per-person.csv`,
    [files.NETWORK_PERFORMANCE]: "data/network-performance.csv",
    [files.EXPORT_QUERY_INDEX]: "data/export_query_index.json",
    [files.TEMPORAL_CHARACTERIZATION]: `data/${params.cdm}/${params.release}/temporal-characterization.csv`,
  };
}
