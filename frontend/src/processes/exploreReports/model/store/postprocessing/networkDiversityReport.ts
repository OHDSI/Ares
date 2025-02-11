import { MultipleFilesRawInterface } from "@/processes/exploreReports/model/interfaces/MultipleFilesRawInterface";
import { PERSON } from "@/shared/config/files";
import { PersonData } from "@/processes/exploreReports/model/interfaces/files/Person";

export default function networkDiversityReport(data) {
  const personData: MultipleFilesRawInterface<PersonData>[] = data[PERSON];
  let raceData;
  let ethnicityData;

  if (personData && personData.length) {
    raceData = personData.reduce(
      (prevValue, current) => [
        ...prevValue,
        ...current.data.RACE_DATA.map((value) => ({
          ...value,
          DATA_SOURCE_KEY: current.source.cdm_source_key,
        })),
      ],
      []
    );
    ethnicityData = personData.reduce(
      (prevValue, current) => [
        ...prevValue,
        ...current.data.ETHNICITY_DATA.map((value) => ({
          ...value,
          DATA_SOURCE_KEY: current.source.cdm_source_key,
        })),
      ],
      []
    );
  }

  return {
    raceData,
    ethnicityData,
  };
}
