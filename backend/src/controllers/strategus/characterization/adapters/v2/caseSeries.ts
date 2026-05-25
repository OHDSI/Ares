import { queryDb } from "#config/db.js";
import { addFilterParam } from "#shared/queryHelpers.js";
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
    (ic) => `AND csc.database_id IN (${ic})`,
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
      "cs",
      params,
    );

  const sql = `
    SELECT
      d.CDM_SOURCE_ABBREVIATION AS database_name,
      d.database_id,
      target.cohort_name AS target_name,
      ts.target_id AS target_cohort_id,
      outcome.cohort_name AS outcome_name,
      cs.outcome_id AS outcome_cohort_id,
      cr.covariate_name,
      cr.covariate_id,
      ts.min_prior_observation,
      cs.outcome_washout_days,
      css.case_post_outcome_duration,
      css.case_pre_target_duration,
      cs.risk_window_start,
      cs.start_anchor,
      cs.risk_window_end,
      cs.end_anchor,
      csc.before_sum_value,
      csc.before_average_value,
      csc.during_sum_value,
      csc.during_average_value,
      csc.after_sum_value,
      csc.after_average_value
    FROM ${schema}.${cTablePrefix}case_series_covariates csc
    INNER JOIN ${schema}.${cTablePrefix}case_settings cs
      ON csc.characterization_case_id = cs.characterization_case_id
      AND csc.database_id = cs.database_id
      AND csc.setting_id = cs.setting_id
    INNER JOIN ${schema}.${cTablePrefix}target_settings ts
      ON cs.characterization_target_id = ts.characterization_target_id
      AND cs.database_id = ts.database_id
      AND cs.setting_id = ts.setting_id
    INNER JOIN ${schema}.${cTablePrefix}case_series_settings css
      ON css.setting_id = csc.setting_id
    INNER JOIN ${schema}.${cTablePrefix}covariate_ref cr
      ON csc.covariate_id = cr.covariate_id
      AND csc.database_id = cr.database_id
      AND csc.setting_id = cr.setting_id
    INNER JOIN ${schema}.${databaseTable} d
      ON csc.database_id = d.database_id
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
  `;

  const rows = await queryDb(sql, params);

  const minValNum =
    minVal !== null && minVal !== undefined ? minVal : undefined;
  const minValFilter: (v: number) => boolean =
    minValNum !== undefined ? (v) => v >= minValNum : () => true;

  const expanded: BinaryCaseSeriesResult[] = [];
  for (const r of rows) {
    const base = {
      databaseName: r["databaseName"] as string,
      databaseId: r["databaseId"] as string,
      targetName: r["targetName"] as string,
      targetCohortId: r["targetCohortId"] as number,
      outcomeName: r["outcomeName"] as string,
      outcomeCohortId: r["outcomeCohortId"] as number,
      covariateName: r["covariateName"] as string,
      covariateNameParsed: parseCovariateNameString(
        r["covariateName"] as string,
      ),
      covariateId: r["covariateId"] as number,
      minPriorObservation: r["minPriorObservation"] as number,
      outcomeWashoutDays: r["outcomeWashoutDays"] as number,
      casePostOutcomeDuration: r["casePostOutcomeDuration"] as number,
      casePreTargetDuration: r["casePreTargetDuration"] as number,
      riskWindowStart: r["riskWindowStart"] as number,
      startAnchor: r["startAnchor"] as string,
      riskWindowEnd: r["riskWindowEnd"] as number,
      endAnchor: r["endAnchor"] as string,
    };
    if (minValFilter((r["beforeAverageValue"] as number) ?? 0))
      expanded.push({
        ...base,
        type: "Before",
        sumValue: r["beforeSumValue"] as number,
        averageValue: r["beforeAverageValue"] as number,
      });
    if (minValFilter((r["duringAverageValue"] as number) ?? 0))
      expanded.push({
        ...base,
        type: "During",
        sumValue: r["duringSumValue"] as number,
        averageValue: r["duringAverageValue"] as number,
      });
    if (minValFilter((r["afterAverageValue"] as number) ?? 0))
      expanded.push({
        ...base,
        type: "After",
        sumValue: r["afterSumValue"] as number,
        averageValue: r["afterAverageValue"] as number,
      });
  }
  return expanded;
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
    (ic) => `AND csc.database_id IN (${ic})`,
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
      "cs",
      params,
    );

  const sql = `
    SELECT
      d.CDM_SOURCE_ABBREVIATION AS database_name,
      d.database_id,
      target.cohort_name AS target_name,
      ts.target_id AS target_cohort_id,
      outcome.cohort_name AS outcome_name,
      cs.outcome_id AS outcome_cohort_id,
      cr.covariate_name,
      cr.covariate_id,
      ts.min_prior_observation,
      cs.outcome_washout_days,
      css.case_post_outcome_duration,
      css.case_pre_target_duration,
      cs.risk_window_start,
      cs.start_anchor,
      cs.risk_window_end,
      cs.end_anchor,
      csc.before_count_value,
      csc.before_min_value,
      csc.before_max_value,
      csc.before_average_value,
      csc.before_standard_deviation,
      csc.before_median_value,
      csc.before_p_10_value,
      csc.before_p_25_value,
      csc.before_p_75_value,
      csc.before_p_90_value,
      csc.during_min_value,
      csc.during_max_value,
      csc.during_average_value,
      csc.during_standard_deviation,
      csc.during_median_value,
      csc.during_p_10_value,
      csc.during_p_25_value,
      csc.during_p_75_value,
      csc.during_p_90_value,
      csc.after_count_value,
      csc.after_min_value,
      csc.after_max_value,
      csc.after_average_value,
      csc.after_standard_deviation,
      csc.after_median_value,
      csc.after_p_10_value,
      csc.after_p_25_value,
      csc.after_p_75_value,
      csc.after_p_90_value
    FROM ${schema}.${cTablePrefix}case_series_covariates_continuous csc
    INNER JOIN ${schema}.${cTablePrefix}case_settings cs
      ON csc.characterization_case_id = cs.characterization_case_id
      AND csc.database_id = cs.database_id
      AND csc.setting_id = cs.setting_id
    INNER JOIN ${schema}.${cTablePrefix}target_settings ts
      ON cs.characterization_target_id = ts.characterization_target_id
      AND cs.database_id = ts.database_id
      AND cs.setting_id = ts.setting_id
    INNER JOIN ${schema}.${cTablePrefix}case_series_settings css
      ON css.setting_id = csc.setting_id
    INNER JOIN ${schema}.${cTablePrefix}covariate_ref cr
      ON csc.covariate_id = cr.covariate_id
      AND csc.database_id = cr.database_id
      AND csc.setting_id = cr.setting_id
    INNER JOIN ${schema}.${databaseTable} d
      ON csc.database_id = d.database_id
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
  `;

  const rows = await queryDb(sql, params);

  const expanded: Record<string, unknown>[] = [];
  for (const r of rows) {
    const base = {
      databaseName: r["databaseName"],
      databaseId: r["databaseId"],
      targetName: r["targetName"],
      targetCohortId: r["targetCohortId"],
      outcomeName: r["outcomeName"],
      outcomeCohortId: r["outcomeCohortId"],
      covariateName: r["covariateName"],
      covariateNameParsed: parseCovariateNameString(
        r["covariateName"] as string,
      ),
      covariateId: r["covariateId"],
      minPriorObservation: r["minPriorObservation"],
      outcomeWashoutDays: r["outcomeWashoutDays"],
      casePostOutcomeDuration: r["casePostOutcomeDuration"],
      casePreTargetDuration: r["casePreTargetDuration"],
      riskWindowStart: r["riskWindowStart"],
      startAnchor: r["startAnchor"],
      riskWindowEnd: r["riskWindowEnd"],
      endAnchor: r["endAnchor"],
    };
    expanded.push({
      ...base,
      type: "Before",
      countValue: r["beforeCountValue"],
      minValue: r["beforeMinValue"],
      maxValue: r["beforeMaxValue"],
      averageValue: r["beforeAverageValue"],
      standardDeviation: r["beforeStandardDeviation"],
      medianValue: r["beforeMedianValue"],
      p10Value: r["beforeP10Value"],
      p25Value: r["beforeP25Value"],
      p75Value: r["beforeP75Value"],
      p90Value: r["beforeP90Value"],
    });
    expanded.push({
      ...base,
      type: "During",
      countValue: null,
      minValue: r["duringMinValue"],
      maxValue: r["duringMaxValue"],
      averageValue: r["duringAverageValue"],
      standardDeviation: r["duringStandardDeviation"],
      medianValue: r["duringMedianValue"],
      p10Value: r["duringP10Value"],
      p25Value: r["duringP25Value"],
      p75Value: r["duringP75Value"],
      p90Value: r["duringP90Value"],
    });
    expanded.push({
      ...base,
      type: "After",
      countValue: r["afterCountValue"],
      minValue: r["afterMinValue"],
      maxValue: r["afterMaxValue"],
      averageValue: r["afterAverageValue"],
      standardDeviation: r["afterStandardDeviation"],
      medianValue: r["afterMedianValue"],
      p10Value: r["afterP10Value"],
      p25Value: r["afterP25Value"],
      p75Value: r["afterP75Value"],
      p90Value: r["afterP90Value"],
    });
  }
  return expanded;
}
