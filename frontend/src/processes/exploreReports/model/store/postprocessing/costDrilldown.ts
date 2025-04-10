import {
  CONCEPT,
  COST_CONCEPT,
  COST_DOMAIN_SUMMARY,
} from "@/shared/config/files";
import environment from "@/shared/api/environment";
import {
  COST_CONCEPT_METADATA,
  TOTAL_CONCEPT_COST_PER_COST_ID,
} from "@/shared/api/duckdb/files";

export default function costDrilldown(data) {
  let costDrilldownTable;
  const costDomainSummary = data[COST_DOMAIN_SUMMARY];
  let conceptName;
  let cost_concept_metadata;

  if (environment.DUCKDB_ENABLED) {
    // cost_concept_metadata = data[COST_CONCEPT_METADATA];
    costDrilldownTable = {
      TOTAL_CONCEPT_COST_PER_COST_ID: data[TOTAL_CONCEPT_COST_PER_COST_ID],
    };
    console.log(costDrilldownTable);
    conceptName = costDomainSummary.find(
      (concept) =>
        concept.CONCEPT_ID ==
        costDrilldownTable.TOTAL_CONCEPT_COST_PER_COST_ID[0].CONCEPT_ID
    ).CONCEPT_NAME;
    // if (metadata) {
    //   conceptData = { ...data, ...metadata };
    // } else {
    //   conceptData = data;
    // }
    // conceptName = conceptData.CONCEPT_NAME;
    // conceptId = conceptData.CONCEPT_ID;
  } else {
    costDrilldownTable = data[COST_CONCEPT];
    console.log("else works");
    conceptName = costDomainSummary.find(
      (concept) => concept.CONCEPT_ID == costDrilldownTable.CONCEPT_ID[0]
    ).CONCEPT_NAME;
  }

  // console.log(costDrilldownTable, costDomainSummary);

  // console.log(costDomainSummary);

  // conceptName = costDomainSummary.find(
  //   (concept) => concept.CONCEPT_ID == costDrilldownTable.CONCEPT_ID[0]
  // ).CONCEPT_NAME;

  console.log(conceptName);
  return {
    costDrilldownTable,
    conceptName,
  };
}
