import { CONCEPT } from "@/shared/config/files";
import _ from "lodash";
import { ConceptType } from "@/processes/exploreReports/model/interfaces/files/ConceptType";
import { MultipleFilesRawInterface } from "@/processes/exploreReports/model/interfaces/MultipleFilesRawInterface";

export default function networkConcept(data) {
  const concept: MultipleFilesRawInterface<ConceptType>[] = data[CONCEPT];
  return {
    metadata: {
      conceptName: concept[0].data.CONCEPT_NAME[0],
      conceptId: concept[0].data.CONCEPT_ID[0],
      numPersons: _.sumBy(concept, (r) => r.data.NUM_PERSONS[0]),
    },
    chart: {
      measurementValueDistribution: concept.filter(
        (value) => value.data.MEASUREMENT_VALUE_DISTRIBUTION?.length
      ).length
        ? concept.reduce(
            (prevValue, current) => [
              ...prevValue,
              ...current.data.MEASUREMENT_VALUE_DISTRIBUTION.map((value) => ({
                ...value,
                SOURCE_UNIT_KEY: `${current.source.cdm_source_key} - ${value.CATEGORY}`,
              })),
            ],
            []
          )
        : null,
    },
    table: {
      measurementValueDistribution: concept.filter(
        (value) => value.data.MEASUREMENT_VALUE_DISTRIBUTION?.length
      ).length
        ? concept.reduce(
            (prevValue, current) => [
              ...prevValue,
              ...current.data.MEASUREMENT_VALUE_DISTRIBUTION.map((value) => ({
                ...value,
                SOURCE: current.source.cdm_source_key,
                RELEASE: current.source.releases[0].release_name,
                NUM_PERSONS: current.data.NUM_PERSONS[0],
                CONCEPT_NAME: concept[0].data.CONCEPT_NAME[0],
                CONCEPT_ID: concept[0].data.CONCEPT_ID[0],
              })),
            ],
            []
          )
        : null,
    },
  };
}
