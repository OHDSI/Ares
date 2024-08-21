import { RECORDS_DOMAIN } from "@/shared/config/files";
import { RecordsDomain } from "@/processes/exploreReports/model/interfaces/files/RecordsDomain";
import { MultipleFilesRawInterface } from "@/processes/exploreReports/model/interfaces/MultipleFilesRawInterface";

export default function dataSourceOverview(data) {
  const recordsDomain: MultipleFilesRawInterface<RecordsDomain[]>[] =
    data[RECORDS_DOMAIN];
  let processedData;

  if (recordsDomain && recordsDomain.length) {
    processedData = recordsDomain.reduce(
      (prevValue, current) => [
        ...prevValue,
        ...current.data.map((value) => ({
          ...value,
          cdm_release_key: current.release,
        })),
      ],
      []
    );
  }

  return { dataStrandReport: processedData };
}
