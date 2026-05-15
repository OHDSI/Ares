import { queryDb } from "../../../config/postgresDbConnection.js";

function addOptionalClause(condition, clause) {
  return condition ? clause : "";
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
export async function getDechallengeRechallenge({
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
    `AND dr.TARGET_COHORT_DEFINITION_ID IN (${(targetIds ?? []).map((_, i) => `@targetId${i}`).join(",")})`,
  );
  if (targetIds)
    targetIds.forEach((id, i) => {
      params[`targetId${i}`] = id;
    });

  const outcomeClause = addOptionalClause(
    outcomeIds != null,
    `AND dr.OUTCOME_COHORT_DEFINITION_ID IN (${(outcomeIds ?? []).map((_, i) => `@outcomeId${i}`).join(",")})`,
  );
  if (outcomeIds)
    outcomeIds.forEach((id, i) => {
      params[`outcomeId${i}`] = id;
    });

  const sql = `
    SELECT
      d.CDM_SOURCE_ABBREVIATION AS database_name,
      d.database_id,
      target_cohorts.cohort_name AS target_name,
      dr.target_cohort_definition_id AS target_id,
      outcome_cohorts.cohort_name AS outcome_name,
      dr.outcome_cohort_definition_id AS outcome_id,
      dr.dechallenge_stop_interval,
      dr.dechallenge_evaluation_window,
      dr.num_exposure_eras,
      dr.num_persons_exposed,
      dr.num_cases,
      dr.dechallenge_attempt,
      dr.dechallenge_fail,
      dr.dechallenge_success,
      dr.rechallenge_attempt,
      dr.rechallenge_fail,
      dr.rechallenge_success,
      dr.pct_dechallenge_attempt,
      dr.pct_dechallenge_fail,
      dr.pct_dechallenge_success,
      dr.pct_rechallenge_attempt,
      dr.pct_rechallenge_fail,
      dr.pct_rechallenge_success
    FROM ${schema}.${cTablePrefix}dechallenge_rechallenge dr
    INNER JOIN ${schema}.${databaseTable} d
      ON dr.database_id = d.database_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition target_cohorts
      ON target_cohorts.cohort_definition_id = dr.target_cohort_definition_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition outcome_cohorts
      ON outcome_cohorts.cohort_definition_id = dr.outcome_cohort_definition_id
    WHERE 1 = 1
      ${targetClause}
      ${outcomeClause}
  `;

  return queryDb(sql, params);
}

/**
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.cTablePrefix='c_']
 * @param {number} options.targetId - must be exactly one
 * @param {number} options.outcomeId - must be exactly one
 * @param {string} options.databaseId - must be exactly one
 * @param {number} [options.dechallengeStopInterval]
 * @param {number} [options.dechallengeEvaluationWindow]
 * @returns {Promise<object[]>}
 */
export async function getDechallengeRechallengeFails({
  schema,
  cTablePrefix = "c_",
  targetId,
  outcomeId,
  databaseId,
  dechallengeStopInterval = null,
  dechallengeEvaluationWindow = null,
}) {
  if (targetId == null) throw new Error("Must specify exactly one targetId");
  if (outcomeId == null) throw new Error("Must specify exactly one outcomeId");
  if (databaseId == null)
    throw new Error("Must specify exactly one databaseId");

  const params = { targetId, outcomeId, databaseId };

  const stopClause = addOptionalClause(
    dechallengeStopInterval != null,
    "AND DECHALLENGE_STOP_INTERVAL = @dechallengeStopInterval",
  );
  if (dechallengeStopInterval != null)
    params.dechallengeStopInterval = dechallengeStopInterval;

  const evalClause = addOptionalClause(
    dechallengeEvaluationWindow != null,
    "AND DECHALLENGE_EVALUATION_WINDOW = @dechallengeEvaluationWindow",
  );
  if (dechallengeEvaluationWindow != null)
    params.dechallengeEvaluationWindow = dechallengeEvaluationWindow;

  const sql = `
    SELECT *
    FROM ${schema}.${cTablePrefix}rechallenge_fail_case_series
    WHERE TARGET_COHORT_DEFINITION_ID = @targetId
      AND OUTCOME_COHORT_DEFINITION_ID = @outcomeId
      AND DATABASE_ID = @databaseId
      ${stopClause}
      ${evalClause}
  `;

  return queryDb(sql, params);
}
