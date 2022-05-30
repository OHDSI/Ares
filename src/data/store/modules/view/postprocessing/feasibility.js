import {
  CONCEPT,
  DENSITY_DOMAIN_PERSON,
  DOMAIN_SUMMARY,
  OBSERVATION_PERIOD,
  PERSON,
} from "@/data/services/getFilePath";

export default function feasibility(data) {
  const observationPeriod = data[OBSERVATION_PERIOD];
  const person = data[PERSON];
  const concept = data[CONCEPT];
  const sources = data[DENSITY_DOMAIN_PERSON]?.map((file) => ({
    data: file.data,
    source: file.source.cdm_source_abbreviation,
  }));
  const domainSummary = data[DOMAIN_SUMMARY]?.map((file) => ({
    data: file.data,
    source: file.source.cdm_source_abbreviation,
  }));
  return { observationPeriod, person, sources, domainSummary, concept };
}
