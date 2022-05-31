import { CONCEPT } from "@/data/services/getFilePath";
import _ from "lodash";

export default function networkConcept(data) {
  return {
    conceptName: data[CONCEPT][0].data.CONCEPT_NAME[0],
    conceptId: data[CONCEPT][0].data.CONCEPT_ID[0],
    numPersons: _.sumBy(data[CONCEPT], (r) => r.data.NUM_PERSONS[0]),
    measurementValueDistribution: data[CONCEPT].filter(
      (value) => value.data.MEASUREMENT_VALUE_DISTRIBUTION?.length
    ).length
      ? data[CONCEPT].reduce(
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
  };
}
