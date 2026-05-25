export type NamedParamValue =
  | string
  | number
  | boolean
  | null
  | (string | number)[];
export type NamedParams = Record<string, NamedParamValue>;

export interface QueryHistoryEntry {
  sql: string;
  startedAt: string;
  durationMs: number;
  error: string | null;
  context: string | null;
}

export interface DbPoolConfig {
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
  max?: number;
  idleTimeoutMillis?: number;
}

export interface DatabricksConfig {
  host: string;
  httpPath: string;
  token: string;
  catalog?: string;
}
