import { CDM_SOURCE, METADATA } from "@/shared/config/files";

export default function metadata(data) {
  const metadataData = data[METADATA];
  const cdmsourceData = data[CDM_SOURCE];
  return {
    metadataData,
    cdmsourceData,
  };
}
