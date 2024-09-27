import { CONCEPT } from "@/shared/config/files";
import { ConceptType } from "@/processes/exploreReports/model/interfaces/files/ConceptType";
import { MultipleFilesRawInterface } from "@/processes/exploreReports/model/interfaces/MultipleFilesRawInterface";
import environment from "@/shared/api/environment";
import { CONCEPT_METADATA } from "@/shared/api/duckdb/files";

function combineObjectsBySource(inputObject) {
  const resultArray = [];
  const sources = inputObject[CONCEPT_METADATA].filter(
    (val) => val.data.length
  ).map((data) => data.source);

  sources.forEach((source) => {
    const combinedData = {};

    for (const key in inputObject) {
      if (key !== "domainSummary") {
        const fieldArray = inputObject[key];
        const matchingItem = fieldArray.find(
          (item) => item.source.cdm_source_key === source.cdm_source_key
        );
        combinedData[key] = matchingItem ? matchingItem.data : null;
      } else {
        combinedData[key] = inputObject[key];
      }
    }

    resultArray.push({ source: source, data: combinedData });
  });

  return resultArray;
}

export default function networkConceptDashboard(data) {
  let concept: MultipleFilesRawInterface<ConceptType>[], conceptId: string;
  if (environment.DUCKDB_ENABLED) {
    concept = combineObjectsBySource(data);
    conceptId = concept[0].data[CONCEPT_METADATA]?.[0]?.CONCEPT_ID;
    if (!conceptId) {
      return {};
    } else {
      return {
        concept: concept.map((val) => ({
          CDM_NAME: val.source.cdm_source_name,
          CONCEPT_NAME: val.data[CONCEPT_METADATA][0]?.CONCEPT_NAME,
          CONCEPT_ID: val.data[CONCEPT_METADATA][0]?.CONCEPT_ID,
          PEOPLE_COUNT: val.data[CONCEPT_METADATA][0]?.NUM_PERSONS,
          PEOPLE_PERCENT: (
            val.data[CONCEPT_METADATA][0]?.PERCENT_PERSONS * 100
          ).toFixed(2),
        })),
      };
    }
  } else {
    concept = data[CONCEPT];
    conceptId = concept[0]?.data.CONCEPT_ID[0];
    if (!conceptId) {
      return {};
    } else {
      return {
        concept: concept.map((val) => ({
          CDM_NAME: val.source.cdm_source_name,
          CONCEPT_NAME: val.data?.CONCEPT_NAME[0],
          CONCEPT_ID: val.data.CONCEPT_ID[0],
          PEOPLE_COUNT: val.data.NUM_PERSONS,
          PEOPLE_PERCENT: (val.data.PERCENT_PERSONS * 100).toFixed(2),
        })),
      };
    }
  }
}
