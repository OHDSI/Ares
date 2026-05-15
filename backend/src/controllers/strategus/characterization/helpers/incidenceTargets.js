import { queryDb } from "../../../../config/postgresDbConnection.js";

function addOptionalClause(condition, clause) {
  return condition ? clause : "";
}

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

function pivotType(rows) {
  const map = new Map();
  for (const r of rows) {
    const key = `${r.cohortDefinitionId}|${r.cohortName}`;
    if (!map.has(key))
      map.set(key, {
        cohortName: r.cohortName,
        cohortDefinitionId: r.cohortDefinitionId,
      });
    map.get(key)[r.type] = r.value;
  }
  return [...map.values()];
}

/**
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.ciTablePrefix='ci_']
 * @param {string} [options.cgTablePrefix='cg_']
 * @returns {Promise<object[]>}
 */
export async function getIncidenceTargets({
  schema,
  ciTablePrefix = "ci_",
  cgTablePrefix = "cg_",
}) {
  const sql = `
    SELECT DISTINCT
      cg.cohort_name,
      ci.target_cohort_definition_id AS cohort_definition_id,
      'cohortIncidence' AS type,
      1 AS value
    FROM ${schema}.${ciTablePrefix}target_def ci
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
      ON ci.target_cohort_definition_id = cg.cohort_definition_id
  `;

  const rows = await queryDb(sql);
  return pivotType(rows);
}

/**
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.ciTablePrefix='ci_']
 * @param {string} [options.cgTablePrefix='cg_']
 * @param {number} [options.targetId]
 * @returns {Promise<object[]>}
 */
export async function getIncidenceOutcomes({
  schema,
  ciTablePrefix = "ci_",
  cgTablePrefix = "cg_",
  targetId = null,
}) {
  const params = {};

  const targetJoin = addOptionalClause(
    targetId != null,
    `
    INNER JOIN (
      SELECT DISTINCT outcome_id
      FROM ${schema}.${ciTablePrefix}incidence_summary
      WHERE target_cohort_definition_id IN (${buildInClause("targetId", toArray(targetId ?? []), params)})
    ) temp ON temp.outcome_id = ci.outcome_id
  `,
  );

  const sql = `
    SELECT DISTINCT
      cg.cohort_name,
      ci.outcome_cohort_definition_id AS cohort_definition_id,
      'cohortIncidence' AS type,
      1 AS value
    FROM ${schema}.${ciTablePrefix}outcome_def ci
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
      ON ci.outcome_cohort_definition_id = cg.cohort_definition_id
    ${targetJoin}
  `;

  const rows = await queryDb(sql, params);
  return pivotType(rows);
}
