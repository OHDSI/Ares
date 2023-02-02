import { SOURCE_HISTORY_INDEX } from "@/shared/config/files";
import { SourceHistoryIndex } from "@/processes/exploreReports/model/interfaces/files/SourceHistoryIndex";

export default function domainContinuity(data) {
  const historyIndex: SourceHistoryIndex[] = data[SOURCE_HISTORY_INDEX];
  return { ...historyIndex };
}
