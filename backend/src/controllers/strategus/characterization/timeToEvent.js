import { queryDb } from "../../../config/postgresDbConnection.js";

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

/**
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.cTablePrefix='c_']
 * @param {string} [options.cgTablePrefix='cg_']
 * @param {string} [options.databaseTable='database_meta_data']
 * @param {number[]} [options.targetIds]
 * @param {number[]} [options.outcomeIds]
 * @returns {Promise<object[]>}
 */
export async function getTimeToEvent({
  schema,
  cTablePrefix = "c_",
  cgTablePrefix = "cg_",
  databaseTable = "database_meta_data",
  targetIds = null,
  outcomeIds = null,
}) {
  const params = {};

  const targetClause = addOptionalClause(
    targetIds != null,
    `AND tte.TARGET_COHORT_DEFINITION_ID IN (${buildInClause("targetId", toArray(targetIds ?? []), params)})`,
  );
  const outcomeClause = addOptionalClause(
    outcomeIds != null,
    `AND tte.OUTCOME_COHORT_DEFINITION_ID IN (${buildInClause("outcomeId", toArray(outcomeIds ?? []), params)})`,
  );

  const sql = `
    SELECT
      d.CDM_SOURCE_ABBREVIATION AS database_name,
      d.database_id,
      target_cohorts.cohort_name AS target_name,
      tte.target_cohort_definition_id AS target_id,
      outcome_cohorts.cohort_name AS outcome_name,
      tte.outcome_cohort_definition_id AS outcome_id,
      tte.outcome_type,
      tte.target_outcome_type,
      tte.time_to_event,
      tte.num_events,
      tte.time_scale
    FROM ${schema}.${cTablePrefix}time_to_event tte
    INNER JOIN ${schema}.${databaseTable} d
      ON tte.database_id = d.database_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition target_cohorts
      ON target_cohorts.cohort_definition_id = tte.target_cohort_definition_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition outcome_cohorts
      ON outcome_cohorts.cohort_definition_id = tte.outcome_cohort_definition_id
    WHERE 1 = 1
      ${targetClause}
      ${outcomeClause}
  `;

  return queryDb(sql, params);
}
