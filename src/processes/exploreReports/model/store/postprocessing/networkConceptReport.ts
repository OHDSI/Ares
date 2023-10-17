import { CONCEPT } from "@/shared/config/files";
import _ from "lodash";
import { ConceptType } from "@/processes/exploreReports/model/interfaces/files/ConceptType";
import { MultipleFilesRawInterface } from "@/processes/exploreReports/model/interfaces/MultipleFilesRawInterface";
import * as d3 from "d3-time-format";

function augmentReport(concept, dataField) {
  return concept.filter((value) => value.data[dataField]?.length).length
    ? concept.reduce(
        (prevValue, current) => [
          ...prevValue,
          ...current.data[dataField].map((value) => ({
            ...value,
            SOURCE: current.source.cdm_source_key,
          })),
        ],
        []
      )
    : null;
}

export default function networkConcept(data) {
  const dateParse = d3.timeParse("%Y%m");

  const concept: MultipleFilesRawInterface<ConceptType>[] = data[CONCEPT];
  if (!concept[0]) {
    return;
  }
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
      ageAtFirstExposure: augmentReport(concept, "AGE_AT_FIRST_EXPOSURE"),
      drugsByType: augmentReport(concept, "DRUGS_BY_TYPE"),
      visitDurationByType: augmentReport(concept, "VISIT_DURATION_BY_TYPE"),
      daysSupply: augmentReport(concept, "DAYS_SUPPLY_DISTRIBUTION"),
      quantityDistribution: augmentReport(concept, "QUANTITY_DISTRIBUTION"),
      ageAtFirstDiagnosis: augmentReport(concept, "AGE_AT_FIRST_DIAGNOSIS"),
      conditionsByType: augmentReport(concept, "CONDITIONS_BY_TYPE"),
      recordsByUnit: augmentReport(concept, "RECORDS_BY_UNIT"),
      measurementsByType: augmentReport(concept, "MEASUREMENTS_BY_TYPE"),
      lengthOfEra: augmentReport(concept, "LENGTH_OF_ERA"),
      ageAtFirstOccurrence: augmentReport(concept, "AGE_AT_FIRST_OCCURRENCE"),
      recordCountProportionByMonth: concept.filter(
        (value) => value.data.PREVALENCE_BY_MONTH?.length
      ).length
        ? concept.reduce(
            (prevValue, current) => [
              ...prevValue,
              ...current.data.PREVALENCE_BY_MONTH.map((value) => ({
                ...value,
                SOURCE: current.source.cdm_source_key,
                date: dateParse(value.X_CALENDAR_MONTH.toString()),
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
                UNIT_COUNT: current.data.RECORDS_BY_UNIT.filter(
                  (val) => val.CONCEPT_NAME === value.CATEGORY
                )[0].COUNT_VALUE,
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
