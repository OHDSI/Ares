import { DistributionType } from "@/processes/exploreReports/model/interfaces/reportTypes/DistributionType";
import { RecordsCountType } from "@/processes/exploreReports/model/interfaces/reportTypes/RecordsCountType";
import { PrevalenceType } from "@/processes/exploreReports/model/interfaces/reportTypes/PrevalenceType";

export interface Death {
  AGE_AT_DEATH: DistributionType[];
  DEATH_BY_TYPE: RecordsCountType[];
  PREVALENCE_BY_GENDER_AGE_YEAR: PrevalenceType[];
  PREVALENCE_BY_MONTH: PrevalenceType[];
}
