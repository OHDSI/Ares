import { ACHILLES_PERFORMANCE } from "@/shared/config/files";
import { AchillesPerformanceType } from "@/processes/exploreReports/model/interfaces/files/AchillesPerformanceType";

export default function performance(data): {
  domainTable: AchillesPerformanceType[];
} {
  return {
    domainTable: data[ACHILLES_PERFORMANCE],
  };
}
