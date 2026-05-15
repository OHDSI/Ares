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
 * @param {string} [options.plpTablePrefix='plp_']
 * @param {string} [options.cgTablePrefix='cg_']
 * @returns {Promise<object[]>}
 */
export async function getPredictionTargets({
  schema,
  plpTablePrefix = "plp_",
  cgTablePrefix = "cg_",
}) {
  const sql = `
    SELECT DISTINCT
      cohorts.cohort_name,
      cohorts.cohort_definition_id,
      'prediction' AS type,
      1 AS value
    FROM ${schema}.${plpTablePrefix}model_designs model_designs
    INNER JOIN (
      SELECT c.cohort_id, c.cohort_definition_id, cd.cohort_name
      FROM ${schema}.${plpTablePrefix}cohorts c
      INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cd
        ON c.cohort_definition_id = cd.cohort_definition_id
        AND c.cohort_name = cd.cohort_name
    ) cohorts
      ON model_designs.target_id = cohorts.cohort_id
  `;

  const rows = await queryDb(sql);
  return pivotType(rows);
}

/**
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.plpTablePrefix='plp_']
 * @param {string} [options.cgTablePrefix='cg_']
 * @param {number} [options.targetId]
 * @returns {Promise<object[]>}
 */
export async function getPredictionOutcomes({
  schema,
  plpTablePrefix = "plp_",
  cgTablePrefix = "cg_",
  targetId = null,
}) {
  const params = {};

  const targetJoin = addOptionalClause(
    targetId != null,
    `
    INNER JOIN (
      SELECT DISTINCT cohort_id
      FROM ${schema}.${plpTablePrefix}cohorts
      WHERE cohort_definition_id IN (${buildInClause("targetId", toArray(targetId ?? []), params)})
    ) targets
      ON model_designs.target_id = targets.cohort_id
  `,
  );

  const sql = `
    SELECT DISTINCT
      cohorts.cohort_name,
      cohorts.cohort_definition_id,
      'prediction' AS type,
      1 AS value
    FROM ${schema}.${plpTablePrefix}model_designs model_designs
    INNER JOIN (
      SELECT c.cohort_id, c.cohort_definition_id, cd.cohort_name
      FROM ${schema}.${plpTablePrefix}cohorts c
      INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cd
        ON c.cohort_definition_id = cd.cohort_definition_id
        AND c.cohort_name = cd.cohort_name
    ) cohorts
      ON model_designs.outcome_id = cohorts.cohort_id
    ${targetJoin}
  `;

  const rows = await queryDb(sql, params);
  return pivotType(rows);
}
