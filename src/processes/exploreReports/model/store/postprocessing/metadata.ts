import { CDM_SOURCE, METADATA } from "@/shared/config/files";
import { CdmSourceType } from "@/processes/exploreReports/model/interfaces/files/CdmSourceType";

export default function metadata(data) {
  const metadataData = data[METADATA];
  const cdmsourceData: CdmSourceType = data[CDM_SOURCE];
  return {
    metadataData,
    cdmsourceData,
  };
}
