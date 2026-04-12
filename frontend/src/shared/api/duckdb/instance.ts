import * as duckdb from "@duckdb/duckdb-wasm";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import eh_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker: mvp_worker,
  },
  eh: {
    mainModule: duckdb_wasm_eh,
    mainWorker: eh_worker,
  },
};

const MAX_HISTORY_ENTRIES = 500;

export interface DuckDBPendingQuery {
  sql: string;
  startedAt: Date;
}

export interface DuckDBHistoryEntry {
  sql: string;
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  error: string | null;
}

/** Currently in-flight queries */
export const duckdbPendingQueries: DuckDBPendingQuery[] = [];

/** Completed queries - only written after query settles */
export const duckdbHistory: DuckDBHistoryEntry[] = [];

export function clearDuckDBLogs(): void {
  duckdbPendingQueries.splice(0, duckdbPendingQueries.length);
  duckdbHistory.splice(0, duckdbHistory.length);
}

const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);

const worker = new Worker(bundle.mainWorker!);
const logger = new duckdb.ConsoleLogger();
const db = new duckdb.AsyncDuckDB(logger, worker);
await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

const _origConnect = db.connect.bind(db);
(db as any).connect = async (): Promise<duckdb.AsyncDuckDBConnection> => {
  const conn = await _origConnect();
  const _origQuery = (conn.query as Function).bind(conn);
  (conn as any).query = async (text: string, ...rest: unknown[]) => {
    const pending: DuckDBPendingQuery = { sql: text, startedAt: new Date() };
    duckdbPendingQueries.push(pending);
    let error: string | null = null;
    try {
      return await _origQuery(text, ...rest);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      throw e;
    } finally {
      const idx = duckdbPendingQueries.indexOf(pending);
      if (idx !== -1) duckdbPendingQueries.splice(idx, 1);
      const completedAt = new Date();
      duckdbHistory.push({
        sql: text,
        startedAt: pending.startedAt,
        completedAt,
        durationMs: completedAt.getTime() - pending.startedAt.getTime(),
        error,
      });
      if (duckdbHistory.length > MAX_HISTORY_ENTRIES) {
        duckdbHistory.splice(0, duckdbHistory.length - MAX_HISTORY_ENTRIES);
      }
    }
  };
  return conn;
};

export default db;
