import {
  DOMAIN_DRUG_STRATIFICATION,
  DOMAIN_ISSUES,
  DOMAIN_SUMMARY,
  DOMAIN_VISIT_STRATIFICATION,
} from "@/data/services/getFilePath";

export default function domainTable(data) {
  const domainTable = data[DOMAIN_SUMMARY];
  const domainIssues = data[DOMAIN_ISSUES];
  const drugStratification = data[DOMAIN_DRUG_STRATIFICATION];
  const domainStratification = data[DOMAIN_VISIT_STRATIFICATION];
  /* if (this.getData[DOMAIN_DRUG_STRATIFICATION]) {
    this.isDrugExposure = true;
  if (this.$route.params.domain.toUpperCase() == "VISIT_OCCURRENCE") {
    this.getData[DOMAIN_VISIT_STRATIFICATION] =
      this.getData[DOMAIN_VISIT_STRATIFICATION];

    this.visitStratification = true;*/

  return {
    domainTable,
    domainIssues,
    domainStratification,
  };
}
