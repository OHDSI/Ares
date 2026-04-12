import { ref, nextTick, onUnmounted, type Ref } from "vue";
import { StrategusService } from "@/shared/api/aresApi/services/strategusService";

export interface LogEntry {
  level: "info" | "debug" | "http" | "warn" | "error" | string;
  timestamp: string;
  message: string;
}

export function useLogsTool(intervalSec: Ref<number>) {
  const logsEntries = ref<LogEntry[]>([]);
  const logsError = ref<string | null>(null);
  const logsPaused = ref(false);
  const logsLastUpdated = ref("");
  const logsCursor = ref(0);
  const logsListRef = ref<HTMLElement | null>(null);
  let logsTimer: ReturnType<typeof setInterval> | null = null;

  async function fetchLogs(): Promise<void> {
    if (logsPaused.value) return;
    try {
      const res = await StrategusService.debug.getLogs(logsCursor.value);
      const { entries, cursor } = res.data as {
        entries: LogEntry[];
        cursor: number;
      };
      if (entries?.length) {
        logsEntries.value.push(...entries);
        logsCursor.value = cursor;
        logsError.value = null;
        logsLastUpdated.value = new Date().toLocaleTimeString();
        await nextTick();
        if (logsListRef.value) {
          logsListRef.value.scrollTop = logsListRef.value.scrollHeight;
        }
      }
    } catch (e: unknown) {
      logsError.value = e instanceof Error ? e.message : "Failed to fetch logs";
    }
  }

  function start(): void {
    fetchLogs();
    logsTimer = setInterval(fetchLogs, intervalSec.value * 1000);
  }

  function stop(): void {
    if (logsTimer) {
      clearInterval(logsTimer);
      logsTimer = null;
    }
  }

  async function clearLogs(): Promise<void> {
    await StrategusService.debug.clearLogs();
    logsEntries.value = [];
    logsCursor.value = 0;
    logsLastUpdated.value = "";
    logsError.value = null;
  }

  onUnmounted(stop);

  return {
    logsEntries,
    logsError,
    logsPaused,
    logsLastUpdated,
    logsListRef,
    start,
    clearLogs,
  };
}
