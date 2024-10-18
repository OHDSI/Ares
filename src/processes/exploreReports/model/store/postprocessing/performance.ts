import {
  ACHILLES_PERFORMANCE,
  COHORT_DIAGNOSTICS_PERFORMANCE,
} from "@/shared/config/files";
import { AchillesPerformanceType } from "@/processes/exploreReports/model/interfaces/files/AchillesPerformanceType";

export default function performance(data): {
  achilles_performance: AchillesPerformanceType[];
  cohort_diagnostics_performance: object[];
} {
  return {
    achilles_performance: data[ACHILLES_PERFORMANCE],
    cohort_diagnostics_performance: data[COHORT_DIAGNOSTICS_PERFORMANCE],
  };
}
