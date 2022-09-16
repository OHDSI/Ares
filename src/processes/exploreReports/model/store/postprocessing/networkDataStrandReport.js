import { RECORDS_DOMAIN } from "@/shared/config/files";

export default function DataStrandReport(data) {
  return data[RECORDS_DOMAIN].reduce(
    (prevValue, current) => [
      ...prevValue,
      ...current.data.map((value) => ({
        ...value,
        cdm_source_key: current.source.cdm_source_key,
        cdm_release_key: current.source.releases[0].release_id,
        cdm_source_abbreviation: current.source.cdm_source_abbreviation,
      })),
    ],
    []
  );
}
