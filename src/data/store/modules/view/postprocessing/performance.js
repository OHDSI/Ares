import { ACHILLES_PERFORMANCE } from "@/data/services/getFilePath";

export default function performance(data) {
  return {
    domainTable: data[ACHILLES_PERFORMANCE],
  };
}
