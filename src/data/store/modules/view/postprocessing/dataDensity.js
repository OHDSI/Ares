import {
  DENSITY_RECORDS_PERSON,
  DENSITY_TOTAL,
} from "@/data/services/getFilePath";

export default function dataDensity(data) {
  return {
    domainDensity: data[DENSITY_TOTAL],
    domainRecords: data[DENSITY_RECORDS_PERSON],
  };
}
