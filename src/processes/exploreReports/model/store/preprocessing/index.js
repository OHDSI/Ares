import {
  ACHILLES_PERFORMANCE,
  CDM_SOURCE,
  DENSITY_DOMAIN_PERSON,
  DENSITY_RECORDS_PERSON,
  DENSITY_TOTAL,
  DOMAIN_DRUG_STRATIFICATION,
  DOMAIN_ISSUES,
  DOMAIN_SUMMARY,
  DOMAIN_VISIT_STRATIFICATION,
  METADATA,
  NETWORK_PERFORMANCE,
  NETWORK_QUALITY_SUMMARY,
  NETWORK_UNMAPPED_SOURCE_CODES,
  QUALITY_COMPLETENESS,
  RECORDS_DOMAIN,
  TEMPORAL_CHARACTERIZATION,
} from "@/shared/config/files";
import csvParse from "@/processes/exploreReports/model/store/preprocessing/csvParse";

export default {
  [NETWORK_QUALITY_SUMMARY]: csvParse,
  [RECORDS_DOMAIN]: csvParse,
  [NETWORK_UNMAPPED_SOURCE_CODES]: csvParse,
  [DENSITY_RECORDS_PERSON]: csvParse,
  [DOMAIN_SUMMARY]: csvParse,
  [DOMAIN_ISSUES]: csvParse,
  [DOMAIN_DRUG_STRATIFICATION]: csvParse,
  [DOMAIN_VISIT_STRATIFICATION]: csvParse,
  [CDM_SOURCE]: csvParse,
  [METADATA]: csvParse,
  [ACHILLES_PERFORMANCE]: csvParse,
  [QUALITY_COMPLETENESS]: csvParse,
  [DENSITY_TOTAL]: csvParse,
  [DENSITY_DOMAIN_PERSON]: csvParse,
  [NETWORK_PERFORMANCE]: csvParse,
  [TEMPORAL_CHARACTERIZATION]: csvParse,
};
