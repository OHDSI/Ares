import pg from 'pg';
import { AsyncLocalStorage } from 'async_hooks';

const { Pool } = pg;

const queryContext = new AsyncLocalStorage();

/**
 * Run `fn` with a query-context label that will be attached to every query
 * logged inside that async call chain.
 * @param {string} label
 * @param {Function} fn
 */
export function runWithQueryContext(label, fn) {
    return queryContext.run(label, fn);
}

let pool = null;

/**
 * @param {object} [config] - pg Pool config. Falls back to env vars:
 *   PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, PGSSL
 */
export function initDb(config = {}) {
    if (pool) return;

    pool = new Pool({
        host: config.host ?? process.env.PGHOST ?? 'localhost',
        port: config.port ?? parseInt(process.env.PGPORT ?? '5432', 10),
        database: config.database ?? process.env.PGDATABASE,
        user: config.user ?? process.env.PGUSER,
        password: config.password ?? process.env.PGPASSWORD,
        ssl: config.ssl ?? (process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined),
        max: config.max ?? 10,
        idleTimeoutMillis: config.idleTimeoutMillis ?? 30000,
    });

    pool.on('error', (err) => {
        console.error('Unexpected idle client error:', err);
    });
}

function toPositional(sql, params = {}) {
    const values = [];
    const paramIndex = {};

    const text = sql.replace(/@(\w+)/g, (match, name) => {
        if (!(name in params)) throw new Error(`Missing query parameter: @${name}`);
        if (name in paramIndex) return `$${paramIndex[name]}`;
        values.push(params[name]);
        paramIndex[name] = values.length;
        return `$${values.length}`;
    });

    return { text, values };
}

function snakeToCamel(str) {
    return str.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function camelCaseRow(row) {
    const out = {};
    for (const key of Object.keys(row)) {
        let val = row[key];
        // pg returns NUMERIC/DECIMAL columns as strings to preserve precision.
        // Coerce to number when the value is a numeric string.
        if (typeof val === 'string' && val !== '' && !isNaN(val) && !isNaN(parseFloat(val))) {
            val = Number(val);
        }
        out[snakeToCamel(key)] = val;
    }
    return out;
}

const HISTORY_MAX = 200;
const queryHistory = [];
let historyOffset = 0;

export function getQueryHistory() { return queryHistory; }
export function getHistoryOffset() { return historyOffset; }
export function clearQueryHistory() { queryHistory.splice(0); historyOffset = 0; }

/**
 * @param {string} sql - SQL with @namedParam placeholders
 * @param {object} [params] - { paramName: value }
 * @returns {Promise<object[]>} - rows with camelCase keys
 */
export async function queryDb(sql, params = {}) {
    if (!pool) throw new Error('Database not initialized. Call initDb() first.');
    const { text, values } = toPositional(sql, params);
    const context = queryContext.getStore() ?? null;
    // Annotate the SQL sent to pg so pg_stat_activity carries the context label.
    const pgText = context ? `/* ${context} */\n${text}` : text;
    const startedAt = new Date();
    let error = null;
    try {
        const result = await pool.query(pgText, values);
        return result.rows.map(camelCaseRow);
    } catch (err) {
        error = err.message ?? String(err);
        throw err;
    } finally {
        if (!text.toLowerCase().includes('pg_stat_activity')) {
            const durationMs = Date.now() - startedAt.getTime();
            queryHistory.push({
                sql: text,
                startedAt: startedAt.toISOString(),
                durationMs,
                error,
                context: queryContext.getStore() ?? null,
            });
            if (queryHistory.length > HISTORY_MAX) { queryHistory.shift(); historyOffset++; }
        }
    }
}


export async function closeDb() {
    if (pool) {
        await pool.end();
        pool = null;
    }
}

export const connectionHandler = { queryDb };