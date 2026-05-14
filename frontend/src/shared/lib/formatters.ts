// Number formatters

export function formatComma(value: number): string {
  return isNaN(parseFloat(`${value}`)) ? "N/A" : value.toLocaleString("en-US");
}

/** General-purpose percentage. Expects a fraction (0.5 -> "50.0%"). */
export function formatPercent(value: number): string {
  return isNaN(value) ? "N/A" : `${(value * 100).toFixed(1)}%`;
}

/** Generic decimal, 2 places. Null/NaN -> "N/A". */
export function formatNum(val: number | string | null | undefined): string {
  if (val === null || val === undefined) return "N/A";
  if (typeof val === "string") return val;
  return isNaN(val) ? "N/A" : val.toFixed(2);
}

/**
 * Decimal with censoring. Negative values indicate a suppressed minimum-threshold
 * result and display as the fallback label (default "< MT"). Null/NaN -> "N/A".
 */
export function formatNumCensored(
  val: number | null | undefined,
  fallback = "< MT"
): string {
  if (val === null || val === undefined || isNaN(val)) return "N/A";
  return val >= 0 ? val.toFixed(2) : fallback;
}

/**
 * Integer-style censored display. Negative values -> "< abs(val)".
 * Null/NaN -> fallback (default "< MT").
 */
export function formatCensored(
  val: number | null | undefined,
  fallback = "< MT"
): string | number {
  if (val === null || val === undefined || isNaN(val)) return fallback;
  return val >= 0 ? val : `< ${Math.abs(val)}`;
}

/**
 * Count display. Negative values -> fallback (default "< MT"). Null/NaN -> "N/A".
 */
export function formatCount(
  val: number | null | undefined,
  fallback = "< MT"
): string | number {
  if (val === null || val === undefined || isNaN(val)) return "N/A";
  return val >= 0 ? val : fallback;
}

/** Percentage, 2 decimal places. Expects a fraction (0.5 -> "50.00%"). Null/NaN -> "N/A". */
export function formatPct(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "N/A";
  return `${(val * 100).toFixed(2)}%`;
}

/**
 * Statistical percentage with censoring. Negative values (below minimum threshold)
 * display as fallback (default "< MT"). Expects a fraction (0.5 -> "50.00 %").
 * Null/NaN -> "N/A".
 */
export function formatPercentStat(
  val: number | null | undefined,
  fallback = "< MT"
): string {
  if (val === null || val === undefined || isNaN(val)) return "N/A";
  return val >= 0 ? `${(val * 100).toFixed(2)} %` : fallback;
}

/** Standardized Mean Difference, 2 decimal places. Null/NaN -> "N/A". */
export function formatSmd(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "N/A";
  return val.toFixed(2);
}

/** Large-number suffix formatter: 1234 -> "1.23k", 1_500_000 -> "1.50m". NaN -> "N/A". */
export function kmbFormatter(v: number): string {
  if (isNaN(v)) return "N/A";
  if (v === 0) return "0";
  const abs = Math.abs(v);
  const ranges = [
    { divider: 1e9, suffix: "b" },
    { divider: 1e6, suffix: "m" },
    { divider: 1e3, suffix: "k" },
  ];
  for (const { divider, suffix } of ranges) {
    if (abs >= divider) {
      const num = v / divider;
      return num >= 100
        ? `${num.toFixed(0)}${suffix}`
        : num >= 10
        ? `${num.toFixed(1)}${suffix}`
        : `${num.toFixed(2)}${suffix}`;
    }
  }
  return v.toString();
}

// Date / time formatters

/** Parses a "YYYYMM" string (e.g. "202001") into a Date (Jan 2020). */
export function parseYearMonth(s: string | number): Date {
  const str = String(s);
  return new Date(+str.slice(0, 4), +str.slice(4, 6) - 1);
}

export function padTo2Digits(num: number): string {
  return num.toString().padStart(2, "0");
}

export function getPaddedDate(date: Date, divider: string): string {
  return [
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
  ].join(divider);
}

/** Locale date string (e.g. "Apr 12, 2026"). Null/invalid -> "". */
export function formatDate(val: string | null | undefined): string {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(val: string | null | undefined): string {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Timestamp (ISO string or Date) -> locale time string. Null/empty -> fallback (default "—"). */
export function formatTime(
  ts: string | Date | null | undefined,
  fallback = "—"
): string {
  if (!ts) return fallback;
  return new Date(ts).toLocaleTimeString();
}

/** @alias formatTime with empty-string fallback, for log entry timestamps. */
export function formatLogTime(ts: string | Date | null | undefined): string {
  return formatTime(ts, "");
}

/** Milliseconds -> "HH:MM:SS" string (e.g. for elapsed-time display in charts). */
export function formatTimestamp(ms: number): string {
  return [
    padTo2Digits(Math.floor((ms / (1000 * 60 * 60)) % 24)),
    padTo2Digits(Math.floor((ms / (1000 * 60)) % 60)),
    padTo2Digits(Math.floor((ms / 1000) % 60)),
  ].join(":");
}

/**
 * SI-prefix number formatter with 3 significant figures (e.g. 1234 -> "1.23k",
 * 1_500_000_000 -> "1.50B").
 */
export function formatSI(count: number): string {
  const abs = Math.abs(count);
  const tiers = [
    { threshold: 1e12, suffix: "T" },
    { threshold: 1e9, suffix: "B" },
    { threshold: 1e6, suffix: "M" },
    { threshold: 1e3, suffix: "k" },
  ];
  for (const { threshold, suffix } of tiers) {
    if (abs >= threshold) {
      const scaled = count / threshold;
      const fixed =
        Math.abs(scaled) >= 100
          ? scaled.toFixed(0)
          : Math.abs(scaled) >= 10
          ? scaled.toFixed(1)
          : scaled.toFixed(2);
      return `${fixed}${suffix}`;
    }
  }
  return String(count);
}

// Duration formatters

export function formatDurationSec(secs: number | null | undefined): string {
  if (secs === null || secs === undefined) return "—";
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

export function formatDurationMs(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

export function durationClass(secs: number | null | undefined): string {
  if (secs === null || secs === undefined) return "";
  if (secs >= 30) return "duration-slow";
  if (secs >= 10) return "duration-medium";
  return "duration-fast";
}

/** @alias durationClass operating on milliseconds instead of seconds. */
export function durationClassMs(ms: number | null | undefined): string {
  return ms === null || ms === undefined ? "" : durationClass(ms / 1000);
}

// SQL / debug formatters

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

// Misc formatters

/** ISO 4217 currency code -> currency symbol (e.g. "USD" -> "$"). */
export function isoToSymbol(code: string | null | undefined): string {
  if (!code) return "$";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: code,
    currencyDisplay: "symbol",
    minimumFractionDigits: 0,
  })
    .format(0)
    .replace(/\d|[.,\s]/g, "");
}
