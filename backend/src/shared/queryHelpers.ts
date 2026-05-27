import { queryDb } from "#config/db.js";
import logger from "#utils/logger.js";
import type { NamedParams } from "#types/index.js";

export function addOptionalClause(condition: boolean, clause: string): string {
  return condition ? clause : "";
}

export function toArray<T>(v: T | T[]): T[] {
  return Array.isArray(v) ? v : [v];
}

export function buildInClause(
  prefix: string,
  values: (string | number)[],
  params: NamedParams,
): string {
  const keys = values.map((_, i) => `@${prefix}${i}`);
  values.forEach((v, i) => {
    params[`${prefix}${i}`] = v;
  });
  return keys.join(",");
}

export function addFilterParam(
  values: (string | number)[] | null | undefined,
  clause: (inClause: string) => string,
  prefix: string,
  params: NamedParams,
): string {
  if (!values?.length) return "";
  const keys = values.map((_, i) => `@${prefix}${i}`);
  values.forEach((v, i) => {
    params[`${prefix}${i}`] = v;
  });
  return clause(keys.join(","));
}

export function addArrayParams(
  values: (string | number)[],
  prefix: string,
  params: NamedParams,
): void {
  values.forEach((v, i) => {
    params[`${prefix}${i}`] = v;
  });
}

export async function safeQuery(
  sql: string,
  params: NamedParams = {},
): Promise<Record<string, unknown>[] | null> {
  try {
    return await queryDb(sql, params);
  } catch (e) {
    logger.warn(
      `safeQuery failed: ${e instanceof Error ? e.message : String(e)}`,
    );
    return null;
  }
}

export function parseIntParam(val: string | undefined | null): number | null {
  if (val === null || val === undefined || val === "") return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

export function parseFloatParam(val: string | undefined | null): number | null {
  if (val === null || val === undefined || val === "") return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

export function parseIntList(val: string): number[] {
  return val.split(",").map(Number).filter(Number.isFinite) as number[];
}

export function pivotType(
  rows: Record<string, unknown>[],
  fillCols: string[] = [],
): Record<string, unknown>[] {
  const map = new Map<string, Record<string, unknown>>();
  for (const r of rows) {
    const key = `${r["cohortDefinitionId"]}|${r["cohortName"]}`;
    if (!map.has(key))
      map.set(key, {
        cohortName: r["cohortName"],
        cohortDefinitionId: r["cohortDefinitionId"],
      });
    (map.get(key) as Record<string, unknown>)[r["type"] as string] = r["value"];
  }
  const result = [...map.values()];
  for (const row of result) {
    for (const col of fillCols) {
      if (row[col] === null || row[col] === undefined) row[col] = 0;
    }
  }
  return result;
}
