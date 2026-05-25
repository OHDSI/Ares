import { queryDb } from "#config/db.js";
import { addOptionalClause, addFilterParam } from "#shared/queryHelpers.js";
import { buildRiskWindowClauses } from "../shared/filterClauses.js";
import { parseCovariateNameString } from "../parseCovariateNameString.js";
import type {
  CaseSeriesOptions,
  BinaryCaseSeriesResult,
  NamedParams,
} from "#types/index.js";

export async function getBinaryCaseSeries({
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
}: CaseSeriesOptions): Promise<BinaryCaseSeriesResult[]> {
  if (targetId === null || targetId === undefined)
    throw new Error("targetId must be entered");
  if (outcomeId === null || outcomeId === undefined)
    throw new Error("outcomeId must be entered");
  if (Array.isArray(targetId)) throw new Error("Must be single targetId");
  if (Array.isArray(outcomeId)) throw new Error("Must be single outcomeId");

  const params: NamedParams = {
    targetId: targetId as number,
    outcomeId: outcomeId as number,
  };

  const dbClause = addFilterParam(
    databaseIds,
    (ic) => `AND cov.database_id IN (${ic})`,
    "databaseId",
    params,
  );
  const { rwStartClause, rwEndClause, startAnchorClause, endAnchorClause } =
    buildRiskWindowClauses(
      {
        riskWindowStart: riskWindowStart as number | null,
        riskWindowEnd: riskWindowEnd as number | null,
        startAnchor: startAnchor as string | null,
        endAnchor: endAnchor as string | null,
      },
      "s",
      params,
    );
  const minValClause = addOptionalClause(
    minVal !== null && minVal !== undefined,
    "AND cov.average_value >= @minVal",
  );
  if (minVal !== null && minVal !== undefined) params["minVal"] = minVal;
  const conceptClause = addFilterParam(
    conceptIds,
    (ic) => `AND cr.concept_id IN (${ic})`,
    "conceptId",
    params,
  );

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

  const rows = (await queryDb(sql, params)) as Record<string, unknown>[];
  return rows.map((r) => ({
    ...r,
    covariateNameParsed: parseCovariateNameString(r["covariateName"] as string),
  })) as BinaryCaseSeriesResult[];
}

export async function getContinuousCaseSeries({
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
}: CaseSeriesOptions): Promise<Record<string, unknown>[]> {
  if (targetId === null || targetId === undefined)
    throw new Error("targetId must be entered");
  if (outcomeId === null || outcomeId === undefined)
    throw new Error("outcomeId must be entered");
  if (Array.isArray(targetId)) throw new Error("Must be single targetId");
  if (Array.isArray(outcomeId)) throw new Error("Must be single outcomeId");

  const params: NamedParams = {
    targetId: targetId as number,
    outcomeId: outcomeId as number,
  };

  const dbClause = addFilterParam(
    databaseIds,
    (ic) => `AND cov.database_id IN (${ic})`,
    "databaseId",
    params,
  );
  const { rwStartClause, rwEndClause, startAnchorClause, endAnchorClause } =
    buildRiskWindowClauses(
      {
        riskWindowStart: riskWindowStart as number | null,
        riskWindowEnd: riskWindowEnd as number | null,
        startAnchor: startAnchor as string | null,
        endAnchor: endAnchor as string | null,
      },
      "s",
      params,
    );

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

  const rows = (await queryDb(sql, params)) as Record<string, unknown>[];
  return rows.map((r) => ({
    ...r,
    covariateNameParsed: parseCovariateNameString(r["covariateName"] as string),
  }));
}
