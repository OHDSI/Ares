import { SOURCE_HISTORY_INDEX } from "@/shared/config/files";

export default function domainContinuity(data) {
  return { ...data[SOURCE_HISTORY_INDEX] };
}
