import { OBSERVATION_PERIOD } from "@/shared/config/files";

export default function population(data) {
  return {
    allCumulativeDurationData: data[OBSERVATION_PERIOD].reduce(
      (prevValue, current) => [
        ...prevValue,
        ...current.data.CUMULATIVE_DURATION.map((value) => ({
          ...value,
          DATA_SOURCE_KEY: current.source.cdm_source_key,
        })),
      ],
      []
    ),
    allAgeAtFirstObservationData: data[OBSERVATION_PERIOD].reduce(
      (prevValue, current) => [
        ...prevValue,
        ...current.data.AGE_AT_FIRST_OBSERVATION.map((value) => ({
          ...value,
          DATA_SOURCE_KEY: current.source.cdm_source_key,
        })),
      ],
      []
    ),
  };
}
