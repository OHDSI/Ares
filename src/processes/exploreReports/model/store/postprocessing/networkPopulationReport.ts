import { OBSERVATION_PERIOD } from "@/shared/config/files";
import { MultipleFilesRawInterface } from "@/processes/exploreReports/model/interfaces/MultipleFilesRawInterface";
import { ObservationPeriodType } from "@/processes/exploreReports/model/interfaces/files/ObservationPeriodType";

export default function population(data) {
  const observationPeriod: MultipleFilesRawInterface<ObservationPeriodType>[] =
    data[OBSERVATION_PERIOD];
  return {
    allCumulativeDurationData: observationPeriod.reduce(
      (prevValue, current) => [
        ...prevValue,
        ...current.data.CUMULATIVE_DURATION.map((value) => ({
          ...value,
          DATA_SOURCE_KEY: current.source.cdm_source_key,
        })),
      ],
      []
    ),
    allAgeAtFirstObservationData: observationPeriod.reduce(
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
