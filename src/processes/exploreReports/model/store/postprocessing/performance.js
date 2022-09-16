import { ACHILLES_PERFORMANCE } from "@/shared/config/files";

export default function performance(data) {
  return {
    domainTable: data[ACHILLES_PERFORMANCE],
  };
}
