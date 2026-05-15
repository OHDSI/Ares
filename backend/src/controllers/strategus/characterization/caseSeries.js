import { parseCovariateNameString } from "./helpers/parseCovariateNameString.js";

function addOptionalClause(condition, clause) {
  return condition ? clause : "";
}

/**
 * @param {object} connectionHandler - DB connection with a queryDb method
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.cTablePrefix='c_']
 * @param {string} [options.cgTablePrefix='cg_']
 * @param {string} [options.databaseTable='database_meta_data']
 * @param {number} options.targetId
 * @param {number} options.outcomeId
 * @param {string[]} [options.databaseIds]
 * @param {number} [options.riskWindowStart]
 * @param {number} [options.riskWindowEnd]
 * @param {string} [options.startAnchor]
 * @param {string} [options.endAnchor]
 * @param {number[]} [options.conceptIds]
 * @param {number} [options.minVal]
 * @returns {Promise<object[]>}
 */
async function getBinaryCaseSeries(connectionHandler, options) {
  const {
    schema,
    cTablePrefix = "c_",
    cgTablePrefix = "cg_",
    databaseTable = "database_meta_data",
    targetId,
    outcomeId,
    databaseIds = null,
    riskWindowStart = null,
    riskWindowEnd = null,
    startAnchor = null,
    endAnchor = null,
    conceptIds = null,
    minVal = null,
  } = options;

  if (targetId == null) throw new Error("targetId must be entered");
  if (outcomeId == null) throw new Error("outcomeId must be entered");
  if (Array.isArray(targetId)) throw new Error("Must be single targetId");
  if (Array.isArray(outcomeId)) throw new Error("Must be single outcomeId");

  const params = { targetId, outcomeId };

  const dbClause = addOptionalClause(
    databaseIds != null,
    `AND cov.database_id IN (${databaseIds ? databaseIds.map((_, i) => `@databaseId${i}`).join(",") : ""})`,
  );
  if (databaseIds)
    databaseIds.forEach((id, i) => {
      params[`databaseId${i}`] = id;
    });

  const rwStartClause = addOptionalClause(
    riskWindowStart != null,
    "AND s.risk_window_start = @riskWindowStart",
  );
  if (riskWindowStart != null) params.riskWindowStart = riskWindowStart;

  const rwEndClause = addOptionalClause(
    riskWindowEnd != null,
    "AND s.risk_window_end = @riskWindowEnd",
  );
  if (riskWindowEnd != null) params.riskWindowEnd = riskWindowEnd;

  const startAnchorClause = addOptionalClause(
    startAnchor != null,
    "AND s.start_anchor = @startAnchor",
  );
  if (startAnchor != null) params.startAnchor = startAnchor;

  const endAnchorClause = addOptionalClause(
    endAnchor != null,
    "AND s.end_anchor = @endAnchor",
  );
  if (endAnchor != null) params.endAnchor = endAnchor;

  const minValClause = addOptionalClause(
    minVal != null,
    "AND cov.average_value >= @minVal",
  );
  if (minVal != null) params.minVal = minVal;

  const conceptClause = addOptionalClause(
    conceptIds != null,
    `AND cr.concept_id IN (${conceptIds ? conceptIds.map((_, i) => `@conceptId${i}`).join(",") : ""})`,
  );
  if (conceptIds)
    conceptIds.forEach((id, i) => {
      params[`conceptId${i}`] = id;
    });

  const sql = `
    SELECT
      d.CDM_SOURCE_ABBREVIATION AS database_name,
      d.database_id,
      target.cohort_name AS target_name,
      cov.TARGET_COHORT_ID,
      outcome.cohort_name AS outcome_name,
      cov.OUTCOME_COHORT_ID,
      CASE
        WHEN cov.cohort_type = 'CasesBefore' THEN 'Before'
        WHEN cov.cohort_type = 'CasesBetween' THEN 'During'
        WHEN cov.cohort_type = 'CasesAfter' THEN 'After'
      END AS type,
      cr.covariate_name,
      cr.covariate_id,
      s.min_prior_observation,
      s.outcome_washout_days,
      s.case_post_outcome_duration,
      s.case_pre_target_duration,
      s.risk_window_start,
      s.start_anchor,
      s.risk_window_end,
      s.end_anchor,
      cov.sum_value,
      cov.average_value
    FROM ${schema}.${cTablePrefix}covariates cov
    INNER JOIN ${schema}.${cTablePrefix}covariate_ref cr
      ON cov.setting_id = cr.setting_id
      AND cov.database_id = cr.database_id
      AND cov.covariate_id = cr.covariate_id
    INNER JOIN ${schema}.${cTablePrefix}settings s
      ON cov.setting_id = s.setting_id
      AND cov.database_id = s.database_id
    INNER JOIN ${schema}.${databaseTable} d
      ON cov.database_id = d.database_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition target
      ON target.cohort_definition_id = cov.target_cohort_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition outcome
      ON outcome.cohort_definition_id = cov.outcome_cohort_id
    WHERE cov.target_cohort_id = @targetId
      AND cov.outcome_cohort_id = @outcomeId
      ${dbClause}
      ${rwStartClause}
      ${rwEndClause}
      ${startAnchorClause}
      ${endAnchorClause}
      AND cov.cohort_type IN ('CasesBetween', 'CasesAfter', 'CasesBefore')
      AND cr.analysis_id IN (109, 110, 217, 218, 305, 417, 418, 505, 605, 713, 805, 926, 927)
      ${minValClause}
      ${conceptClause}
  `;

  return connectionHandler.queryDb(sql, params).then((rows) =>
    rows.map((r) => ({
      ...r,
      covariateNameParsed: parseCovariateNameString(r.covariateName),
    })),
  );
}

/**
 * @param {object} connectionHandler
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.cTablePrefix='c_']
 * @param {string} [options.cgTablePrefix='cg_']
 * @param {string} [options.databaseTable='database_meta_data']
 * @param {number} options.targetId
 * @param {number} options.outcomeId
 * @param {string[]} [options.databaseIds]
 * @param {number} [options.riskWindowStart]
 * @param {number} [options.riskWindowEnd]
 * @param {string} [options.startAnchor]
 * @param {string} [options.endAnchor]
 * @returns {Promise<object[]>}
 */
async function getContinuousCaseSeries(connectionHandler, options) {
  const {
    schema,
    cTablePrefix = "c_",
    cgTablePrefix = "cg_",
    databaseTable = "database_meta_data",
    targetId,
    outcomeId,
    databaseIds = null,
    riskWindowStart = null,
    riskWindowEnd = null,
    startAnchor = null,
    endAnchor = null,
  } = options;

  if (targetId == null) throw new Error("targetId must be entered");
  if (outcomeId == null) throw new Error("outcomeId must be entered");
  if (Array.isArray(targetId)) throw new Error("Must be single targetId");
  if (Array.isArray(outcomeId)) throw new Error("Must be single outcomeId");

  const params = { targetId, outcomeId };

  const dbClause = addOptionalClause(
    databaseIds != null,
    `AND cov.database_id IN (${databaseIds ? databaseIds.map((_, i) => `@databaseId${i}`).join(",") : ""})`,
  );
  if (databaseIds)
    databaseIds.forEach((id, i) => {
      params[`databaseId${i}`] = id;
    });

  const rwStartClause = addOptionalClause(
    riskWindowStart != null,
    "AND s.risk_window_start = @riskWindowStart",
  );
  if (riskWindowStart != null) params.riskWindowStart = riskWindowStart;

  const rwEndClause = addOptionalClause(
    riskWindowEnd != null,
    "AND s.risk_window_end = @riskWindowEnd",
  );
  if (riskWindowEnd != null) params.riskWindowEnd = riskWindowEnd;

  const startAnchorClause = addOptionalClause(
    startAnchor != null,
    "AND s.start_anchor = @startAnchor",
  );
  if (startAnchor != null) params.startAnchor = startAnchor;

  const endAnchorClause = addOptionalClause(
    endAnchor != null,
    "AND s.end_anchor = @endAnchor",
  );
  if (endAnchor != null) params.endAnchor = endAnchor;

  const sql = `
    SELECT
      d.CDM_SOURCE_ABBREVIATION AS database_name,
      cov.database_id,
      target.cohort_name AS target_name,
      cov.TARGET_COHORT_ID,
      outcome.cohort_name AS outcome_name,
      cov.OUTCOME_COHORT_ID,
      CASE
        WHEN cov.cohort_type = 'CasesBefore' THEN 'Before'
        WHEN cov.cohort_type = 'CasesBetween' THEN 'During'
        WHEN cov.cohort_type = 'CasesAfter' THEN 'After'
      END AS type,
      cr.covariate_name,
      cr.covariate_id,
      s.min_prior_observation,
      s.outcome_washout_days,
      s.case_post_outcome_duration,
      s.case_pre_target_duration,
      s.risk_window_start,
      s.start_anchor,
      s.risk_window_end,
      s.end_anchor,
      cov.count_value,
      cov.min_value,
      cov.max_value,
      cov.average_value,
      cov.standard_deviation,
      cov.median_value,
      cov.p_10_value,
      cov.p_25_value,
      cov.p_75_value,
      cov.p_90_value
    FROM ${schema}.${cTablePrefix}covariates_continuous cov
    INNER JOIN ${schema}.${cTablePrefix}covariate_ref cr
      ON cov.setting_id = cr.setting_id
      AND cov.database_id = cr.database_id
      AND cov.covariate_id = cr.covariate_id
    INNER JOIN ${schema}.${cTablePrefix}settings s
      ON cov.setting_id = s.setting_id
      AND cov.database_id = s.database_id
    INNER JOIN ${schema}.${databaseTable} d
      ON cov.database_id = d.database_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition target
      ON target.cohort_definition_id = cov.target_cohort_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition outcome
      ON outcome.cohort_definition_id = cov.outcome_cohort_id
    WHERE cov.target_cohort_id = @targetId
      AND cov.outcome_cohort_id = @outcomeId
      ${dbClause}
      ${rwStartClause}
      ${rwEndClause}
      ${startAnchorClause}
      ${endAnchorClause}
      AND cov.cohort_type IN ('CasesBetween', 'CasesAfter', 'CasesBefore')
  `;

  return connectionHandler.queryDb(sql, params).then((rows) =>
    rows.map((r) => ({
      ...r,
      covariateNameParsed: parseCovariateNameString(r.covariateName),
    })),
  );
}

/**
 * @param {object} connectionHandler
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.cTablePrefix='c_']
 * @param {string} [options.cgTablePrefix='cg_']
 * @param {string} [options.databaseTable='database_meta_data']
 * @param {number|number[]} [options.targetIds]
 * @param {number|number[]} [options.outcomeIds]
 * @param {string[]} [options.databaseIds]
 * @param {number|number[]} [options.riskWindowStart]
 * @param {number|number[]} [options.riskWindowEnd]
 * @param {string|string[]} [options.startAnchor]
 * @param {string|string[]} [options.endAnchor]
 * @returns {Promise<object[]>}
 */
async function getCaseCounts(connectionHandler, options) {
  const {
    schema,
    cTablePrefix = "c_",
    cgTablePrefix = "cg_",
    databaseTable = "database_meta_data",
    targetIds = null,
    outcomeIds = null,
    databaseIds = null,
    riskWindowStart = null,
    riskWindowEnd = null,
    startAnchor = null,
    endAnchor = null,
  } = options;

  const params = {};
  const toArray = (v) => (Array.isArray(v) ? v : [v]);

  const targetClause = addOptionalClause(
    targetIds != null,
    `AND cc.TARGET_COHORT_ID IN (${
      targetIds != null
        ? toArray(targetIds)
            .map((_, i) => `@targetId${i}`)
            .join(",")
        : ""
    })`,
  );
  if (targetIds != null)
    toArray(targetIds).forEach((id, i) => {
      params[`targetId${i}`] = id;
    });

  const outcomeClause = addOptionalClause(
    outcomeIds != null,
    `AND cc.OUTCOME_COHORT_ID IN (${
      outcomeIds != null
        ? toArray(outcomeIds)
            .map((_, i) => `@outcomeId${i}`)
            .join(",")
        : ""
    })`,
  );
  if (outcomeIds != null)
    toArray(outcomeIds).forEach((id, i) => {
      params[`outcomeId${i}`] = id;
    });

  const dbClause = addOptionalClause(
    databaseIds != null,
    `AND d.database_id IN (${databaseIds ? databaseIds.map((_, i) => `@databaseId${i}`).join(",") : ""})`,
  );
  if (databaseIds)
    databaseIds.forEach((id, i) => {
      params[`databaseId${i}`] = id;
    });

  const rwStartClause = addOptionalClause(
    riskWindowStart != null,
    `AND cc.RISK_WINDOW_START IN (${
      riskWindowStart != null
        ? toArray(riskWindowStart)
            .map((_, i) => `@rwStart${i}`)
            .join(",")
        : ""
    })`,
  );
  if (riskWindowStart != null)
    toArray(riskWindowStart).forEach((v, i) => {
      params[`rwStart${i}`] = v;
    });

  const rwEndClause = addOptionalClause(
    riskWindowEnd != null,
    `AND cc.RISK_WINDOW_END IN (${
      riskWindowEnd != null
        ? toArray(riskWindowEnd)
            .map((_, i) => `@rwEnd${i}`)
            .join(",")
        : ""
    })`,
  );
  if (riskWindowEnd != null)
    toArray(riskWindowEnd).forEach((v, i) => {
      params[`rwEnd${i}`] = v;
    });

  const startAnchorClause = addOptionalClause(
    startAnchor != null,
    `AND cc.START_ANCHOR IN (${
      startAnchor != null
        ? toArray(startAnchor)
            .map((_, i) => `@startAnchor${i}`)
            .join(",")
        : ""
    })`,
  );
  if (startAnchor != null)
    toArray(startAnchor).forEach((v, i) => {
      params[`startAnchor${i}`] = v;
    });

  const endAnchorClause = addOptionalClause(
    endAnchor != null,
    `AND cc.END_ANCHOR IN (${
      endAnchor != null
        ? toArray(endAnchor)
            .map((_, i) => `@endAnchor${i}`)
            .join(",")
        : ""
    })`,
  );
  if (endAnchor != null)
    toArray(endAnchor).forEach((v, i) => {
      params[`endAnchor${i}`] = v;
    });

  const sql = `
    SELECT
      d.CDM_SOURCE_ABBREVIATION AS database_name,
      d.database_id,
      target_cohorts.cohort_name AS target_name,
      cc.target_cohort_id AS target_id,
      outcome_cohorts.cohort_name AS outcome_name,
      cc.outcome_cohort_id AS outcome_id,
      cc.ROW_COUNT,
      cc.PERSON_COUNT,
      cc.min_prior_observation,
      cc.outcome_washout_days,
      cc.RISK_WINDOW_START,
      cc.RISK_WINDOW_END,
      cc.START_ANCHOR,
      cc.END_ANCHOR
    FROM ${schema}.${cTablePrefix}cohort_counts cc
    INNER JOIN ${schema}.${databaseTable} d
      ON cc.database_id = d.database_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition target_cohorts
      ON target_cohorts.cohort_definition_id = cc.target_cohort_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition outcome_cohorts
      ON outcome_cohorts.cohort_definition_id = cc.outcome_cohort_id
    WHERE cc.COHORT_TYPE IN ('Cases')
      ${targetClause}
      ${outcomeClause}
      ${dbClause}
      ${rwStartClause}
      ${rwEndClause}
      ${startAnchorClause}
      ${endAnchorClause}
  `;

  return connectionHandler.queryDb(sql, params);
}

export { getBinaryCaseSeries, getContinuousCaseSeries, getCaseCounts };
