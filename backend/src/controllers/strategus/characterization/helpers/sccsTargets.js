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
 * @param {string} [options.sccsTablePrefix='sccs_']
 * @param {string} [options.cgTablePrefix='cg_']
 * @returns {Promise<object[]>}
 */
export async function getSccsTargets({
  schema,
  sccsTablePrefix = "sccs_",
  cgTablePrefix = "cg_",
}) {
  const sql = `
    SELECT DISTINCT
      cd.cohort_name,
      sc.era_id AS cohort_definition_id,
      'selfControlledCaseSeries' AS type,
      1 AS value
    FROM ${schema}.${sccsTablePrefix}result sr
    INNER JOIN ${schema}.${sccsTablePrefix}covariate sc
      ON sc.exposures_outcome_set_id = sr.exposures_outcome_set_id
      AND sc.database_id = sr.database_id
      AND sc.analysis_id = sr.analysis_id
      AND sc.covariate_id = sr.covariate_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cd
      ON sc.era_id = cd.cohort_definition_id
  `;

  const rows = await queryDb(sql);
  return pivotType(rows);
}

/**
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.sccsTablePrefix='sccs_']
 * @param {string} [options.cgTablePrefix='cg_']
 * @param {number} [options.targetId]
 * @returns {Promise<object[]>}
 */
export async function getSccsOutcomes({
  schema,
  sccsTablePrefix = "sccs_",
  cgTablePrefix = "cg_",
  targetId = null,
}) {
  const params = {};

  const targetClause = addOptionalClause(
    targetId != null,
    `AND sc.era_id IN (${buildInClause("targetId", toArray(targetId ?? []), params)})`,
  );

  const sql = `
    SELECT DISTINCT
      cd.cohort_name,
      eos.outcome_id AS cohort_definition_id,
      'selfControlledCaseSeries' AS type,
      1 AS value
    FROM ${schema}.${sccsTablePrefix}result sr
    INNER JOIN ${schema}.${sccsTablePrefix}exposures_outcome_set eos
      ON eos.exposures_outcome_set_id = sr.exposures_outcome_set_id
    INNER JOIN ${schema}.${sccsTablePrefix}covariate sc
      ON sc.exposures_outcome_set_id = sr.exposures_outcome_set_id
      AND sc.database_id = sr.database_id
      AND sc.analysis_id = sr.analysis_id
      AND sc.covariate_id = sr.covariate_id
    INNER JOIN ${schema}.${sccsTablePrefix}exposure e
      ON e.exposures_outcome_set_id = sc.exposures_outcome_set_id
      AND e.era_id = sc.era_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cd
      ON eos.outcome_id = cd.cohort_definition_id
    WHERE e.true_effect_size IS NULL
      ${targetClause}
  `;

  const rows = await queryDb(sql, params);
  return pivotType(rows);
}
