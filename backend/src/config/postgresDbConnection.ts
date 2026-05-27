import pg from "pg";
import { AsyncLocalStorage } from "async_hooks";
import logger from "#utils/logger.js";
import type {
  DbPoolConfig,
  NamedParams,
  QueryHistoryEntry,
} from "#types/index.js";
import type { RunningQuery } from "#types/index.js";

const { Pool } = pg;

const queryContext = new AsyncLocalStorage<string>();

export function runWithQueryContext(label: string, fn: () => void): void {
  queryContext.run(label, fn);
}

let pool: pg.Pool | null = null;

export function initDb(config: DbPoolConfig = {}): void {
  if (pool) return;

  pool = new Pool({
    host: config.host ?? process.env["PGHOST"] ?? "localhost",
    port: config.port ?? parseInt(process.env["PGPORT"] ?? "5432", 10),
    database: config.database ?? process.env["PGDATABASE"],
    user: config.user ?? process.env["PGUSER"],
    password: config.password ?? process.env["PGPASSWORD"],
    ssl:
      config.ssl ??
      (process.env["PGSSL"] === "true"
        ? { rejectUnauthorized: false }
        : undefined),
    max: config.max ?? 10,
    idleTimeoutMillis: config.idleTimeoutMillis ?? 30000,
  });

  pool.on("error", (err: Error) => {
    logger.error(`Unexpected idle client error: ${err.message ?? err}`);
  });
}

function toPositional(
  sql: string,
  params: NamedParams = {},
): { text: string; values: unknown[] } {
  const values: unknown[] = [];
  const paramIndex: Record<string, number> = {};

  const text = sql.replace(/@(\w+)/g, (_match, name: string) => {
    if (!(name in params)) throw new Error(`Missing query parameter: @${name}`);
    if (name in paramIndex) return `$${paramIndex[name]}`;
    values.push(params[name]);
    paramIndex[name] = values.length;
    return `$${values.length}`;
  });

  return { text, values };
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

function camelCaseRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(row)) {
    let val = row[key];
    if (typeof val === "string" && val !== "") {
      const num = Number(val);
      if (!isNaN(num) && String(num) === val) {
        val = num;
      }
    }
    out[snakeToCamel(key)] = val;
  }
  return out;
}

const HISTORY_MAX = 200;
const queryHistory: QueryHistoryEntry[] = [];
let historyOffset = 0;

export function getQueryHistory(): QueryHistoryEntry[] {
  return queryHistory;
}
export function getHistoryOffset(): number {
  return historyOffset;
}
export function clearQueryHistory(): void {
  queryHistory.splice(0);
  historyOffset = 0;
}

export async function queryDb(
  sql: string,
  params: NamedParams = {},
): Promise<Record<string, unknown>[]> {
  if (!pool) throw new Error("Database not initialized. Call initDb() first.");
  const { text, values } = toPositional(sql, params);
  const context = queryContext.getStore() ?? null;
  const pgText = context ? `/* ${context} */\n${text}` : text;
  const startedAt = new Date();
  let error: string | null = null;
  try {
    const result = await pool.query(pgText, values);
    return result.rows.map(camelCaseRow);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    throw err;
  } finally {
    if (!text.toLowerCase().includes("pg_stat_activity")) {
      const durationMs = Date.now() - startedAt.getTime();
      queryHistory.push({
        sql: text,
        startedAt: startedAt.toISOString(),
        durationMs,
        error,
        context: queryContext.getStore() ?? null,
      });
      if (queryHistory.length > HISTORY_MAX) {
        queryHistory.shift();
        historyOffset++;
      }
    }
  }
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function getRunningQueries(): Promise<RunningQuery[]> {
  return queryDb(`
    SELECT
      pid,
      state,
      query,
      EXTRACT(EPOCH FROM (now() - query_start))::int AS duration_seconds,
      query_start,
      application_name,
      wait_event_type,
      wait_event
    FROM pg_stat_activity
    WHERE state = 'active'
      AND query NOT ILIKE '%pg_stat_activity%'
      AND pid <> pg_backend_pid()
    ORDER BY query_start ASC
  `) as unknown as Promise<RunningQuery[]>;
}
