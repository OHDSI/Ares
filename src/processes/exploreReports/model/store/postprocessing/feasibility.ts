import {
  CONCEPT,
  DENSITY_DOMAIN_PERSON,
  DOMAIN_SUMMARY,
  OBSERVATION_PERIOD,
  PERSON,
} from "@/shared/config/files";
import { PersonData } from "@/processes/exploreReports/model/interfaces/files/Person";
import { ConceptType } from "@/processes/exploreReports/model/interfaces/files/ConceptType";
import { ObservationPeriodType } from "@/processes/exploreReports/model/interfaces/files/ObservationPeriodType";
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

export default function feasibility(data) {
  let concept;
  let domainSummary = data[DOMAIN_SUMMARY];
  let sources = data[DENSITY_DOMAIN_PERSON];
  const observationPeriod: ObservationPeriodType = data[OBSERVATION_PERIOD];
  const person: PersonData = data[PERSON];
  if (environment.DUCKDB_ENABLED === "true") {
    concept = combineObjectsBySource(data);
  } else {
    concept = data[CONCEPT];
  }
  if (sources && sources.length) {
    sources = sources.map((file) => ({
      data: file.data,
      source: file.source.cdm_source_abbreviation,
    }));
  }
  if (domainSummary && domainSummary.length) {
    domainSummary = data[DOMAIN_SUMMARY]?.map((file) => ({
      data: file.data,
      source: file.source.cdm_source_abbreviation,
    }));
  }
  return { observationPeriod, person, sources, domainSummary, concept };
}
