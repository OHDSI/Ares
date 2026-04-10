// Censored value: null → fallback string, negative → "< abs"
export function formatCensored(
  val: number | null | undefined
): string | number {
  if (val == null) return "< MT";
  return val >= 0 ? val : `< ${Math.abs(val)}`;
}

// Percentage with 2 decimal places (CaseSeries, RiskFactors)
export function formatPct(val: number | null | undefined): string {
  if (val == null) return "";
  return `${(val * 100).toFixed(1)}%`;
}

// Percentage with 1 decimal place + space (CohortComparison, DatabaseComparison)
export function formatPercent(val: number | null | undefined): string {
  if (val == null) return "";
  return val >= 0 ? `${(val * 100).toFixed(1)} %` : "< MT";
}

// Censored count (CohortComparison, DatabaseComparison)
export function formatCount(val: number | null | undefined): string | number {
  if (val == null) return "";
  return val >= 0 ? val : "< MT";
}

// SMD value with 3 decimal places (CohortComparison)
export function formatSmd(val: number | null | undefined): string {
  if (val == null) return "";
  return val.toFixed(3);
}

// Generic number, 2 decimal places (CaseSeries, RiskFactors)
export function formatNum(val: number | string | null | undefined): string {
  if (val == null) return "";
  return typeof val === "number" ? val.toFixed(2) : val;
}
