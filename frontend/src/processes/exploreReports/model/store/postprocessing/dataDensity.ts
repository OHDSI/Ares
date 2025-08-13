import { DENSITY_RECORDS_PERSON, DENSITY_TOTAL } from "@/shared/config/files";
import { DensityTotal } from "@/processes/exploreReports/model/interfaces/files/DensityTotal";
import { DensityRecordsPersonType } from "@/processes/exploreReports/model/interfaces/files/DensityRecordsPersonType";

export default function dataDensity(data) {
  const densityTotal: DensityTotal[] = data[DENSITY_TOTAL];
  const densityRecordsPerson: DensityRecordsPersonType[] =
    data[DENSITY_RECORDS_PERSON];
  return {
    domainDensity: densityTotal,
    domainRecords: densityRecordsPerson,
  };
}
