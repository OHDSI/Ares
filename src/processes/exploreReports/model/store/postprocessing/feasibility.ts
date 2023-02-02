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

export default function feasibility(data) {
  const observationPeriod: ObservationPeriodType = data[OBSERVATION_PERIOD];
  const person: PersonData = data[PERSON];
  const concept: ConceptType = data[CONCEPT];
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
