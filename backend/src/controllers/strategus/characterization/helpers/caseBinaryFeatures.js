import { queryDb } from '../../../../config/postgresDbConnection.js';

function addOptionalClause(condition, clause) {
    return condition ? clause : '';
}

function toArray(v) {
    return Array.isArray(v) ? v : [v];
}

function buildInClause(prefix, values, params) {
    const keys = values.map((_, i) => `@${prefix}${i}`);
    values.forEach((v, i) => { params[`${prefix}${i}`] = v; });
    return keys.join(',');
}

/**
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.cTablePrefix='c_']
 * @param {string} [options.cgTablePrefix='cg_']
 * @param {string} [options.databaseTable='database_meta_data']
 * @param {number|number[]} [options.targetIds]
 * @param {number|number[]} [options.outcomeIds]
 * @param {string[]} [options.databaseIds]
 * @param {number[]} [options.analysisIds=[3]]
 * @param {number|number[]} [options.riskWindowStart]
 * @param {number|number[]} [options.riskWindowEnd]
 * @param {string|string[]} [options.startAnchor]
 * @param {string|string[]} [options.endAnchor]
 * @returns {Promise<object[]>}
 */
export async function getCaseBinaryFeatures({
                                                schema,
                                                cTablePrefix = 'c_',
                                                cgTablePrefix = 'cg_',
                                                databaseTable = 'database_meta_data',
                                                targetIds = null,
                                                outcomeIds = null,
                                                databaseIds = null,
                                                analysisIds = null,
                                                riskWindowStart = null,
                                                riskWindowEnd = null,
                                                startAnchor = null,
                                                endAnchor = null,
                                            }) {
    const params = {};

    const analysisFilter = analysisIds != null
        ? `(SELECT * FROM ${schema}.${cTablePrefix}covariate_ref WHERE analysis_id IN (${buildInClause('analysisId', toArray(analysisIds), params)}))`
        : `${schema}.${cTablePrefix}covariate_ref`;

    const targetClause = addOptionalClause(targetIds != null,
        `AND c.TARGET_COHORT_ID IN (${buildInClause('targetId', toArray(targetIds ?? []), params)})`);
    const outcomeClause = addOptionalClause(outcomeIds != null,
        `AND c.OUTCOME_COHORT_ID IN (${buildInClause('outcomeId', toArray(outcomeIds ?? []), params)})`);
    const dbClause = addOptionalClause(databaseIds != null,
        `AND c.database_id IN (${buildInClause('databaseId', toArray(databaseIds ?? []), params)})`);
    const rwStartClause = addOptionalClause(riskWindowStart != null,
        `AND s.RISK_WINDOW_START IN (${buildInClause('rwStart', toArray(riskWindowStart ?? []), params)})`);
    const rwEndClause = addOptionalClause(riskWindowEnd != null,
        `AND s.RISK_WINDOW_END IN (${buildInClause('rwEnd', toArray(riskWindowEnd ?? []), params)})`);
    const startAnchorClause = addOptionalClause(startAnchor != null,
        `AND s.START_ANCHOR IN (${buildInClause('startAnchor', toArray(startAnchor ?? []), params)})`);
    const endAnchorClause = addOptionalClause(endAnchor != null,
        `AND s.END_ANCHOR IN (${buildInClause('endAnchor', toArray(endAnchor ?? []), params)})`);

    const sql = `
    SELECT
      d.CDM_SOURCE_ABBREVIATION AS database_name,
      c.database_id,
      target.cohort_name AS target_name,
      cd.TARGET_COHORT_ID,
      outcome.cohort_name AS outcome_name,
      cd.OUTCOME_COHORT_ID,
      s.min_prior_observation,
      s.outcome_washout_days,
      s.RISK_WINDOW_START,
      s.RISK_WINDOW_END,
      s.START_ANCHOR,
      s.END_ANCHOR,
      coi.covariate_id,
      coi.covariate_name,
      c.sum_value,
      c.average_value
    FROM ${schema}.${cTablePrefix}covariates c
    INNER JOIN ${schema}.${cTablePrefix}cohort_details cd
      ON cd.setting_id = c.setting_id
      AND cd.database_id = c.database_id
      AND cd.TARGET_COHORT_ID = c.TARGET_COHORT_ID
      AND cd.OUTCOME_COHORT_ID = c.OUTCOME_COHORT_ID
      AND cd.COHORT_TYPE = c.COHORT_TYPE
    INNER JOIN ${analysisFilter} coi
      ON c.setting_id = coi.setting_id
      AND c.database_id = coi.database_id
      AND c.covariate_id = coi.covariate_id
    INNER JOIN ${schema}.${databaseTable} d
      ON c.database_id = d.database_id
    INNER JOIN ${schema}.${cTablePrefix}settings s
      ON s.database_id = c.database_id
      AND s.setting_id = c.setting_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition target
      ON target.cohort_definition_id = cd.target_cohort_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition outcome
      ON outcome.cohort_definition_id = cd.outcome_cohort_id
    WHERE cd.COHORT_TYPE IN ('Cases')
      ${targetClause}
      ${outcomeClause}
      ${dbClause}
      ${rwStartClause}
      ${rwEndClause}
      ${startAnchorClause}
      ${endAnchorClause}
  `;

    return queryDb(sql, params);
}

/**
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.cTablePrefix='c_']
 * @param {string} [options.cgTablePrefix='cg_']
 * @param {string} [options.databaseTable='database_meta_data']
 * @param {number|number[]} [options.targetIds]
 * @param {number|number[]} [options.outcomeIds]
 * @param {string[]} [options.databaseIds]
 * @param {number[]} [options.analysisIds=[3]]
 * @returns {Promise<object[]>}
 */
export async function getCaseTargetBinaryFeatures({
                                                      schema,
                                                      cTablePrefix = 'c_',
                                                      cgTablePrefix = 'cg_',
                                                      databaseTable = 'database_meta_data',
                                                      targetIds = null,
                                                      outcomeIds = null,
                                                      databaseIds = null,
                                                      analysisIds = null,
                                                  }) {
    const params = {};

    const analysisFilter = analysisIds != null
        ? `(SELECT * FROM ${schema}.${cTablePrefix}covariate_ref WHERE analysis_id IN (${buildInClause('analysisId', toArray(analysisIds), params)}))`
        : `${schema}.${cTablePrefix}covariate_ref`;

    const targetClause = addOptionalClause(targetIds != null,
        `AND tcd.target_cohort_id IN (${buildInClause('targetId', toArray(targetIds ?? []), params)})`);
    const outcomeClause = addOptionalClause(outcomeIds != null,
        `AND tcd.outcome_cohort_id IN (${buildInClause('outcomeId', toArray(outcomeIds ?? []), params)})`);

    const cTargetClause = addOptionalClause(targetIds != null,
        `AND c.TARGET_COHORT_ID IN (${toArray(targetIds ?? []).map((_, i) => `@targetId${i}`).join(',')})`);
    const dbClause = addOptionalClause(databaseIds != null,
        `AND c.database_id IN (${buildInClause('databaseId', toArray(databaseIds ?? []), params)})`);

    const exTargetClause = addOptionalClause(targetIds != null,
        `AND c.TARGET_COHORT_ID IN (${toArray(targetIds ?? []).map((_, i) => `@targetId${i}`).join(',')})`);
    const exOutcomeClause = addOptionalClause(outcomeIds != null,
        `AND c.OUTCOME_COHORT_ID IN (${toArray(outcomeIds ?? []).map((_, i) => `@outcomeId${i}`).join(',')})`);

    const sql = `
    SELECT
      d.CDM_SOURCE_ABBREVIATION AS database_name,
      t.database_id,
      target.cohort_name AS target_name,
      t.TARGET_COHORT_ID,
      outcome.cohort_name AS outcome_name,
      t.OUTCOME_COHORT_ID,
      t.min_prior_observation,
      t.outcome_washout_days,
      t.covariate_id,
      t.covariate_name,
      CASE
        WHEN e.sum_value IS NULL THEN t.sum_value
        WHEN e.sum_value < 0 AND t.sum_value > 0 THEN t.sum_value - ABS(e.sum_value) / 2
        WHEN t.sum_value < 0 THEN t.sum_value
        ELSE t.sum_value - e.sum_value
      END AS sum_value,
      t.sum_value AS raw_sum,
      t.average_value AS raw_average
    FROM (
      SELECT
        c.database_id,
        cd.TARGET_COHORT_ID,
        s2.OUTCOME_COHORT_ID,
        s.min_prior_observation,
        s2.outcome_washout_days,
        coi.covariate_id,
        coi.covariate_name,
        c.sum_value,
        c.average_value
      FROM ${schema}.${cTablePrefix}covariates c
      INNER JOIN ${analysisFilter} coi
        ON c.database_id = coi.database_id
        AND c.setting_id = coi.setting_id
        AND c.covariate_id = coi.covariate_id
      INNER JOIN ${schema}.${cTablePrefix}cohort_details cd
        ON cd.TARGET_COHORT_ID = c.TARGET_COHORT_ID
        AND cd.OUTCOME_COHORT_ID = c.OUTCOME_COHORT_ID
        AND cd.COHORT_TYPE = c.COHORT_TYPE
        AND cd.database_id = c.database_id
        AND cd.setting_id = c.setting_id
      INNER JOIN ${schema}.${cTablePrefix}settings s
        ON s.setting_id = c.setting_id
        AND s.database_id = c.database_id
      INNER JOIN (
        SELECT DISTINCT
          tcd.target_cohort_id,
          tcd.outcome_cohort_id,
          ts.outcome_washout_days
        FROM ${schema}.${cTablePrefix}settings ts
        INNER JOIN ${schema}.${cTablePrefix}cohort_details tcd
          ON ts.setting_id = tcd.setting_id
          AND ts.database_id = tcd.database_id
        WHERE tcd.outcome_cohort_id != 0
          ${targetClause}
          ${outcomeClause}
      ) s2
        ON cd.target_cohort_id = s2.target_cohort_id
      WHERE cd.COHORT_TYPE = 'Target'
        ${cTargetClause}
        ${dbClause}
    ) t
    LEFT JOIN (
      SELECT
        c.database_id,
        cd.TARGET_COHORT_ID,
        cd.OUTCOME_COHORT_ID,
        s.min_prior_observation,
        s.outcome_washout_days,
        coi.covariate_id,
        coi.covariate_name,
        c.sum_value
      FROM ${schema}.${cTablePrefix}cohort_details cd
      INNER JOIN ${schema}.${cTablePrefix}covariates c
        ON cd.TARGET_COHORT_ID = c.TARGET_COHORT_ID
        AND cd.OUTCOME_COHORT_ID = c.OUTCOME_COHORT_ID
        AND cd.COHORT_TYPE = c.COHORT_TYPE
        AND cd.database_id = c.database_id
        AND cd.setting_id = c.setting_id
      INNER JOIN ${analysisFilter} coi
        ON c.database_id = coi.database_id
        AND c.setting_id = coi.setting_id
        AND c.covariate_id = coi.covariate_id
      INNER JOIN ${schema}.${cTablePrefix}settings s
        ON s.setting_id = c.setting_id
        AND s.database_id = c.database_id
      WHERE cd.COHORT_TYPE = 'Exclude'
        ${exTargetClause}
        ${exOutcomeClause}
    ) e
      ON t.database_id = e.database_id
      AND t.TARGET_COHORT_ID = e.TARGET_COHORT_ID
      AND t.OUTCOME_COHORT_ID = e.OUTCOME_COHORT_ID
      AND t.min_prior_observation = e.min_prior_observation
      AND t.outcome_washout_days = e.outcome_washout_days
      AND t.covariate_name = e.covariate_name
      AND t.covariate_id = e.covariate_id
    INNER JOIN ${schema}.${databaseTable} d
      ON t.database_id = d.database_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition target
      ON target.cohort_definition_id = t.target_cohort_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition outcome
      ON outcome.cohort_definition_id = t.outcome_cohort_id
  `;

    return queryDb(sql, params);
}