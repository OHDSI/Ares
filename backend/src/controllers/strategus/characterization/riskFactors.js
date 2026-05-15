import { queryDb } from "../../../config/postgresDbConnection.js";

import {
  getCaseBinaryFeatures,
  getCaseTargetBinaryFeatures,
} from "./helpers/caseBinaryFeatures.js";
import {
  getCaseContinuousFeatures,
  getTargetContinuousFeatures,
} from "./helpers/caseContinuousFeatures.js";
import {
  processBinaryRiskFactorFeatures,
  processContinuousRiskFactorFeatures,
} from "./helpers/riskFactorProcessing.js";

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
 * @param {number|number[]} [options.targetIds]
 * @param {number|number[]} [options.outcomeIds]
 * @param {string[]} [options.databaseIds]
 * @param {number|number[]} [options.riskWindowStart]
 * @param {number|number[]} [options.riskWindowEnd]
 * @param {string|string[]} [options.startAnchor]
 * @param {string|string[]} [options.endAnchor]
 * @returns {Promise<object[]>}
 */
export async function getCaseCounts({
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
}) {
  const params = {};

  const targetClause = addOptionalClause(
    targetIds != null,
    `AND cc.TARGET_COHORT_ID IN (${buildInClause("targetId", toArray(targetIds ?? []), params)})`,
  );
  const outcomeClause = addOptionalClause(
    outcomeIds != null,
    `AND cc.OUTCOME_COHORT_ID IN (${buildInClause("outcomeId", toArray(outcomeIds ?? []), params)})`,
  );
  const dbClause = addOptionalClause(
    databaseIds != null,
    `AND d.database_id IN (${buildInClause("databaseId", toArray(databaseIds ?? []), params)})`,
  );
  const rwStartClause = addOptionalClause(
    riskWindowStart != null,
    `AND cc.RISK_WINDOW_START IN (${buildInClause("rwStart", toArray(riskWindowStart ?? []), params)})`,
  );
  const rwEndClause = addOptionalClause(
    riskWindowEnd != null,
    `AND cc.RISK_WINDOW_END IN (${buildInClause("rwEnd", toArray(riskWindowEnd ?? []), params)})`,
  );
  const startAnchorClause = addOptionalClause(
    startAnchor != null,
    `AND cc.START_ANCHOR IN (${buildInClause("startAnchor", toArray(startAnchor ?? []), params)})`,
  );
  const endAnchorClause = addOptionalClause(
    endAnchor != null,
    `AND cc.END_ANCHOR IN (${buildInClause("endAnchor", toArray(endAnchor ?? []), params)})`,
  );

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
 * @returns {Promise<object[]>}
 */
export async function getCaseTargetCounts({
  schema,
  cTablePrefix = "c_",
  cgTablePrefix = "cg_",
  databaseTable = "database_meta_data",
  targetIds = null,
  outcomeIds = null,
  databaseIds = null,
}) {
  const params = {};

  const targetClause = addOptionalClause(
    targetIds != null,
    `AND tcd.target_cohort_id IN (${buildInClause("targetId", toArray(targetIds ?? []), params)})`,
  );
  const outcomeClause = addOptionalClause(
    outcomeIds != null,
    `AND tcd.outcome_cohort_id IN (${buildInClause("outcomeId", toArray(outcomeIds ?? []), params)})`,
  );

  const ccTargetClause = addOptionalClause(
    targetIds != null,
    `AND cc.TARGET_COHORT_ID IN (${toArray(targetIds ?? [])
      .map((_, i) => `@targetId${i}`)
      .join(",")})`,
  );
  const dbClause = addOptionalClause(
    databaseIds != null,
    `AND cc.database_id IN (${buildInClause("databaseId", toArray(databaseIds ?? []), params)})`,
  );

  const exTargetClause = addOptionalClause(
    targetIds != null,
    `AND cc.TARGET_COHORT_ID IN (${toArray(targetIds ?? [])
      .map((_, i) => `@targetId${i}`)
      .join(",")})`,
  );
  const exOutcomeClause = addOptionalClause(
    outcomeIds != null,
    `AND cc.outcome_COHORT_ID IN (${toArray(outcomeIds ?? [])
      .map((_, i) => `@outcomeId${i}`)
      .join(",")})`,
  );

  const sql = `
    SELECT DISTINCT
      targets.database_name,
      targets.database_id,
      target_cohorts.cohort_name AS target_name,
      targets.target_id,
      outcome_cohorts.cohort_name AS outcome_name,
      targets.outcome_id,
      CASE
        WHEN excludes.row_count IS NULL THEN targets.row_count
        ELSE targets.row_count - excludes.row_count
      END AS row_count,
      CASE
        WHEN excludes.person_count IS NULL THEN targets.person_count
        WHEN excludes.person_count < 0 AND targets.person_count > 0
          THEN targets.person_count - FLOOR(ABS(excludes.person_count) / 2)
        WHEN targets.person_count < 0 THEN targets.person_count
        ELSE targets.person_count - excludes.person_count
      END AS person_count,
      targets.person_count AS without_excluded_person_count,
      targets.min_prior_observation,
      targets.outcome_washout_days
    FROM (
      SELECT
        d.CDM_SOURCE_ABBREVIATION AS database_name,
        d.database_id,
        cc.target_cohort_id AS target_id,
        s2.outcome_cohort_id AS outcome_id,
        cc.row_count,
        cc.person_count,
        cc.min_prior_observation,
        s2.outcome_washout_days
      FROM ${schema}.${cTablePrefix}cohort_counts cc
      INNER JOIN ${schema}.${databaseTable} d
        ON cc.database_id = d.database_id
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
        ON cc.target_cohort_id = s2.target_cohort_id
      WHERE cc.COHORT_TYPE IN ('Target')
        ${ccTargetClause}
        ${dbClause}
    ) targets
    LEFT JOIN (
      SELECT
        d.CDM_SOURCE_ABBREVIATION AS database_name,
        cc.target_cohort_id AS target_id,
        cc.outcome_cohort_id AS outcome_id,
        cc.row_count,
        cc.person_count,
        cc.min_prior_observation,
        cc.outcome_washout_days
      FROM ${schema}.${cTablePrefix}cohort_counts cc
      INNER JOIN ${schema}.${databaseTable} d
        ON cc.database_id = d.database_id
      WHERE cc.COHORT_TYPE IN ('Exclude')
        ${exTargetClause}
        ${exOutcomeClause}
    ) excludes
      ON targets.database_name = excludes.database_name
      AND targets.target_id = excludes.target_id
      AND targets.min_prior_observation = excludes.min_prior_observation
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition target_cohorts
      ON target_cohorts.cohort_definition_id = targets.target_id
    LEFT JOIN ${schema}.${cgTablePrefix}cohort_definition outcome_cohorts
      ON outcome_cohorts.cohort_definition_id = targets.outcome_id
  `;

  return queryDb(sql, params);
}

/**
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.cTablePrefix='c_']
 * @param {string} [options.cgTablePrefix='cg_']
 * @param {string} [options.databaseTable='database_meta_data']
 * @param {number} options.targetId - must be exactly one
 * @param {number} options.outcomeId - must be exactly one
 * @param {string[]} [options.databaseIds]
 * @param {number[]} [options.analysisIds=[3]]
 * @param {number} [options.riskWindowStart]
 * @param {number} [options.riskWindowEnd]
 * @param {string} [options.startAnchor]
 * @param {string} [options.endAnchor]
 * @returns {Promise<object>} { caseCounts, targetCounts, caseFeatures, targetFeatures, result }
 */
export async function getBinaryRiskFactors({
  schema,
  cTablePrefix = "c_",
  cgTablePrefix = "cg_",
  databaseTable = "database_meta_data",
  targetId,
  outcomeId,
  databaseIds = null,
  analysisIds = null,
  riskWindowStart = null,
  riskWindowEnd = null,
  startAnchor = null,
  endAnchor = null,
}) {
  if (targetId == null) throw new Error("targetId must be entered");
  if (outcomeId == null) throw new Error("outcomeId must be entered");
  if (Array.isArray(targetId)) throw new Error("Must be single targetId");
  if (Array.isArray(outcomeId)) throw new Error("Must be single outcomeId");

  // Fan out one query per database to keep the fast single-DB query plan
  if (databaseIds && databaseIds.length > 1) {
    const perDb = await Promise.all(
      databaseIds.map((id) =>
        getBinaryRiskFactors({
          schema,
          cTablePrefix,
          cgTablePrefix,
          databaseTable,
          targetId,
          outcomeId,
          databaseIds: [id],
          analysisIds,
          riskWindowStart,
          riskWindowEnd,
          startAnchor,
          endAnchor,
        }),
      ),
    );
    return perDb.flatMap((r) => r ?? []);
  }

  const shared = { schema, cTablePrefix, cgTablePrefix, databaseTable };
  const dbIds = databaseIds?.length ? databaseIds : null;

  const [caseCounts, targetCounts, caseFeatures, targetFeatures] =
    await Promise.all([
      getCaseCounts({
        ...shared,
        targetIds: targetId,
        outcomeIds: outcomeId,
        databaseIds: dbIds,
        riskWindowStart,
        riskWindowEnd,
        startAnchor,
        endAnchor,
      }),
      getCaseTargetCounts({
        ...shared,
        targetIds: targetId,
        outcomeIds: outcomeId,
        databaseIds: dbIds,
      }),
      getCaseBinaryFeatures({
        ...shared,
        targetIds: targetId,
        outcomeIds: outcomeId,
        databaseIds: dbIds,
        analysisIds,
        riskWindowStart,
        riskWindowEnd,
        startAnchor,
        endAnchor,
      }),
      getCaseTargetBinaryFeatures({
        ...shared,
        targetIds: targetId,
        outcomeIds: outcomeId,
        databaseIds: dbIds,
        analysisIds,
      }),
    ]);

  return processBinaryRiskFactorFeatures({
    caseCounts,
    targetCounts,
    caseFeatures,
    targetFeatures,
  });
}

/**
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.cTablePrefix='c_']
 * @param {string} [options.cgTablePrefix='cg_']
 * @param {string} [options.databaseTable='database_meta_data']
 * @param {number} options.targetId - must be exactly one
 * @param {number} options.outcomeId - must be exactly one
 * @param {number[]} [options.analysisIds]
 * @param {string[]} [options.databaseIds]
 * @param {number} [options.riskWindowStart]
 * @param {number} [options.riskWindowEnd]
 * @param {string} [options.startAnchor]
 * @param {string} [options.endAnchor]
 * @returns {Promise<object>}
 */
export async function getContinuousRiskFactors({
  schema,
  cTablePrefix = "c_",
  cgTablePrefix = "cg_",
  databaseTable = "database_meta_data",
  targetId,
  outcomeId,
  analysisIds = null,
  databaseIds = null,
  riskWindowStart = null,
  riskWindowEnd = null,
  startAnchor = null,
  endAnchor = null,
}) {
  if (targetId == null) throw new Error("targetId must be entered");
  if (outcomeId == null) throw new Error("outcomeId must be entered");
  if (Array.isArray(targetId)) throw new Error("Must be single targetId");
  if (Array.isArray(outcomeId)) throw new Error("Must be single outcomeId");

  // Fan out one query per database to keep the fast single-DB query plan
  if (databaseIds && databaseIds.length > 1) {
    const perDb = await Promise.all(
      databaseIds.map((id) =>
        getContinuousRiskFactors({
          schema,
          cTablePrefix,
          cgTablePrefix,
          databaseTable,
          targetId,
          outcomeId,
          databaseIds: [id],
          analysisIds,
          riskWindowStart,
          riskWindowEnd,
          startAnchor,
          endAnchor,
        }),
      ),
    );
    return perDb.flatMap((r) => r ?? []);
  }

  const shared = { schema, cTablePrefix, cgTablePrefix, databaseTable };

  const [caseFeatures, targetFeatures] = await Promise.all([
    getCaseContinuousFeatures({
      ...shared,
      targetIds: targetId,
      outcomeIds: outcomeId,
      analysisIds,
      databaseIds,
      riskWindowStart,
      riskWindowEnd,
      startAnchor,
      endAnchor,
    }),
    getTargetContinuousFeatures({
      ...shared,
      targetIds: targetId,
      analysisIds,
      databaseIds,
    }),
  ]);

  return processContinuousRiskFactorFeatures({ caseFeatures, targetFeatures });
}
