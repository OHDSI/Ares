import { RECORDS_DOMAIN } from "@/shared/config/files";
import { RecordsDomain } from "@/processes/exploreReports/model/interfaces/files/RecordsDomain";
import { MultipleFilesRawInterface } from "@/processes/exploreReports/model/interfaces/MultipleFilesRawInterface";

export default function DataStrandReport(data) {
  const recordsDomain: MultipleFilesRawInterface<RecordsDomain[]>[] =
    data[RECORDS_DOMAIN];
  let processedData;

  if (recordsDomain && recordsDomain.length) {
    processedData = recordsDomain.reduce(
      (prevValue, current) => [
        ...prevValue,
        ...current.data.map((value) => ({
          ...value,
          cdm_source_key: current.source.cdm_source_key,
          cdm_release_key: current.source.releases[0]?.release_id,
          cdm_source_abbreviation: current.source.cdm_source_abbreviation,
        })),
      ],
      []
    );
  }

  return { dataStrandReport: processedData };
}
