export function formatDurationSec(secs: number | null | undefined): string {
  if (secs == null) return "—";
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

export function formatDurationMs(ms: number | null | undefined): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString();
}

export function formatLogTime(ts: string | Date | null | undefined): string {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString();
}

export function durationClass(secs: number | null | undefined): string {
  if (secs == null) return "";
  if (secs >= 30) return "duration-slow";
  if (secs >= 10) return "duration-medium";
  return "duration-fast";
}

export function durationClassMs(ms: number | null | undefined): string {
  if (ms == null) return "";
  if (ms >= 30000) return "duration-slow";
  if (ms >= 10000) return "duration-medium";
  return "duration-fast";
}

export function extractContext(
  query: string | null | undefined
): string | null {
  const m = query?.match(/^\/\*\s*(.+?)\s*\*\//);
  return m ? m[1] : null;
}

export function stripContext(query: string | null | undefined): string {
  return query?.replace(/^\/\*[^*]*\*\/\s*\n?/, "") ?? "";
}

export function formatSql(raw: string | null | undefined): string {
  if (!raw) return "";
  const s = raw.replace(/\s+/g, " ").trim();
  return s
    .replace(
      /\b(SELECT|FROM|WHERE|INNER JOIN|LEFT JOIN|RIGHT JOIN|FULL OUTER JOIN|JOIN|ON|AND|OR|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET|WITH|UNION ALL|UNION|INSERT INTO|INSERT|UPDATE|DELETE|SET|VALUES|CASE|WHEN|THEN|ELSE|END)\b/g,
      "\n$1"
    )
    .replace(/,(?!\s*\n)/g, ",\n  ")
    .replace(/^\n/, "")
    .trim();
}
