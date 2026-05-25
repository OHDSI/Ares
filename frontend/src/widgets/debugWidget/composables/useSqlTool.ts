import { ref, computed, reactive, watch, onUnmounted, type Ref } from "vue";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";

export interface RunningQuery {
  pid: number;
  query: string;
  durationSeconds: number;
  waitEventType?: string | null;
  waitEvent?: string | null;
}

export interface QueryHistoryEntry {
  sql: string;
  startedAt: string;
  durationMs: number;
  error?: string | null;
  context?: string | null;
}

export interface HistoryGroup {
  context: string;
  entries: QueryHistoryEntry[];
}

export function useSqlTool(intervalSec: Ref<number>) {
  const activeTab = ref<"live" | "history">("live");

  const queries = ref<RunningQuery[]>([]);
  const liveError = ref<string | null>(null);
  const paused = ref(false);
  const lastUpdated = ref("");
  const hasSql = computed(() => queries.value.length > 0);
  let timer: ReturnType<typeof setInterval> | null = null;

  async function fetchLive(): Promise<void> {
    if (paused.value) return;
    try {
      const res = await StrategusService.debug.getRunningQueries();
      queries.value = res.data ?? [];
      liveError.value = null;
      lastUpdated.value = new Date().toLocaleTimeString();
    } catch (e: unknown) {
      liveError.value =
        e instanceof Error ? e.message : "Failed to fetch running queries";
    }
  }

  function startPolling(): void {
    fetchLive();
    timer = setInterval(fetchLive, intervalSec.value * 1000);
  }

  function stopPolling(): void {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    queries.value = [];
    liveError.value = null;
  }

  const history = ref<QueryHistoryEntry[]>([]);
  const historyError = ref<string | null>(null);
  const historyLoading = ref(false);
  const lastHistoryFetch = ref("");
  const historyCursor = ref(0);
  const collapsedGroups = reactive(new Set<string>());
  const knownGroups = new Set<string>();
  const unreadGroups = reactive(new Set<string>());
  const newEntryKeys = reactive(new Set<string>());
  let historyTimer: ReturnType<typeof setInterval> | null = null;

  function entryKey(entry: QueryHistoryEntry): string {
    return `${entry.context ?? "Other"}|${entry.startedAt}|${(
      entry.sql ?? ""
    ).slice(0, 80)}`;
  }

  function toggleGroup(ctx: string): void {
    if (collapsedGroups.has(ctx)) {
      collapsedGroups.delete(ctx);
      unreadGroups.delete(ctx);
    } else {
      collapsedGroups.add(ctx);
    }
  }

  const groupedHistory = computed<HistoryGroup[]>(() => {
    const map = new Map<string, QueryHistoryEntry[]>();
    for (const entry of history.value) {
      const key = entry.context ?? "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    return [...map.entries()].map(([context, entries]) => ({
      context,
      entries,
    }));
  });

  async function fetchHistory(): Promise<void> {
    if (!history.value.length) historyLoading.value = true;
    historyError.value = null;
    try {
      const res = await StrategusService.debug.getQueryHistory(
        historyCursor.value,
      );
      const entries = (res.data ?? []) as QueryHistoryEntry[];
      const cursor =
        (res.meta as { cursor?: number } | undefined)?.cursor ??
        historyCursor.value;
      if (entries.length) {
        const freshKeys: string[] = [];
        for (const entry of entries) {
          const ctx = entry.context ?? "Other";
          if (!knownGroups.has(ctx)) {
            knownGroups.add(ctx);
            collapsedGroups.add(ctx);
          }
          const key = entryKey(entry);
          newEntryKeys.add(key);
          freshKeys.push(key);
          if (collapsedGroups.has(ctx)) unreadGroups.add(ctx);
        }
        setTimeout(() => {
          for (const k of freshKeys) newEntryKeys.delete(k);
        }, 1000);
        history.value = [...history.value, ...entries];
        historyCursor.value = cursor;
        lastHistoryFetch.value = new Date().toLocaleTimeString();
      }
    } catch (e: unknown) {
      historyError.value =
        e instanceof Error ? e.message : "Failed to fetch history";
    } finally {
      historyLoading.value = false;
    }
  }

  function startHistoryPolling(): void {
    fetchHistory();
    historyTimer = setInterval(fetchHistory, intervalSec.value * 1000);
  }

  function stopHistoryPolling(): void {
    if (historyTimer) {
      clearInterval(historyTimer);
      historyTimer = null;
    }
  }

  async function clearHistory(): Promise<void> {
    await StrategusService.debug.clearQueryHistory();
    history.value = [];
    historyCursor.value = 0;
    lastHistoryFetch.value = "";
    collapsedGroups.clear();
    knownGroups.clear();
    newEntryKeys.clear();
    unreadGroups.clear();
  }

  const slowSecs = 30;
  const slowRunning = ref(false);

  async function triggerSlow(): Promise<void> {
    slowRunning.value = true;
    try {
      await StrategusService.debug.triggerSlowQuery(slowSecs);
    } finally {
      setTimeout(() => {
        slowRunning.value = false;
      }, slowSecs * 1000);
    }
  }

  watch(activeTab, (tab) => {
    if (tab === "live") {
      stopHistoryPolling();
      startPolling();
    } else {
      stopPolling();
      startHistoryPolling();
    }
  });

  function start(): void {
    activeTab.value = "live";
    startPolling();
  }

  function stop(): void {
    stopPolling();
    stopHistoryPolling();
  }

  onUnmounted(stop);

  return {
    activeTab,
    queries,
    liveError,
    paused,
    lastUpdated,
    hasSql,
    history,
    historyError,
    historyLoading,
    lastHistoryFetch,
    collapsedGroups,
    unreadGroups,
    newEntryKeys,
    groupedHistory,
    slowSecs,
    slowRunning,
    entryKey,
    toggleGroup,
    fetchHistory,
    clearHistory,
    triggerSlow,
    start,
  };
}
