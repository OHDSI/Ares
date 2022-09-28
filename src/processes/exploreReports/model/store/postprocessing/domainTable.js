import {
  DOMAIN_DRUG_STRATIFICATION,
  DOMAIN_ISSUES,
  DOMAIN_SUMMARY,
  DOMAIN_VISIT_STRATIFICATION,
} from "@/shared/config/files";

export default function domainTable(data) {
  const domainTable = data[DOMAIN_SUMMARY];
  const domainIssues = data[DOMAIN_ISSUES];
  const drugStratification = data[DOMAIN_DRUG_STRATIFICATION];
  const domainStratification = data[DOMAIN_VISIT_STRATIFICATION];

  return {
    domainTable,
    domainIssues,
    domainStratification,
    drugStratification,
  };
}
