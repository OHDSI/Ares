import {
  DOMAIN_DRUG_STRATIFICATION,
  DOMAIN_ISSUES,
  DOMAIN_SUMMARY,
  DOMAIN_VISIT_STRATIFICATION,
} from "@/shared/config/files";
import { DomainSummary } from "@/processes/exploreReports/model/interfaces/files/DomainSummary";
import { DomainIssues } from "@/processes/exploreReports/model/interfaces/files/DomainIssues";
import { DomainDrugStratificationType } from "@/processes/exploreReports/model/interfaces/files/DomainDrugStratificationType";
import { DomainVisitStratificationType } from "@/processes/exploreReports/model/interfaces/files/DomainVisitStratificationType";

export default function domainTable(data) {
  const domainTable: DomainSummary[] = data[DOMAIN_SUMMARY];
  const domainIssues: DomainIssues[] = data[DOMAIN_ISSUES];
  const drugStratification: DomainDrugStratificationType[] =
    data[DOMAIN_DRUG_STRATIFICATION];
  const domainStratification: DomainVisitStratificationType[] =
    data[DOMAIN_VISIT_STRATIFICATION];

  return {
    domainTable,
    domainIssues,
    domainStratification,
    drugStratification,
  };
}
