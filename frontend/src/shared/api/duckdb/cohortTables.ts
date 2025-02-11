import * as files from "@/shared/api/duckdb/files";
import { DOMAIN_SUMMARY } from "@/shared/config/files";

function getCohortTables(params = [{}]) {
  return {
    cohortIndex: [
      {
        name: files.CONCEPT_METADATA,
        required: true,
        instanceParams: [params],
      },
      { name: files.PREVALENCE_BY_MONTH, instanceParams: [params] },
      { name: files.CONDITIONS_BY_TYPE, instanceParams: [params] },
      { name: files.PREVALENCE_BY_GENDER_AGE_YEAR, instanceParams: [params] },
      { name: files.AGE_AT_FIRST_DIAGNOSIS, instanceParams: [params] },
    ],
    cohortDrilldownReport: [],
  };
}
