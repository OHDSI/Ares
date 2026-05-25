import { queryDb } from "#config/db.js";
import logger from "#utils/logger.js";
import { getCohortDefinitions, extractSubsetCohorts } from "../cohorts.js";
import { getAdapter } from "./adapters/registry.js";
import type { TargetTableOptions, OutcomeTableOptions } from "#types/index.js";

type Row = Record<string, unknown>;

const ANALYSIS_COLUMNS = [
  "timeToEvent",
  "dechalRechal",
  "riskFactors",
  "databaseComparator",
  "cohortComparator",
  "caseSeries",
  "cohortMethod",
  "selfControlledCaseSeries",
  "prediction",
  "cohortIncidence",
];

const OUTCOME_ANALYSIS_COLUMNS = [
  "timeToEvent",
  "dechalRechal",
  "riskFactors",
  "caseSeries",
  "cohortMethod",
  "selfControlledCaseSeries",
  "prediction",
  "cohortIncidence",
];

function leftMerge(
  left: Row[],
  right: Row[],
  leftKeys: string[],
  rightKeys: string[],
): Row[] {
  const index = new Map<string, Row>();
  for (const r of right) {
    const key = rightKeys.map((k) => r[k]).join("|");
    index.set(key, r);
  }
  return left.map((l) => {
    const key = leftKeys.map((k) => l[k]).join("|");
    const match = index.get(key);
    return match ? { ...l, ...match } : { ...l };
  });
}

function fillNulls(rows: Row[]): void {
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (row[key] === null || row[key] === undefined) row[key] = 0;
    }
  }
}

function ensureColumns(rows: Row[], columns: string[]): void {
  for (const row of rows) {
    for (const col of columns) {
      if (row[col] === null || row[col] === undefined) row[col] = 0;
    }
  }
}

function summarizeCounts(rawCounts: Row[]): Row[] {
  const groups = new Map<number, Row[]>();
  for (const r of rawCounts) {
    const id = r["cohortId"] as number;
    if (!groups.has(id)) groups.set(id, []);
    (groups.get(id) as Row[]).push(r);
  }

  const result: Row[] = [];
  for (const [cohortId, rows] of groups) {
    const dbNames = [...new Set(rows.map((r) => r["databaseName"] as string))];
    const dbIds = [...new Set(rows.map((r) => r["databaseId"] as string))];
    const subjects = rows.map((r) => r["cohortSubjects"] as number);
    const entries = rows.map((r) => r["cohortEntries"] as number);

    result.push({
      cohortId,
      numDatabase: dbNames.length,
      databaseString: dbNames.join(", "),
      databaseIdString: dbIds.join(", "),
      databaseStringCount: [
        ...new Set(
          rows.map((r) => `${r["databaseName"]} (${r["cohortSubjects"]})`),
        ),
      ].join(", "),
      minSubjectCount: Math.min(...subjects),
      maxSubjectCount: Math.max(...subjects),
      minEntryCount: Math.min(...entries),
      maxEntryCount: Math.max(...entries),
    });
  }
  return result;
}

async function fetchCohortCountsRaw(
  schema: string,
  cgTablePrefix: string,
  databaseTable: string,
): Promise<Row[]> {
  const sql = `
    SELECT
      dt.cdm_source_abbreviation AS database_name,
      cc.*
    FROM ${schema}.${cgTablePrefix}cohort_count cc
    INNER JOIN ${schema}.${databaseTable} dt
      ON cc.database_id = dt.database_id
  `;
  return queryDb(sql);
}

async function safeCall<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (e) {
    logger.warn((e as Error).message);
    return null;
  }
}

export async function getTargetTable({
  schema,
  cgTablePrefix = "cg_",
  cTablePrefix = "c_",
  ciTablePrefix = "ci_",
  cmTablePrefix = "cm_",
  sccsTablePrefix = "sccs_",
  plpTablePrefix = "plp_",
  databaseTable = "database_meta_data",
  getIncidenceInclusion = true,
  getCharacterizationInclusion = true,
  getPredictionInclusion = true,
  getCohortMethodInclusion = true,
  getSccsInclusion = true,
}: TargetTableOptions): Promise<Row[]> {
  const cohorts = (await getCohortDefinitions({ schema })).map((r) => ({
    cohortId: r["cohortDefinitionId"],
    cohortName: r["cohortName"],
    subsetParent: r["subsetParent"],
    subsetDefinitionId: r["subsetDefinitionId"],
    subsetDefinitionJson: r["subsetDefinitionJson"],
  })) as Row[];

  for (const c of cohorts) {
    c["subsetCohortId"] = extractSubsetCohorts(
      c["subsetDefinitionJson"] as string | null,
    );
  }

  const parents = new Map<number, string>();
  for (const c of cohorts) {
    if (c["cohortId"] === c["subsetParent"]) {
      parents.set(c["cohortId"] as number, c["cohortName"] as string);
    }
  }
  for (const c of cohorts) {
    c["parentName"] = parents.get(c["subsetParent"] as number) ?? null;
  }

  const rawCounts = await fetchCohortCountsRaw(
    schema,
    cgTablePrefix,
    databaseTable,
  );
  const counts = summarizeCounts(rawCounts);

  let cohortCounts = leftMerge(
    cohorts,
    counts,
    ["cohortId"],
    ["cohortId"],
  ).filter((r) => r["numDatabase"] !== null && r["numDatabase"] !== undefined);

  const adapter = await getAdapter(schema);

  if (getIncidenceInclusion) {
    const inc = await safeCall(() =>
      adapter.getIncidenceTargets({ schema, cgTablePrefix, ciTablePrefix }),
    );
    if (inc)
      cohortCounts = leftMerge(
        cohortCounts,
        inc,
        ["cohortId", "cohortName"],
        ["cohortDefinitionId", "cohortName"],
      );
  }

  if (getCharacterizationInclusion) {
    const char = await safeCall(() =>
      adapter.getCharacterizationTargets({
        schema,
        cgTablePrefix,
        cTablePrefix,
      }),
    );
    if (char)
      cohortCounts = leftMerge(
        cohortCounts,
        char,
        ["cohortId", "cohortName"],
        ["cohortDefinitionId", "cohortName"],
      );
  }

  if (getPredictionInclusion) {
    const pred = await safeCall(() =>
      adapter.getPredictionTargets({ schema, cgTablePrefix, plpTablePrefix }),
    );
    if (pred)
      cohortCounts = leftMerge(
        cohortCounts,
        pred,
        ["cohortId", "cohortName"],
        ["cohortDefinitionId", "cohortName"],
      );
  }

  if (getCohortMethodInclusion) {
    const cm = await safeCall(() =>
      adapter.getCmTargets({ schema, cgTablePrefix, cmTablePrefix }),
    );
    if (cm)
      cohortCounts = leftMerge(
        cohortCounts,
        cm,
        ["cohortId", "cohortName"],
        ["cohortDefinitionId", "cohortName"],
      );
  }

  if (getSccsInclusion) {
    const sccs = await safeCall(() =>
      adapter.getSccsTargets({ schema, cgTablePrefix, sccsTablePrefix }),
    );
    if (sccs)
      cohortCounts = leftMerge(
        cohortCounts,
        sccs,
        ["cohortId", "cohortName"],
        ["cohortDefinitionId", "cohortName"],
      );
  }

  fillNulls(cohortCounts);
  ensureColumns(cohortCounts, ANALYSIS_COLUMNS);

  cohortCounts.sort(
    (a, b) =>
      String(a["parentName"] ?? "").localeCompare(
        String(b["parentName"] ?? ""),
      ) ||
      String(a["cohortName"] ?? "").localeCompare(
        String(b["cohortName"] ?? ""),
      ),
  );

  return cohortCounts;
}

export async function getOutcomeTable({
  schema,
  cgTablePrefix = "cg_",
  cTablePrefix = "c_",
  ciTablePrefix = "ci_",
  cmTablePrefix = "cm_",
  sccsTablePrefix = "sccs_",
  plpTablePrefix = "plp_",
  databaseTable = "database_meta_data",
  targetId = null,
  getIncidenceInclusion = true,
  getCharacterizationInclusion = true,
  getPredictionInclusion = true,
  getCohortMethodInclusion = true,
  getSccsInclusion = true,
}: OutcomeTableOptions): Promise<Row[]> {
  const adapter = await getAdapter(schema);

  const [rawCohorts, rawCounts, inc, char, pred, cm, sccs] = await Promise.all([
    getCohortDefinitions({ schema }),
    fetchCohortCountsRaw(schema, cgTablePrefix, databaseTable),
    getIncidenceInclusion
      ? safeCall(() =>
          adapter.getIncidenceOutcomes({
            schema,
            cgTablePrefix,
            ciTablePrefix,
            targetId,
          }),
        )
      : null,
    getCharacterizationInclusion
      ? safeCall(() =>
          adapter.getCharacterizationOutcomes({
            schema,
            cgTablePrefix,
            cTablePrefix,
            targetId,
          }),
        )
      : null,
    getPredictionInclusion
      ? safeCall(() =>
          adapter.getPredictionOutcomes({
            schema,
            cgTablePrefix,
            plpTablePrefix,
            targetId,
          }),
        )
      : null,
    getCohortMethodInclusion
      ? safeCall(() =>
          adapter.getCmOutcomes({
            schema,
            cgTablePrefix,
            cmTablePrefix,
            targetId,
          }),
        )
      : null,
    getSccsInclusion
      ? safeCall(() =>
          adapter.getSccsOutcomes({
            schema,
            cgTablePrefix,
            sccsTablePrefix,
            targetId,
          }),
        )
      : null,
  ]);

  const cohorts = rawCohorts.map((r) => ({
    cohortId: r["cohortDefinitionId"],
    cohortName: r["cohortName"],
    subsetParent: r["subsetParent"],
    subsetDefinitionId: r["subsetDefinitionId"],
  })) as Row[];

  const parents = new Map<number, string>();
  for (const c of cohorts) {
    if (c["cohortId"] === c["subsetParent"]) {
      parents.set(c["cohortId"] as number, c["cohortName"] as string);
    }
  }
  for (const c of cohorts) {
    c["parentName"] = parents.get(c["subsetParent"] as number) ?? null;
  }

  const counts = summarizeCounts(rawCounts);
  let cohortCounts = leftMerge(
    cohorts,
    counts,
    ["cohortId"],
    ["cohortId"],
  ).filter((r) => r["numDatabase"] !== null && r["numDatabase"] !== undefined);

  if (inc)
    cohortCounts = leftMerge(
      cohortCounts,
      inc,
      ["cohortId", "cohortName"],
      ["cohortDefinitionId", "cohortName"],
    );
  if (char)
    cohortCounts = leftMerge(
      cohortCounts,
      char,
      ["cohortId", "cohortName"],
      ["cohortDefinitionId", "cohortName"],
    );
  if (pred)
    cohortCounts = leftMerge(
      cohortCounts,
      pred,
      ["cohortId", "cohortName"],
      ["cohortDefinitionId", "cohortName"],
    );
  if (cm)
    cohortCounts = leftMerge(
      cohortCounts,
      cm,
      ["cohortId", "cohortName"],
      ["cohortDefinitionId", "cohortName"],
    );
  if (sccs)
    cohortCounts = leftMerge(
      cohortCounts,
      sccs,
      ["cohortId", "cohortName"],
      ["cohortDefinitionId", "cohortName"],
    );

  fillNulls(cohortCounts);
  ensureColumns(cohortCounts, OUTCOME_ANALYSIS_COLUMNS);

  cohortCounts = cohortCounts.filter((r) =>
    OUTCOME_ANALYSIS_COLUMNS.some((col) => r[col] !== 0),
  );

  cohortCounts.sort(
    (a, b) =>
      String(a["parentName"] ?? "").localeCompare(
        String(b["parentName"] ?? ""),
      ) ||
      String(a["cohortName"] ?? "").localeCompare(
        String(b["cohortName"] ?? ""),
      ),
  );

  return cohortCounts;
}
