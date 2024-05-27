import { CONCEPT } from "@/shared/config/files";
import _ from "lodash";
import { ConceptType } from "@/processes/exploreReports/model/interfaces/files/ConceptType";
import { MultipleFilesRawInterface } from "@/processes/exploreReports/model/interfaces/MultipleFilesRawInterface";
import environment from "@/shared/api/environment";
import { CONCEPT_METADATA } from "@/shared/api/duckdb/files";

function combineObjectsBySource(inputObject) {
  const resultArray = [];
  const sources = inputObject[CONCEPT_METADATA].map((data) => data.source);

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
  let concept: MultipleFilesRawInterface<ConceptType>[],
    conceptName,
    conceptId,
    numPersons,
    percent_people;
  if (environment.DUCKDB_ENABLED === "true") {
    concept = combineObjectsBySource(data);
    conceptName = concept[0].data[CONCEPT_METADATA]?.[0]?.CONCEPT_NAME;
    percent_people = (
      concept[0].data[CONCEPT_METADATA]?.[0]?.PERCENT_PERSONS * 100
    ).toFixed(2);
    conceptId = concept[0].data[CONCEPT_METADATA]?.[0]?.CONCEPT_ID;
    numPersons = _.sumBy(concept, (r) =>
      r.data[CONCEPT_METADATA]?.[0]?.NUM_PERSONS
        ? r.data[CONCEPT_METADATA]?.[0]?.NUM_PERSONS
        : 0
    );
  } else {
    concept = data[CONCEPT];
    conceptName = concept[0]?.data.CONCEPT_NAME[0];
    conceptId = concept[0]?.data.CONCEPT_ID[0];
    percent_people = (concept[0]?.data?.PERCENT_PERSONS * 100).toFixed(2);
    numPersons = _.sumBy(concept, (r) =>
      r.data.NUM_PERSONS[0] ? r.data.NUM_PERSONS[0] : 0
    );
  }
  if (!conceptId) {
    return {};
  } else {
    return {
      concept: concept.map((val) => ({
        CDM_NAME: val.source.cdm_source_name,
        CONCEPT_NAME: conceptName,
        CONCEPT_ID: conceptId,
        PEOPLE_COUNT: numPersons,
        PEOPLE_PERCENT: percent_people,
      })),
    };
  }
}
