import { ref, onUnmounted, type Ref } from "vue";
import {
  duckdbHistory,
  duckdbPendingQueries,
  clearDuckDBLogs,
  type DuckDBPendingQuery,
  type DuckDBHistoryEntry,
} from "@/shared/api/duckdb/instance";

export type { DuckDBPendingQuery, DuckDBHistoryEntry };

export function useDuckdbTool(intervalSec: Ref<number>) {
  const duckdbLiveQueries = ref<DuckDBPendingQuery[]>([]);
  const duckdbHistoryEntries = ref<DuckDBHistoryEntry[]>([]);
  const duckdbActiveTab = ref<"live" | "history">("live");
  const duckdbPaused = ref(false);
  const duckdbHistoryCursor = ref(0);
  const duckdbLastUpdated = ref("");
  let duckdbTimer: ReturnType<typeof setInterval> | null = null;

  function fetchDuckdbLogs(): void {
    if (duckdbPaused.value) return;
    duckdbLiveQueries.value = [...duckdbPendingQueries];
    const newEntries = duckdbHistory.slice(duckdbHistoryCursor.value);
    if (newEntries.length) {
      duckdbHistoryEntries.value.push(...newEntries);
      duckdbHistoryCursor.value = duckdbHistory.length;
      duckdbLastUpdated.value = new Date().toLocaleTimeString();
    }
  }

  function start(): void {
    duckdbActiveTab.value = "live";
    fetchDuckdbLogs();
    duckdbTimer = setInterval(fetchDuckdbLogs, intervalSec.value * 1000);
  }

  function stop(): void {
    if (duckdbTimer) {
      clearInterval(duckdbTimer);
      duckdbTimer = null;
    }
  }

  function clearDuckdbPanel(): void {
    clearDuckDBLogs();
    duckdbLiveQueries.value = [];
    duckdbHistoryEntries.value = [];
    duckdbHistoryCursor.value = 0;
    duckdbLastUpdated.value = "";
  }

  onUnmounted(stop);

  return {
    duckdbLiveQueries,
    duckdbHistoryEntries,
    duckdbActiveTab,
    duckdbPaused,
    duckdbLastUpdated,
    start,
    clearDuckdbPanel,
  };
}
