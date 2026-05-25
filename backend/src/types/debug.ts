export interface RunningQuery {
  pid: number;
  state: string;
  query: string;
  durationSeconds: number;
  queryStart: string;
  applicationName: string;
  waitEventType: string | null;
  waitEvent: string | null;
}

export interface LogEntry {
  level: "http" | "error" | "warn" | "info" | "debug" | string;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

export interface SlowQueryResponse {
  message: string;
}
