import { queryDb } from "../../config/postgresDbConnection.js";

function toArray(v) {
  return Array.isArray(v) ? v : [v];
}

function buildInClause(prefix, values, params) {
  const keys = values.map((_, i) => `@${prefix}${i}`);
  values.forEach((v, i) => {
    params[`${prefix}${i}`] = v;
  });
  return keys.join(",");
}

export async function getCohortCounts({
  schema,
  databaseTable = "database_meta_data",
  cohortIds = null,
  databaseIds = null,
}) {
  const params = {};
  const clauses = [];

  // cg_cohort_count uses cohort_id, not cohort_definition_id
  if (cohortIds != null) {
    clauses.push(
      `cc.cohort_id IN (${buildInClause("cid", toArray(cohortIds), params)})`
    );
  }
  if (databaseIds != null) {
    clauses.push(
      `cc.database_id IN (${buildInClause(
        "dbid",
        toArray(databaseIds),
        params
      )})`
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
}) {
  const params = {};
  const clauses = [];

  if (cohortIds != null) {
    clauses.push(
      `cd.cohort_definition_id IN (${buildInClause(
        "cid",
        toArray(cohortIds),
        params
      )})`
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
    // Fallback: older CohortGenerator used cohort_id instead of cohort_definition_id
    const sqlLegacy = sql.replace(
      "cg.cohort_definition_id = cd.cohort_definition_id",
      "cg.cohort_id = cd.cohort_definition_id"
    );
    return queryDb(sqlLegacy, params);
  }
}

export async function getCohortInclusionRules({ schema, cohortId }) {
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
}) {
  const params = { cohortId };
  const clauses = [`cir.cohort_definition_id = @cohortId`];

  if (databaseIds != null) {
    clauses.push(
      `cir.database_id IN (${buildInClause(
        "dbid",
        toArray(databaseIds),
        params
      )})`
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
