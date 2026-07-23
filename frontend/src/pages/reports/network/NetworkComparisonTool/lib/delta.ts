import type { ComparisonMetric } from "@/processes/exploreReports/config/viewRegistry";

export interface DeltaResult {
  raw: unknown;
  delta?: number;
  deltaPercent?: number;
  deltaPoints?: number;
  differs?: boolean;
}

export function computeDelta(
  referenceRow: Record<string, unknown> | null | undefined,
  comparatorRow: Record<string, unknown> | null | undefined,
  metric: ComparisonMetric,
): DeltaResult {
  const raw = comparatorRow?.[metric.value];

  if (metric.type === "categorical") {
    const refRaw = referenceRow?.[metric.value];
    return {
      raw,
      differs:
        refRaw !== undefined &&
        refRaw !== null &&
        raw !== undefined &&
        raw !== null &&
        raw !== refRaw,
    };
  }

  const numVal = Number(raw);
  const refNum = Number(referenceRow?.[metric.value]);

  if (
    raw === undefined ||
    raw === null ||
    raw === "" ||
    isNaN(numVal) ||
    referenceRow == null ||
    isNaN(refNum)
  ) {
    return { raw };
  }

  if (metric.unit === "percent") {
    return { raw, deltaPoints: (numVal - refNum) * 100 };
  }

  const delta = numVal - refNum;
  const deltaPercent = refNum !== 0 ? (delta / refNum) * 100 : undefined;
  return { raw, delta, deltaPercent };
}

export function deltaColor(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value) || value === 0) {
    return "";
  }
  return value > 0
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";
}

function signPrefix(value: number): string {
  return value > 0 ? "+" : "";
}

export function formatDelta(
  value: number | undefined,
  processingFunction?: (value: any) => string,
): string {
  if (value === undefined || value === null || isNaN(value)) return "N/A";
  const magnitude = processingFunction
    ? processingFunction(Math.abs(value))
    : Math.abs(value).toLocaleString();
  return `${value < 0 ? "-" : signPrefix(value)}${magnitude}`;
}

export function formatDeltaPercent(value: number | undefined): string {
  if (value === undefined || value === null || isNaN(value)) return "N/A";
  return `${signPrefix(value)}${value.toFixed(1)}%`;
}

export function formatDeltaPoints(value: number | undefined): string {
  if (value === undefined || value === null || isNaN(value)) return "N/A";
  return `${signPrefix(value)}${value.toFixed(1)}pp`;
}
