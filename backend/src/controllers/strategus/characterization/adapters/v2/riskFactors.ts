import { queryDb } from "#config/db.js";
import {
  addOptionalClause,
  toArray,
  buildInClause,
  addFilterParam,
} from "#shared/queryHelpers.js";
import { parseCovariateNameString } from "../parseCovariateNameString.js";
import type {
  CaseCountOptions,
  CaseTargetCountOptions,
  RiskFactorOptions,
  CaseCountResult,
  CaseTargetCountResult,
  BinaryRiskFactorResult,
  ContinuousRiskFactorResult,
} from "#types/index.js";
import type { NamedParams } from "#types/index.js";

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
}: CaseCountOptions): Promise<CaseCountResult[]> {
  const params: NamedParams = {};

  const targetClause = addFilterParam(
    toArray(targetIds ?? []) as (string | number)[],
    (ic) => `AND ts.target_id IN (${ic})`,
    "targetId",
    params,
  );
  const outcomeClause = addFilterParam(
    toArray(outcomeIds ?? []) as (string | number)[],
    (ic) => `AND cs.outcome_id IN (${ic})`,
    "outcomeId",
    params,
  );
  const dbClause = addFilterParam(
    databaseIds ?? [],
    (ic) => `AND cs.database_id IN (${ic})`,
    "databaseId",
    params,
  );
  const rwStartClause = addFilterParam(
    toArray(riskWindowStart ?? []) as (string | number)[],
    (ic) => `AND cs.risk_window_start IN (${ic})`,
    "rwStart",
    params,
  );
  const rwEndClause = addFilterParam(
    toArray(riskWindowEnd ?? []) as (string | number)[],
    (ic) => `AND cs.risk_window_end IN (${ic})`,
    "rwEnd",
    params,
  );
  const startAnchorClause = addFilterParam(
    toArray(startAnchor ?? []) as (string | number)[],
    (ic) => `AND cs.start_anchor IN (${ic})`,
    "startAnchor",
    params,
  );
  const endAnchorClause = addFilterParam(
    toArray(endAnchor ?? []) as (string | number)[],
    (ic) => `AND cs.end_anchor IN (${ic})`,
    "endAnchor",
    params,
  );

  const sql = `
    SELECT
      d.CDM_SOURCE_ABBREVIATION AS database_name,
      d.database_id,
      target.cohort_name AS target_name,
      ts.target_id AS target_id,
      outcome.cohort_name AS outcome_name,
      cs.outcome_id AS outcome_id,
      MAX(CASE WHEN rfc.case_average_value > 0 AND rfc.case_sum_value > 0
        THEN ROUND(rfc.case_sum_value::float / rfc.case_average_value) END) AS person_count,
      MAX(CASE WHEN rfc.case_average_value > 0 AND rfc.case_sum_value > 0
        THEN ROUND(rfc.case_sum_value::float / rfc.case_average_value) END) AS row_count,
      ts.min_prior_observation,
      cs.outcome_washout_days,
      cs.risk_window_start,
      cs.risk_window_end,
      cs.start_anchor,
      cs.end_anchor
    FROM ${schema}.${cTablePrefix}case_settings cs
    INNER JOIN ${schema}.${cTablePrefix}target_settings ts
      ON cs.characterization_target_id = ts.characterization_target_id
      AND cs.database_id = ts.database_id
      AND cs.setting_id = ts.setting_id
    LEFT JOIN ${schema}.${cTablePrefix}risk_factor_covariates rfc
      ON rfc.characterization_case_id = cs.characterization_case_id
      AND rfc.database_id = cs.database_id
      AND rfc.setting_id = cs.setting_id
    INNER JOIN ${schema}.${databaseTable} d
      ON cs.database_id = d.database_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition target
      ON ts.target_id = target.cohort_definition_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition outcome
      ON cs.outcome_id = outcome.cohort_definition_id
    WHERE 1 = 1
      ${targetClause}
      ${outcomeClause}
      ${dbClause}
      ${rwStartClause}
      ${rwEndClause}
      ${startAnchorClause}
      ${endAnchorClause}
    GROUP BY
      d.CDM_SOURCE_ABBREVIATION, d.database_id,
      target.cohort_name, ts.target_id,
      outcome.cohort_name, cs.outcome_id,
      ts.min_prior_observation, cs.outcome_washout_days,
      cs.risk_window_start, cs.risk_window_end,
      cs.start_anchor, cs.end_anchor
  `;

  const rows = await queryDb(sql, params);
  return rows.map((r) => ({
    databaseName: r["databaseName"] as string,
    databaseId: r["databaseId"] as string,
    targetName: r["targetName"] as string,
    targetId: r["targetId"] as number,
    outcomeName: r["outcomeName"] as string,
    outcomeId: r["outcomeId"] as number,
    rowCount: r["rowCount"] as number,
    personCount: r["personCount"] as number,
    minPriorObservation: r["minPriorObservation"] as number,
    outcomeWashoutDays: r["outcomeWashoutDays"] as number,
    riskWindowStart: r["riskWindowStart"] as number,
    riskWindowEnd: r["riskWindowEnd"] as number,
    startAnchor: r["startAnchor"] as string,
    endAnchor: r["endAnchor"] as string,
  }));
}

export async function getCaseTargetCounts({
  schema,
  cTablePrefix = "c_",
  cgTablePrefix = "cg_",
  databaseTable = "database_meta_data",
  targetIds = null,
  outcomeIds = null,
  databaseIds = null,
}: CaseTargetCountOptions): Promise<CaseTargetCountResult[]> {
  const params: NamedParams = {};

  const targetClause = addFilterParam(
    toArray(targetIds ?? []) as (string | number)[],
    (ic) => `AND ts.target_id IN (${ic})`,
    "targetId",
    params,
  );
  const outcomeClause = addFilterParam(
    toArray(outcomeIds ?? []) as (string | number)[],
    (ic) => `AND cs.outcome_id IN (${ic})`,
    "outcomeId",
    params,
  );
  const dbClause = addFilterParam(
    databaseIds ?? [],
    (ic) => `AND cs.database_id IN (${ic})`,
    "databaseId",
    params,
  );

  const sql = `
    SELECT DISTINCT
      d.CDM_SOURCE_ABBREVIATION AS database_name,
      d.database_id,
      target.cohort_name AS target_name,
      ts.target_id AS target_id,
      outcome.cohort_name AS outcome_name,
      cs.outcome_id AS outcome_id,
      cc.cohort_entries AS row_count,
      cc.cohort_subjects AS person_count,
      cc.cohort_subjects AS without_excluded_person_count,
      ts.min_prior_observation,
      cs.outcome_washout_days
    FROM ${schema}.${cTablePrefix}case_settings cs
    INNER JOIN ${schema}.${cTablePrefix}target_settings ts
      ON cs.characterization_target_id = ts.characterization_target_id
      AND cs.database_id = ts.database_id
      AND cs.setting_id = ts.setting_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_count cc
      ON cc.cohort_id = ts.target_id
      AND cc.database_id = ts.database_id
    INNER JOIN ${schema}.${databaseTable} d
      ON cs.database_id = d.database_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition target
      ON ts.target_id = target.cohort_definition_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition outcome
      ON cs.outcome_id = outcome.cohort_definition_id
    WHERE 1 = 1
      ${targetClause}
      ${outcomeClause}
      ${dbClause}
  `;

  const rows = await queryDb(sql, params);
  return rows.map((r) => ({
    databaseName: r["databaseName"] as string,
    databaseId: r["databaseId"] as string,
    targetName: r["targetName"] as string,
    targetId: r["targetId"] as number,
    outcomeName: r["outcomeName"] as string,
    outcomeId: r["outcomeId"] as number,
    rowCount: r["rowCount"] as number,
    personCount: r["personCount"] as number,
    withoutExcludedPersonCount: r["withoutExcludedPersonCount"] as number,
    minPriorObservation: r["minPriorObservation"] as number,
    outcomeWashoutDays: r["outcomeWashoutDays"] as number,
  }));
}

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
}: RiskFactorOptions): Promise<BinaryRiskFactorResult[]> {
  if (targetId === null || targetId === undefined)
    throw new Error("targetId must be entered");
  if (outcomeId === null || outcomeId === undefined)
    throw new Error("outcomeId must be entered");
  if (Array.isArray(targetId)) throw new Error("Must be single targetId");
  if (Array.isArray(outcomeId)) throw new Error("Must be single outcomeId");

  const params: NamedParams = { targetId, outcomeId };

  const dbClause = addOptionalClause(
    databaseIds !== null && databaseIds !== undefined,
    `AND rfc.database_id IN (${buildInClause("databaseId", toArray(databaseIds ?? []) as (string | number)[], params)})`,
  );
  const rwStartClause = addOptionalClause(
    riskWindowStart !== null && riskWindowStart !== undefined,
    "AND cs.risk_window_start = @riskWindowStart",
  );
  if (riskWindowStart !== null && riskWindowStart !== undefined)
    params["riskWindowStart"] = riskWindowStart as number;
  const rwEndClause = addOptionalClause(
    riskWindowEnd !== null && riskWindowEnd !== undefined,
    "AND cs.risk_window_end = @riskWindowEnd",
  );
  if (riskWindowEnd !== null && riskWindowEnd !== undefined)
    params["riskWindowEnd"] = riskWindowEnd as number;
  const startAnchorClause = addOptionalClause(
    startAnchor !== null && startAnchor !== undefined,
    "AND cs.start_anchor = @startAnchor",
  );
  if (startAnchor !== null && startAnchor !== undefined)
    params["startAnchor"] = startAnchor as string;
  const endAnchorClause = addOptionalClause(
    endAnchor !== null && endAnchor !== undefined,
    "AND cs.end_anchor = @endAnchor",
  );
  if (endAnchor !== null && endAnchor !== undefined)
    params["endAnchor"] = endAnchor as string;
  const analysisClause = addOptionalClause(
    analysisIds !== null && analysisIds !== undefined,
    `AND cr.analysis_id IN (${analysisIds !== null && analysisIds !== undefined ? buildInClause("analysisId", toArray(analysisIds) as (string | number)[], params) : ""})`,
  );

  const sql = `
    SELECT
      d.CDM_SOURCE_ABBREVIATION AS database_name,
      d.database_id,
      target.cohort_name AS target_name,
      ts.target_id AS target_cohort_id,
      outcome.cohort_name AS outcome_name,
      cs.outcome_id AS outcome_cohort_id,
      ts.min_prior_observation,
      cs.outcome_washout_days,
      cs.risk_window_start,
      cs.risk_window_end,
      cs.start_anchor,
      cs.end_anchor,
      cr.covariate_name,
      cr.covariate_id,
      rfc.case_sum_value,
      rfc.case_average_value,
      rfc.non_case_sum_value,
      rfc.non_case_average_value,
      rfc.standardized_mean_difference,
      MAX(CASE WHEN rfc.case_average_value > 0 AND rfc.case_sum_value > 0
        THEN ROUND(rfc.case_sum_value::float / rfc.case_average_value) END)
        OVER (PARTITION BY rfc.characterization_case_id, rfc.database_id) AS case_person_count,
      MAX(CASE WHEN rfc.non_case_average_value > 0 AND rfc.non_case_sum_value > 0
        THEN ROUND(rfc.non_case_sum_value::float / rfc.non_case_average_value) END)
        OVER (PARTITION BY rfc.characterization_case_id, rfc.database_id) AS non_case_person_count
    FROM ${schema}.${cTablePrefix}risk_factor_covariates rfc
    INNER JOIN ${schema}.${cTablePrefix}case_settings cs
      ON rfc.characterization_case_id = cs.characterization_case_id
      AND rfc.database_id = cs.database_id
      AND rfc.setting_id = cs.setting_id
    INNER JOIN ${schema}.${cTablePrefix}target_settings ts
      ON cs.characterization_target_id = ts.characterization_target_id
      AND cs.database_id = ts.database_id
      AND cs.setting_id = ts.setting_id
    INNER JOIN ${schema}.${cTablePrefix}covariate_ref cr
      ON rfc.covariate_id = cr.covariate_id
      AND rfc.database_id = cr.database_id
      AND rfc.setting_id = cr.setting_id
    INNER JOIN ${schema}.${databaseTable} d
      ON rfc.database_id = d.database_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition target
      ON ts.target_id = target.cohort_definition_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition outcome
      ON cs.outcome_id = outcome.cohort_definition_id
    WHERE ts.target_id = @targetId
      AND cs.outcome_id = @outcomeId
      ${dbClause}
      ${rwStartClause}
      ${rwEndClause}
      ${startAnchorClause}
      ${endAnchorClause}
      ${analysisClause}
  `;

  const rows = await queryDb(sql, params);
  return rows.map((r) => ({
    databaseName: r["databaseName"] as string,
    databaseId: r["databaseId"] as string,
    targetName: r["targetName"] as string,
    targetCohortId: r["targetCohortId"] as number,
    outcomeName: r["outcomeName"] as string,
    outcomeCohortId: r["outcomeCohortId"] as number,
    minPriorObservation: r["minPriorObservation"] as number,
    outcomeWashoutDays: r["outcomeWashoutDays"] as number,
    riskWindowStart: r["riskWindowStart"] as number,
    riskWindowEnd: r["riskWindowEnd"] as number,
    startAnchor: r["startAnchor"] as string,
    endAnchor: r["endAnchor"] as string,
    covariateName: r["covariateName"] as string,
    covariateNameParsed: parseCovariateNameString(r["covariateName"] as string),
    covariateId: r["covariateId"] as number,
    casePersonCount: r["casePersonCount"] as number,
    nonCasePersonCount: r["nonCasePersonCount"] as number,
    caseCount: r["caseSumValue"] as number,
    caseAverage: r["caseAverageValue"] as number,
    nonCaseCount: r["nonCaseSumValue"] as number,
    nonCaseAverage: r["nonCaseAverageValue"] as number,
    SMD: r["standardizedMeanDifference"] as number,
    absSMD: Math.abs((r["standardizedMeanDifference"] as number) ?? 0),
  }));
}

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
}: RiskFactorOptions): Promise<ContinuousRiskFactorResult[]> {
  if (targetId === null || targetId === undefined)
    throw new Error("targetId must be entered");
  if (outcomeId === null || outcomeId === undefined)
    throw new Error("outcomeId must be entered");
  if (Array.isArray(targetId)) throw new Error("Must be single targetId");
  if (Array.isArray(outcomeId)) throw new Error("Must be single outcomeId");

  const params: NamedParams = { targetId, outcomeId };

  const dbClause = addOptionalClause(
    databaseIds !== null && databaseIds !== undefined,
    `AND rfc.database_id IN (${buildInClause("databaseId", toArray(databaseIds ?? []) as (string | number)[], params)})`,
  );
  const rwStartClause = addOptionalClause(
    riskWindowStart !== null && riskWindowStart !== undefined,
    "AND cs.risk_window_start = @riskWindowStart",
  );
  if (riskWindowStart !== null && riskWindowStart !== undefined)
    params["riskWindowStart"] = riskWindowStart as number;
  const rwEndClause = addOptionalClause(
    riskWindowEnd !== null && riskWindowEnd !== undefined,
    "AND cs.risk_window_end = @riskWindowEnd",
  );
  if (riskWindowEnd !== null && riskWindowEnd !== undefined)
    params["riskWindowEnd"] = riskWindowEnd as number;
  const startAnchorClause = addOptionalClause(
    startAnchor !== null && startAnchor !== undefined,
    "AND cs.start_anchor = @startAnchor",
  );
  if (startAnchor !== null && startAnchor !== undefined)
    params["startAnchor"] = startAnchor as string;
  const endAnchorClause = addOptionalClause(
    endAnchor !== null && endAnchor !== undefined,
    "AND cs.end_anchor = @endAnchor",
  );
  if (endAnchor !== null && endAnchor !== undefined)
    params["endAnchor"] = endAnchor as string;
  const analysisClause = addOptionalClause(
    analysisIds !== null && analysisIds !== undefined,
    `AND cr.analysis_id IN (${analysisIds !== null && analysisIds !== undefined ? buildInClause("analysisId", toArray(analysisIds) as (string | number)[], params) : ""})`,
  );

  const sql = `
    SELECT
      d.CDM_SOURCE_ABBREVIATION AS database_name,
      d.database_id,
      target.cohort_name AS target_name,
      ts.target_id AS target_cohort_id,
      outcome.cohort_name AS outcome_name,
      cs.outcome_id AS outcome_cohort_id,
      ts.min_prior_observation,
      cs.outcome_washout_days,
      cs.risk_window_start,
      cs.risk_window_end,
      cs.start_anchor,
      cs.end_anchor,
      cr.covariate_name,
      cr.covariate_id,
      rfc.case_count_value,
      rfc.case_min_value,
      rfc.case_max_value,
      rfc.case_average_value,
      rfc.case_standard_deviation,
      rfc.case_median_value,
      rfc.case_p_10_value,
      rfc.case_p_25_value,
      rfc.case_p_75_value,
      rfc.case_p_90_value,
      rfc.non_case_count_value,
      rfc.non_case_min_value,
      rfc.non_case_max_value,
      rfc.non_case_average_value,
      rfc.non_case_standard_deviation,
      rfc.non_case_median_value,
      rfc.non_case_p_10_value,
      rfc.non_case_p_25_value,
      rfc.non_case_p_75_value,
      rfc.non_case_p_90_value,
      rfc.standardized_mean_difference
    FROM ${schema}.${cTablePrefix}risk_factor_covariates_continuous rfc
    INNER JOIN ${schema}.${cTablePrefix}case_settings cs
      ON rfc.characterization_case_id = cs.characterization_case_id
      AND rfc.database_id = cs.database_id
      AND rfc.setting_id = cs.setting_id
    INNER JOIN ${schema}.${cTablePrefix}target_settings ts
      ON cs.characterization_target_id = ts.characterization_target_id
      AND cs.database_id = ts.database_id
      AND cs.setting_id = ts.setting_id
    INNER JOIN ${schema}.${cTablePrefix}covariate_ref cr
      ON rfc.covariate_id = cr.covariate_id
      AND rfc.database_id = cr.database_id
      AND rfc.setting_id = cr.setting_id
    INNER JOIN ${schema}.${databaseTable} d
      ON rfc.database_id = d.database_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition target
      ON ts.target_id = target.cohort_definition_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition outcome
      ON cs.outcome_id = outcome.cohort_definition_id
    WHERE ts.target_id = @targetId
      AND cs.outcome_id = @outcomeId
      ${dbClause}
      ${rwStartClause}
      ${rwEndClause}
      ${startAnchorClause}
      ${endAnchorClause}
      ${analysisClause}
  `;

  const rows = await queryDb(sql, params);
  return rows.map((r) => ({
    databaseName: r["databaseName"] as string,
    databaseId: r["databaseId"] as string,
    targetName: r["targetName"] as string,
    targetCohortId: r["targetCohortId"] as number,
    outcomeName: r["outcomeName"] as string,
    outcomeCohortId: r["outcomeCohortId"] as number,
    minPriorObservation: r["minPriorObservation"] as number,
    outcomeWashoutDays: r["outcomeWashoutDays"] as number,
    riskWindowStart: r["riskWindowStart"] as number,
    riskWindowEnd: r["riskWindowEnd"] as number,
    startAnchor: r["startAnchor"] as string,
    endAnchor: r["endAnchor"] as string,
    covariateName: r["covariateName"] as string,
    covariateNameParsed: parseCovariateNameString(r["covariateName"] as string),
    covariateId: r["covariateId"] as number,
    caseCountValue: r["caseCountValue"] as number,
    caseMinValue: r["caseMinValue"] as number,
    caseMaxValue: r["caseMaxValue"] as number,
    caseAverageValue: r["caseAverageValue"] as number,
    caseStandardDeviation: r["caseStandardDeviation"] as number,
    caseMedianValue: r["caseMedianValue"] as number,
    caseP10Value: r["caseP10Value"] as number,
    caseP25Value: r["caseP25Value"] as number,
    caseP75Value: r["caseP75Value"] as number,
    caseP90Value: r["caseP90Value"] as number,
    targetCountValue: r["nonCaseCountValue"] as number,
    targetMinValue: r["nonCaseMinValue"] as number,
    targetMaxValue: r["nonCaseMaxValue"] as number,
    targetAverageValue: r["nonCaseAverageValue"] as number,
    targetStandardDeviation: r["nonCaseStandardDeviation"] as number,
    targetMedianValue: r["nonCaseMedianValue"] as number,
    targetP10Value: r["nonCaseP10Value"] as number,
    targetP25Value: r["nonCaseP25Value"] as number,
    targetP75Value: r["nonCaseP75Value"] as number,
    targetP90Value: r["nonCaseP90Value"] as number,
    SMD: r["standardizedMeanDifference"] as number,
    absSMD: Math.abs((r["standardizedMeanDifference"] as number) ?? 0),
  }));
}
