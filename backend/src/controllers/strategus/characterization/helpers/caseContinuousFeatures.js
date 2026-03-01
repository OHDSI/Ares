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
 * @param {number[]} [options.analysisIds]
 * @param {string[]} [options.databaseIds]
 * @param {number|number[]} [options.riskWindowStart]
 * @param {number|number[]} [options.riskWindowEnd]
 * @param {string|string[]} [options.startAnchor]
 * @param {string|string[]} [options.endAnchor]
 * @returns {Promise<object[]>}
 */
export async function getCaseContinuousFeatures({
                                                    schema,
                                                    cTablePrefix = 'c_',
                                                    cgTablePrefix = 'cg_',
                                                    databaseTable = 'database_meta_data',
                                                    targetIds = null,
                                                    outcomeIds = null,
                                                    analysisIds = null,
                                                    databaseIds = null,
                                                    riskWindowStart = null,
                                                    riskWindowEnd = null,
                                                    startAnchor = null,
                                                    endAnchor = null,
                                                }) {
    const params = {};

    const analysisFilter = analysisIds != null
        ? `WHERE analysis_id IN (${buildInClause('analysisId', toArray(analysisIds), params)})`
        : '';

    const targetClause = addOptionalClause(targetIds != null,
        `AND c.TARGET_COHORT_ID IN (${buildInClause('targetId', toArray(targetIds ?? []), params)})`);
    const outcomeClause = addOptionalClause(outcomeIds != null,
        `AND c.outcome_cohort_id IN (${buildInClause('outcomeId', toArray(outcomeIds ?? []), params)})`);
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
      t.database_id,
      target.cohort_name AS target_name,
      t.TARGET_COHORT_ID,
      outcome.cohort_name AS outcome_name,
      t.OUTCOME_COHORT_ID,
      t.min_prior_observation,
      t.outcome_washout_days,
      t.risk_window_start,
      t.risk_window_end,
      t.start_anchor,
      t.end_anchor,
      t.covariate_name,
      t.covariate_id,
      t.count_value,
      t.min_value,
      t.max_value,
      t.average_value,
      t.standard_deviation,
      t.median_value,
      t.p_10_value,
      t.p_25_value,
      t.p_75_value,
      t.p_90_value
    FROM (
      SELECT
        c.database_id,
        c.TARGET_COHORT_ID,
        c.OUTCOME_COHORT_ID,
        s.min_prior_observation,
        s.outcome_washout_days,
        s.risk_window_start,
        s.risk_window_end,
        s.start_anchor,
        s.end_anchor,
        coi.covariate_name,
        coi.covariate_id,
        c.count_value,
        c.min_value,
        c.max_value,
        c.average_value,
        c.standard_deviation,
        c.median_value,
        c.p_10_value,
        c.p_25_value,
        c.p_75_value,
        c.p_90_value
      FROM ${schema}.${cTablePrefix}covariates_continuous c
      INNER JOIN (
        SELECT * FROM ${schema}.${cTablePrefix}covariate_ref
        ${analysisFilter}
      ) coi
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
      WHERE cd.COHORT_TYPE = 'Cases'
        ${targetClause}
        ${outcomeClause}
        ${dbClause}
        ${rwStartClause}
        ${rwEndClause}
        ${startAnchorClause}
        ${endAnchorClause}
    ) t
    INNER JOIN ${schema}.${databaseTable} d
      ON t.database_id = d.database_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition target
      ON target.cohort_definition_id = t.target_cohort_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition outcome
      ON outcome.cohort_definition_id = t.outcome_cohort_id
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
 * @param {number[]} [options.analysisIds]
 * @param {string[]} [options.databaseIds]
 * @returns {Promise<object[]>}
 */
export async function getTargetContinuousFeatures({
                                                      schema,
                                                      cTablePrefix = 'c_',
                                                      cgTablePrefix = 'cg_',
                                                      databaseTable = 'database_meta_data',
                                                      targetIds = null,
                                                      analysisIds = null,
                                                      databaseIds = null,
                                                  }) {
    const params = {};

    const analysisFilter = analysisIds != null
        ? `WHERE analysis_id IN (${buildInClause('analysisId', toArray(analysisIds), params)})`
        : '';

    const targetClause = addOptionalClause(targetIds != null,
        `AND c.TARGET_COHORT_ID IN (${buildInClause('targetId', toArray(targetIds ?? []), params)})`);
    const dbClause = addOptionalClause(databaseIds != null,
        `AND c.database_id IN (${buildInClause('databaseId', toArray(databaseIds ?? []), params)})`);

    const sql = `
    SELECT
      d.CDM_SOURCE_ABBREVIATION AS database_name,
      t.database_id,
      target.cohort_name AS target_name,
      t.TARGET_COHORT_ID,
      t.min_prior_observation,
      t.covariate_name,
      t.covariate_id,
      t.count_value,
      t.min_value,
      t.max_value,
      t.average_value,
      t.standard_deviation,
      t.median_value,
      t.p_10_value,
      t.p_25_value,
      t.p_75_value,
      t.p_90_value
    FROM (
      SELECT
        c.database_id,
        cd.TARGET_COHORT_ID,
        s.min_prior_observation,
        coi.covariate_name,
        coi.covariate_id,
        c.count_value,
        c.min_value,
        c.max_value,
        c.average_value,
        c.standard_deviation,
        c.median_value,
        c.p_10_value,
        c.p_25_value,
        c.p_75_value,
        c.p_90_value
      FROM ${schema}.${cTablePrefix}covariates_continuous c
      INNER JOIN (
        SELECT * FROM ${schema}.${cTablePrefix}covariate_ref
        ${analysisFilter}
      ) coi
        ON c.database_id = coi.database_id
        AND c.setting_id = coi.setting_id
        AND c.covariate_id = coi.covariate_id
      INNER JOIN ${schema}.${cTablePrefix}cohort_details cd
        ON cd.TARGET_COHORT_ID = c.TARGET_COHORT_ID
        AND cd.COHORT_TYPE = c.COHORT_TYPE
        AND cd.database_id = c.database_id
        AND cd.setting_id = c.setting_id
      INNER JOIN ${schema}.${cTablePrefix}settings s
        ON s.setting_id = c.setting_id
        AND s.database_id = c.database_id
      WHERE cd.COHORT_TYPE = 'Target'
        ${targetClause}
        ${dbClause}
    ) t
    INNER JOIN ${schema}.${databaseTable} d
      ON t.database_id = d.database_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition target
      ON target.cohort_definition_id = t.target_cohort_id
  `;

    return queryDb(sql, params);
}