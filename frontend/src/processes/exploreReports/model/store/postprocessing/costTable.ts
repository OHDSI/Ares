import {
  COST_CONCEPT,
  COST_DOMAIN_SUMMARY,
  COST_TIMESERIES,
} from "@/shared/config/files";
import environment from "@/shared/api/environment";
import { TOTAL_CONCEPT_COST_PER_COST_ID } from "@/shared/api/duckdb/files";

export default function costTable(data) {
  if (data[COST_TIMESERIES]) {
    const costTable = data[COST_DOMAIN_SUMMARY];
    const timeSeries = data[COST_TIMESERIES];
    return {
      costTable,
      timeSeries,
    };
  } else {
    let costDrilldownTable;
    const costDomainSummary = data[COST_DOMAIN_SUMMARY];
    let conceptName;

    if (environment.DUCKDB_ENABLED) {
      // cost_concept_metadata = data[COST_CONCEPT_METADATA];
      costDrilldownTable = {
        TOTAL_CONCEPT_COST_PER_COST_ID: data[TOTAL_CONCEPT_COST_PER_COST_ID],
      };
      conceptName = costDomainSummary.find(
        (concept) =>
          concept.CONCEPT_ID ==
          costDrilldownTable.TOTAL_CONCEPT_COST_PER_COST_ID[0].CONCEPT_ID
      ).CONCEPT_NAME;
    } else {
      costDrilldownTable = data[COST_CONCEPT];
      conceptName = costDomainSummary.find(
        (concept) => concept.CONCEPT_ID == costDrilldownTable.CONCEPT_ID[0]
      ).CONCEPT_NAME;
    }
    return {
      costDrilldownTable,
      conceptName,
    };
  }
}
