import { queryDb } from "#config/db.js";
import {
  addOptionalClause,
  toArray,
  buildInClause,
} from "#shared/queryHelpers.js";
import type { NamedParams } from "#types/index.js";

type Row = Record<string, unknown>;

export async function getCohortCounts({
  schema,
  databaseTable = "database_meta_data",
  cohortIds = null,
  databaseIds = null,
}: {
  schema: string;
  databaseTable?: string;
  cohortIds?: number[] | null;
  databaseIds?: string[] | null;
}): Promise<Row[]> {
  const params: NamedParams = {};
  const clauses: string[] = [];

  if (cohortIds !== null && cohortIds !== undefined) {
    clauses.push(
      `cc.cohort_id IN (${buildInClause("cid", toArray(cohortIds), params)})`,
    );
  }
  if (databaseIds !== null && databaseIds !== undefined) {
    clauses.push(
      `cc.database_id IN (${buildInClause("dbid", toArray(databaseIds), params)})`,
    );
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const sql = `
    SELECT
      cc.cohort_id,
      cd.cohort_name,
      cc.cohort_entries,
      cc.cohort_subjects,
      dt.cdm_source_name AS database_name,
      dt.database_id
    FROM ${schema}.cg_cohort_count cc
    INNER JOIN ${schema}.${databaseTable} dt
      ON cc.database_id = dt.database_id
    INNER JOIN ${schema}.cg_cohort_definition cd
      ON cd.cohort_definition_id = cc.cohort_id
    ${where}
    ORDER BY cd.cohort_name, dt.cdm_source_name
  `;
  return queryDb(sql, params);
}

export async function getCohortGeneration({
  schema,
  databaseTable = "database_meta_data",
  cohortIds = null,
}: {
  schema: string;
  databaseTable?: string;
  cohortIds?: number[] | null;
}): Promise<Row[]> {
  const params: NamedParams = {};
  const clauses: string[] = [];

  if (cohortIds !== null && cohortIds !== undefined) {
    clauses.push(
      `cd.cohort_definition_id IN (${buildInClause("cid", toArray(cohortIds), params)})`,
    );
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const sql = `
    SELECT
      cd.cohort_definition_id AS cohort_id,
      cd.cohort_name,
      (cg.generation_status = 'COMPLETE') AS generated,
      cg.start_time,
      cg.end_time,
      dt.cdm_source_name AS database_name,
      dt.database_id
    FROM ${schema}.cg_cohort_generation cg
    INNER JOIN ${schema}.${databaseTable} dt
      ON cg.database_id = dt.database_id
    INNER JOIN ${schema}.cg_cohort_definition cd
      ON cg.cohort_definition_id = cd.cohort_definition_id
    ${where}
    ORDER BY cd.cohort_name, dt.cdm_source_name
  `;

  try {
    return await queryDb(sql, params);
  } catch {
    const sqlLegacy = sql.replace(
      "cg.cohort_definition_id = cd.cohort_definition_id",
      "cg.cohort_id = cd.cohort_definition_id",
    );
    return queryDb(sqlLegacy, params);
  }
}

export async function getCohortInclusionRules({
  schema,
  cohortId,
}: {
  schema: string;
  cohortId: number;
}): Promise<Row[]> {
  const sql = `
    SELECT
      ci.cohort_definition_id,
      cd.cohort_name,
      ci.rule_sequence,
      ci.name AS rule_name
    FROM ${schema}.cg_cohort_inclusion ci
    INNER JOIN ${schema}.cg_cohort_definition cd
      ON cd.cohort_definition_id = ci.cohort_definition_id
    WHERE ci.cohort_definition_id = @cohortId
    ORDER BY ci.rule_sequence
  `;
  return queryDb(sql, { cohortId });
}

export async function getCohortInclusionStats({
  schema,
  databaseTable = "database_meta_data",
  cohortId,
  databaseIds = null,
}: {
  schema: string;
  databaseTable?: string;
  cohortId: number;
  databaseIds?: string[] | null;
}): Promise<Row[]> {
  const params: NamedParams = { cohortId };
  const clauses = [`cir.cohort_definition_id = @cohortId`];

  if (databaseIds !== null && databaseIds !== undefined) {
    clauses.push(
      `cir.database_id IN (${buildInClause("dbid", toArray(databaseIds), params)})`,
    );
  }

  const sql = `
    SELECT
      cir.database_id,
      dt.cdm_source_name AS database_name,
      cir.cohort_definition_id,
      cd.cohort_name,
      cir.inclusion_rule_mask,
      cir.person_count,
      cir.mode_id
    FROM ${schema}.cg_cohort_inc_result cir
    INNER JOIN ${schema}.${databaseTable} dt
      ON cir.database_id = dt.database_id
    INNER JOIN ${schema}.cg_cohort_definition cd
      ON cir.cohort_definition_id = cd.cohort_definition_id
    WHERE ${clauses.join(" AND ")}
  `;
  return queryDb(sql, params);
}

export async function getCohortDefinitions({
  schema,
  cgTablePrefix = "cg_",
  targetIds = null,
  slim = false,
}: {
  schema: string;
  cgTablePrefix?: string;
  targetIds?: number[] | null;
  slim?: boolean;
}): Promise<Row[]> {
  let subsetTableExists = true;
  try {
    await queryDb(
      `SELECT * FROM ${schema}.${cgTablePrefix}cohort_subset_definition LIMIT 1`,
    );
  } catch {
    subsetTableExists = false;
  }

  const params: NamedParams = {};
  const targetClause = addOptionalClause(
    targetIds !== null && targetIds !== undefined,
    `WHERE cd.cohort_definition_id IN (${buildInClause("targetId", toArray(targetIds ?? []), params)})`,
  );
  const targetClauseNoAlias = addOptionalClause(
    targetIds !== null && targetIds !== undefined,
    `WHERE cohort_definition_id IN (${(targetIds ?? []).map((_, i) => `@targetId${i}`).join(",")})`,
  );

  if (slim) {
    const sql = subsetTableExists
      ? `
        SELECT cd.cohort_definition_id, cd.cohort_name, cd.subset_definition_id, cd.subset_parent,
               csd.json AS subset_definition_json
        FROM ${schema}.${cgTablePrefix}cohort_definition cd
        LEFT JOIN ${schema}.${cgTablePrefix}cohort_subset_definition csd
          ON cd.subset_definition_id = csd.subset_definition_id
        ${targetClause}
      `
      : `
        SELECT cohort_definition_id, cohort_name, subset_definition_id, subset_parent,
               NULL AS subset_definition_json
        FROM ${schema}.${cgTablePrefix}cohort_definition
        ${targetClauseNoAlias}
      `;
    return queryDb(sql, params);
  }

  const sql = subsetTableExists
    ? `
      SELECT cd.*, cd.sql_command AS sql, csd.json AS subset_definition_json
      FROM ${schema}.${cgTablePrefix}cohort_definition cd
      LEFT JOIN ${schema}.${cgTablePrefix}cohort_subset_definition csd
        ON cd.subset_definition_id = csd.subset_definition_id
      ${targetClause}
    `
    : `
      SELECT *, sql_command AS sql, NULL AS subset_definition_json
      FROM ${schema}.${cgTablePrefix}cohort_definition
      ${targetClauseNoAlias}
    `;

  return queryDb(sql, params);
}

export async function getCohortUniquePeople({
  schema,
  cohortId,
}: {
  schema: string;
  cohortId: number;
}): Promise<Row[]> {
  const sql = `
    SELECT cc.database_id, cc.cohort_id, cc.cohort_entries, cc.cohort_subjects
    FROM ${schema}.cg_cohort_count cc
    WHERE cc.cohort_id = @cohortId
  `;
  return queryDb(sql, { cohortId });
}

export function extractSubsetCohorts(json: string | null | undefined): string {
  if (json === null || json === undefined || json === "") return "";

  try {
    const parsed: unknown = typeof json === "string" ? JSON.parse(json) : json;
    const defs = Array.isArray(parsed) ? parsed : [parsed];

    const cohortIds = new Set<number>();
    for (const def of defs as Array<{
      subsetOperators?: Array<{ subsetType: string; cohortIds?: number[] }>;
    }>) {
      const operators = def.subsetOperators ?? [];
      for (const op of operators) {
        if (op.subsetType === "CohortSubsetOperator") {
          for (const id of op.cohortIds ?? []) {
            cohortIds.add(id);
          }
        }
      }
    }

    return [...cohortIds].join("");
  } catch {
    return "";
  }
}
