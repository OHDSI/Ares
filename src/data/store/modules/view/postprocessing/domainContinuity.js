import { SOURCE_HISTORY_INDEX } from "@/data/services/getFilePath";

export default function domainContinuity(data) {
  return { ...data[SOURCE_HISTORY_INDEX] };
}
