import { DBSQLClient } from "@databricks/sql";
import { AsyncLocalStorage } from "async_hooks";
import logger from "#utils/logger.js";
import type {
  DatabricksConfig,
  NamedParams,
  QueryHistoryEntry,
} from "#types/index.js";
import type { RunningQuery } from "#types/index.js";

type DBSQLConnection = Awaited<
  ReturnType<InstanceType<typeof DBSQLClient>["connect"]>
>;
type DBSQLSession = Awaited<ReturnType<DBSQLConnection["openSession"]>>;

const queryContext = new AsyncLocalStorage<string>();

export function runWithQueryContext(label: string, fn: () => void): void {
  queryContext.run(label, fn);
}

let _config: DatabricksConfig | null = null;
let _client: DBSQLConnection | null = null;
let _sessionPromise: Promise<DBSQLSession> | null = null;

export function initDb(config: DatabricksConfig): void {
  _config = config;
}

async function openSession(): Promise<DBSQLSession> {
  if (!_config)
    throw new Error("Databricks not initialized. Call initDb() first.");
  const raw = new DBSQLClient();
  _client = await raw.connect({
    host: _config.host,
    path: _config.httpPath,
    token: _config.token,
  });
  return _client.openSession({
    ...(_config.catalog ? { initialCatalog: _config.catalog } : {}),
  });
}

function getSession(): Promise<DBSQLSession> {
  if (!_sessionPromise) {
    _sessionPromise = openSession().catch((err: unknown) => {
      _sessionPromise = null;
      throw err;
    });
  }
  return _sessionPromise;
}

function toPositional(
  sql: string,
  params: NamedParams = {},
): { text: string; values: unknown[] } {
  const values: unknown[] = [];
  const text = sql.replace(/@(\w+)/g, (_match, name: string) => {
    if (!(name in params)) throw new Error(`Missing query parameter: @${name}`);
    values.push(params[name]);
    return "?";
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
      if (!isNaN(num) && String(num) === val) val = num;
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

interface RunningEntry {
  startedAt: Date;
  sql: string;
  context: string | null;
}

let _queryCounter = 0;
const _runningQueries = new Map<number, RunningEntry>();

export async function getRunningQueries(): Promise<RunningQuery[]> {
  const now = Date.now();
  return [..._runningQueries.entries()].map(([id, entry]) => ({
    pid: id,
    state: "active",
    query: entry.sql,
    durationSeconds: Math.floor((now - entry.startedAt.getTime()) / 1000),
    queryStart: entry.startedAt.toISOString(),
    applicationName: entry.context ?? "",
    waitEventType: null,
    waitEvent: null,
  }));
}

export async function queryDb(
  sql: string,
  params: NamedParams = {},
): Promise<Record<string, unknown>[]> {
  const session = await getSession();
  const { text, values } = toPositional(sql, params);
  const context = queryContext.getStore() ?? null;
  const annotatedSql = context ? `/* ${context} */\n${text}` : text;
  const startedAt = new Date();
  const id = ++_queryCounter;

  _runningQueries.set(id, { startedAt, sql: text, context });

  let error: string | null = null;
  try {
    const operation = await session.executeStatement(annotatedSql, {
      ordinalParameters: values,
    });
    const rows = (await operation.fetchAll()) as Record<string, unknown>[];
    await operation.close();
    return rows.map(camelCaseRow);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    throw err;
  } finally {
    _runningQueries.delete(id);
    const durationMs = Date.now() - startedAt.getTime();
    queryHistory.push({
      sql: text,
      startedAt: startedAt.toISOString(),
      durationMs,
      error,
      context,
    });
    if (queryHistory.length > HISTORY_MAX) {
      queryHistory.shift();
      historyOffset++;
    }
  }
}

export async function closeDb(): Promise<void> {
  _sessionPromise = null;
  if (_client) {
    await _client.close();
    _client = null;
  }
  logger.info("Databricks session closed");
}
