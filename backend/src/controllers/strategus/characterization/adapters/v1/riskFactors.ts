import { queryDb } from "#config/db.js";
import { toArray, addFilterParam } from "#shared/queryHelpers.js";
import logger from "#utils/logger.js";
import { parseCovariateNameString } from "../parseCovariateNameString.js";
import type {
  CaseCountOptions,
  CaseTargetCountOptions,
  RiskFactorOptions,
  IdFilter,
  CaseCountResult,
  CaseTargetCountResult,
  BinaryRiskFactorResult,
  ContinuousRiskFactorResult,
} from "#types/index.js";
import type { NamedParams } from "#types/index.js";

type Row = Record<string, unknown>;

type InternalRiskFactorOptions = RiskFactorOptions & {
  targetIds?: IdFilter;
  outcomeIds?: IdFilter;
};

async function getCaseBinaryFeatures({
  schema,
  cTablePrefix = "c_",
  cgTablePrefix = "cg_",
  databaseTable = "database_meta_data",
  targetIds = null,
  outcomeIds = null,
  databaseIds = null,
  analysisIds = null,
  riskWindowStart = null,
  riskWindowEnd = null,
  startAnchor = null,
  endAnchor = null,
}: InternalRiskFactorOptions): Promise<Row[]> {
  const params: NamedParams = {};

  const analysisFilter =
    analysisIds !== null && analysisIds !== undefined
      ? `(SELECT * FROM ${schema}.${cTablePrefix}covariate_ref WHERE analysis_id IN (${addFilterParam(toArray(analysisIds) as (string | number)[], (ic) => ic, "analysisId", params)}))`
      : `${schema}.${cTablePrefix}covariate_ref`;

  const targetClause = addFilterParam(
    toArray(targetIds ?? []) as (string | number)[],
    (ic) => `AND c.TARGET_COHORT_ID IN (${ic})`,
    "targetId",
    params,
  );
  const outcomeClause = addFilterParam(
    toArray(outcomeIds ?? []) as (string | number)[],
    (ic) => `AND c.OUTCOME_COHORT_ID IN (${ic})`,
    "outcomeId",
    params,
  );
  const dbClause = addFilterParam(
    toArray(databaseIds ?? []) as (string | number)[],
    (ic) => `AND c.database_id IN (${ic})`,
    "databaseId",
    params,
  );
  const rwStartClause = addFilterParam(
    toArray(riskWindowStart ?? []) as (string | number)[],
    (ic) => `AND s.RISK_WINDOW_START IN (${ic})`,
    "rwStart",
    params,
  );
  const rwEndClause = addFilterParam(
    toArray(riskWindowEnd ?? []) as (string | number)[],
    (ic) => `AND s.RISK_WINDOW_END IN (${ic})`,
    "rwEnd",
    params,
  );
  const startAnchorClause = addFilterParam(
    toArray(startAnchor ?? []) as (string | number)[],
    (ic) => `AND s.START_ANCHOR IN (${ic})`,
    "startAnchor",
    params,
  );
  const endAnchorClause = addFilterParam(
    toArray(endAnchor ?? []) as (string | number)[],
    (ic) => `AND s.END_ANCHOR IN (${ic})`,
    "endAnchor",
    params,
  );

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

async function getCaseTargetBinaryFeatures({
  schema,
  cTablePrefix = "c_",
  cgTablePrefix = "cg_",
  databaseTable = "database_meta_data",
  targetIds = null,
  outcomeIds = null,
  databaseIds = null,
  analysisIds = null,
}: InternalRiskFactorOptions): Promise<Row[]> {
  const params: NamedParams = {};

  const analysisFilter =
    analysisIds !== null && analysisIds !== undefined
      ? `(SELECT * FROM ${schema}.${cTablePrefix}covariate_ref WHERE analysis_id IN (${addFilterParam(toArray(analysisIds) as (string | number)[], (ic) => ic, "analysisId", params)}))`
      : `${schema}.${cTablePrefix}covariate_ref`;

  const targetClause = addFilterParam(
    toArray(targetIds ?? []) as (string | number)[],
    (ic) => `AND tcd.target_cohort_id IN (${ic})`,
    "targetId",
    params,
  );
  const outcomeClause = addFilterParam(
    toArray(outcomeIds ?? []) as (string | number)[],
    (ic) => `AND tcd.outcome_cohort_id IN (${ic})`,
    "outcomeId",
    params,
  );
  const cTargetClause = addFilterParam(
    toArray(targetIds ?? []) as (string | number)[],
    (ic) => `AND c.TARGET_COHORT_ID IN (${ic})`,
    "targetId",
    params,
  );
  const dbClause = addFilterParam(
    toArray(databaseIds ?? []) as (string | number)[],
    (ic) => `AND c.database_id IN (${ic})`,
    "databaseId",
    params,
  );
  const exTargetClause = addFilterParam(
    toArray(targetIds ?? []) as (string | number)[],
    (ic) => `AND c.TARGET_COHORT_ID IN (${ic})`,
    "targetId",
    params,
  );
  const exOutcomeClause = addFilterParam(
    toArray(outcomeIds ?? []) as (string | number)[],
    (ic) => `AND c.OUTCOME_COHORT_ID IN (${ic})`,
    "outcomeId",
    params,
  );
  const exDbClause = addFilterParam(
    toArray(databaseIds ?? []) as (string | number)[],
    (ic) => `AND c.database_id IN (${ic})`,
    "databaseId",
    params,
  );

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
        ${exDbClause}
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

async function getCaseContinuousFeatures({
  schema,
  cTablePrefix = "c_",
  cgTablePrefix = "cg_",
  databaseTable = "database_meta_data",
  targetIds = null,
  outcomeIds = null,
  analysisIds = null,
  databaseIds = null,
  riskWindowStart = null,
  riskWindowEnd = null,
  startAnchor = null,
  endAnchor = null,
}: InternalRiskFactorOptions): Promise<Row[]> {
  const params: NamedParams = {};

  const analysisFilter =
    analysisIds !== null && analysisIds !== undefined
      ? `WHERE analysis_id IN (${addFilterParam(toArray(analysisIds) as (string | number)[], (ic) => ic, "analysisId", params)})`
      : "";

  const targetClause = addFilterParam(
    toArray(targetIds ?? []) as (string | number)[],
    (ic) => `AND c.TARGET_COHORT_ID IN (${ic})`,
    "targetId",
    params,
  );
  const outcomeClause = addFilterParam(
    toArray(outcomeIds ?? []) as (string | number)[],
    (ic) => `AND c.outcome_cohort_id IN (${ic})`,
    "outcomeId",
    params,
  );
  const dbClause = addFilterParam(
    toArray(databaseIds ?? []) as (string | number)[],
    (ic) => `AND c.database_id IN (${ic})`,
    "databaseId",
    params,
  );
  const rwStartClause = addFilterParam(
    toArray(riskWindowStart ?? []) as (string | number)[],
    (ic) => `AND s.RISK_WINDOW_START IN (${ic})`,
    "rwStart",
    params,
  );
  const rwEndClause = addFilterParam(
    toArray(riskWindowEnd ?? []) as (string | number)[],
    (ic) => `AND s.RISK_WINDOW_END IN (${ic})`,
    "rwEnd",
    params,
  );
  const startAnchorClause = addFilterParam(
    toArray(startAnchor ?? []) as (string | number)[],
    (ic) => `AND s.START_ANCHOR IN (${ic})`,
    "startAnchor",
    params,
  );
  const endAnchorClause = addFilterParam(
    toArray(endAnchor ?? []) as (string | number)[],
    (ic) => `AND s.END_ANCHOR IN (${ic})`,
    "endAnchor",
    params,
  );

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

async function getTargetContinuousFeatures({
  schema,
  cTablePrefix = "c_",
  cgTablePrefix = "cg_",
  databaseTable = "database_meta_data",
  targetIds = null,
  analysisIds = null,
  databaseIds = null,
}: InternalRiskFactorOptions): Promise<Row[]> {
  const params: NamedParams = {};

  const analysisFilter =
    analysisIds !== null && analysisIds !== undefined
      ? `WHERE analysis_id IN (${addFilterParam(toArray(analysisIds) as (string | number)[], (ic) => ic, "analysisId", params)})`
      : "";

  const targetClause = addFilterParam(
    toArray(targetIds ?? []) as (string | number)[],
    (ic) => `AND c.TARGET_COHORT_ID IN (${ic})`,
    "targetId",
    params,
  );
  const dbClause = addFilterParam(
    toArray(databaseIds ?? []) as (string | number)[],
    (ic) => `AND c.database_id IN (${ic})`,
    "databaseId",
    params,
  );

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

function processBinaryRiskFactorFeatures({
  caseCounts,
  targetCounts,
  caseFeatures,
  targetFeatures,
}: {
  caseCounts: Row[];
  targetCounts: Row[];
  caseFeatures: Row[];
  targetFeatures: Row[];
}): BinaryRiskFactorResult[] | null {
  if (!targetCounts.length || !caseCounts.length) {
    logger.warn("No targets or outcomes");
    return null;
  }

  const caseCountIndex = new Map<string, Row>();
  for (const r of caseCounts) {
    caseCountIndex.set(
      `${r["databaseId"]}|${r["minPriorObservation"]}|${r["outcomeWashoutDays"]}|${r["riskWindowStart"]}|${r["riskWindowEnd"]}|${r["startAnchor"]}|${r["endAnchor"]}`,
      r,
    );
  }

  const targetCountIndex = new Map<string, Row>();
  for (const r of targetCounts) {
    targetCountIndex.set(
      `${r["databaseId"]}|${r["minPriorObservation"]}|${r["outcomeWashoutDays"]}`,
      r,
    );
  }

  const caseFeatIndex = new Map<string, Map<string, Row>>();
  for (const r of caseFeatures) {
    if ((r["sumValue"] as number) < 0) continue;
    const pKey = `${r["databaseId"]}|${r["minPriorObservation"]}|${r["outcomeWashoutDays"]}|${r["riskWindowStart"]}|${r["riskWindowEnd"]}|${r["startAnchor"]}|${r["endAnchor"]}`;
    let inner = caseFeatIndex.get(pKey);
    if (!inner) {
      inner = new Map();
      caseFeatIndex.set(pKey, inner);
    }
    inner.set(
      `${r["targetCohortId"]}|${r["outcomeCohortId"]}|${r["covariateId"]}`,
      r,
    );
  }

  const targetFeatIndex = new Map<string, Row[]>();
  for (const r of targetFeatures) {
    if ((r["sumValue"] as number) < 0) continue;
    const key = `${r["databaseId"]}|${r["minPriorObservation"]}|${r["outcomeWashoutDays"]}`;
    let arr = targetFeatIndex.get(key);
    if (!arr) {
      arr = [];
      targetFeatIndex.set(key, arr);
    }
    arr.push(r);
  }

  const allData: BinaryRiskFactorResult[] = [];
  const seenParamKeys = new Set<string>();

  for (const cc of caseCounts) {
    const pKey = `${cc["databaseId"]}|${cc["minPriorObservation"]}|${cc["outcomeWashoutDays"]}|${cc["riskWindowStart"]}|${cc["riskWindowEnd"]}|${cc["startAnchor"]}|${cc["endAnchor"]}`;
    if (seenParamKeys.has(pKey)) continue;
    seenParamKeys.add(pKey);

    const caseCount = caseCountIndex.get(pKey);
    const tcKey = `${cc["databaseId"]}|${cc["minPriorObservation"]}|${cc["outcomeWashoutDays"]}`;
    const targetCount = targetCountIndex.get(tcKey);

    if (!caseCount || !targetCount) continue;
    const casePersonCount = caseCount["personCount"] as number;
    const targetPersonCount = targetCount["personCount"] as number;
    if (casePersonCount <= 0 || targetPersonCount <= 0) continue;

    const nonCaseCount = targetPersonCount - casePersonCount;
    const caseFeatMap = caseFeatIndex.get(pKey) ?? new Map<string, Row>();
    const targetFeats = targetFeatIndex.get(tcKey) ?? [];

    for (const t of targetFeats) {
      const c = caseFeatMap.get(
        `${t["targetCohortId"]}|${t["outcomeCohortId"]}|${t["covariateId"]}`,
      );

      const cc_val = (c?.["sumValue"] as number) ?? 0;
      const ca = (c?.["averageValue"] as number) ?? 0;
      const nc = (t["sumValue"] as number) - cc_val;
      const nca = nonCaseCount === 0 ? 0 : nc / nonCaseCount;
      const meanDiff = ca - nca;

      const std1 =
        casePersonCount === 0
          ? 0
          : Math.sqrt(
              ((1 - ca) ** 2 * cc_val +
                (-ca) ** 2 * (casePersonCount - cc_val)) /
                casePersonCount,
            );
      const std2 =
        nonCaseCount === 0
          ? 0
          : Math.sqrt(
              ((1 - nca) ** 2 * nc + (-nca) ** 2 * (nonCaseCount - nc)) /
                nonCaseCount,
            );

      const denom = Math.sqrt((std1 ** 2 + std2 ** 2) / 2);
      const smd = denom === 0 ? 0 : meanDiff / denom;

      allData.push({
        databaseName: t["databaseName"] as string,
        databaseId: t["databaseId"] as string,
        targetName: t["targetName"] as string,
        targetCohortId: t["targetCohortId"] as number,
        outcomeName: t["outcomeName"] as string,
        outcomeCohortId: t["outcomeCohortId"] as number,
        minPriorObservation: t["minPriorObservation"] as number,
        outcomeWashoutDays: t["outcomeWashoutDays"] as number,
        riskWindowStart: (c?.["riskWindowStart"] ??
          cc["riskWindowStart"]) as number,
        riskWindowEnd: (c?.["riskWindowEnd"] ?? cc["riskWindowEnd"]) as number,
        startAnchor: (c?.["startAnchor"] ?? cc["startAnchor"]) as string,
        endAnchor: (c?.["endAnchor"] ?? cc["endAnchor"]) as string,
        covariateName: t["covariateName"] as string,
        covariateNameParsed: parseCovariateNameString(
          t["covariateName"] as string,
        ),
        covariateId: t["covariateId"] as number,
        casePersonCount,
        nonCasePersonCount: nonCaseCount,
        caseCount: ca < 0 ? -Math.abs(cc_val) : cc_val,
        caseAverage: ca,
        nonCaseCount: nc,
        nonCaseAverage: nca,
        SMD: smd,
        absSMD: Math.abs(smd),
      });
    }
  }

  return allData;
}

function processContinuousRiskFactorFeatures({
  caseFeatures,
  targetFeatures,
}: {
  caseFeatures: Row[];
  targetFeatures: Row[];
}): ContinuousRiskFactorResult[] | null {
  const outcomeKeysSeen = new Set<string>();
  const outcomes: Row[] = [];
  for (const r of caseFeatures) {
    const key = `${r["outcomeCohortId"]}|${r["outcomeWashoutDays"]}|${r["riskWindowStart"]}|${r["riskWindowEnd"]}|${r["startAnchor"]}|${r["endAnchor"]}`;
    if (!outcomeKeysSeen.has(key)) {
      outcomeKeysSeen.add(key);
      outcomes.push({
        outcomeName: r["outcomeName"],
        outcomeCohortId: r["outcomeCohortId"],
        outcomeWashoutDays: r["outcomeWashoutDays"],
        riskWindowStart: r["riskWindowStart"],
        riskWindowEnd: r["riskWindowEnd"],
        startAnchor: r["startAnchor"],
        endAnchor: r["endAnchor"],
      });
    }
  }

  if (outcomes.length === 0) return null;

  const caseIndex = new Map<string, Map<string, Row>>();
  for (const r of caseFeatures) {
    const oKey = `${r["outcomeCohortId"]}|${r["outcomeWashoutDays"]}|${r["riskWindowStart"]}|${r["riskWindowEnd"]}|${r["startAnchor"]}|${r["endAnchor"]}`;
    let inner = caseIndex.get(oKey);
    if (!inner) {
      inner = new Map();
      caseIndex.set(oKey, inner);
    }
    inner.set(
      `${r["databaseId"]}|${r["targetCohortId"]}|${r["minPriorObservation"]}|${r["covariateId"]}`,
      {
        outcomeName: r["outcomeName"],
        outcomeCohortId: r["outcomeCohortId"],
        outcomeWashoutDays: r["outcomeWashoutDays"],
        riskWindowStart: r["riskWindowStart"],
        riskWindowEnd: r["riskWindowEnd"],
        startAnchor: r["startAnchor"],
        endAnchor: r["endAnchor"],
        caseCountValue: r["countValue"],
        caseMinValue: r["minValue"],
        caseMaxValue: r["maxValue"],
        caseAverageValue: r["averageValue"],
        caseStandardDeviation: r["standardDeviation"],
        caseMedianValue: r["medianValue"],
        caseP10Value: r["p10Value"],
        caseP25Value: r["p25Value"],
        caseP75Value: r["p75Value"],
        caseP90Value: r["p90Value"],
      },
    );
  }

  const renamedTargets = targetFeatures.map((r) => ({
    databaseName: r["databaseName"],
    databaseId: r["databaseId"],
    targetName: r["targetName"],
    targetCohortId: r["targetCohortId"],
    minPriorObservation: r["minPriorObservation"],
    covariateName: r["covariateName"],
    covariateNameParsed: parseCovariateNameString(r["covariateName"] as string),
    covariateId: r["covariateId"],
    targetCountValue: r["countValue"],
    targetMinValue: r["minValue"],
    targetMaxValue: r["maxValue"],
    targetAverageValue: r["averageValue"],
    targetStandardDeviation: r["standardDeviation"],
    targetMedianValue: r["medianValue"],
    targetP10Value: r["p10Value"],
    targetP25Value: r["p25Value"],
    targetP75Value: r["p75Value"],
    targetP90Value: r["p90Value"],
  }));

  const allData: ContinuousRiskFactorResult[] = [];

  for (const o of outcomes) {
    const oKey = `${o["outcomeCohortId"]}|${o["outcomeWashoutDays"]}|${o["riskWindowStart"]}|${o["riskWindowEnd"]}|${o["startAnchor"]}|${o["endAnchor"]}`;
    const innerCaseMap = caseIndex.get(oKey) ?? new Map<string, Row>();

    for (const t of renamedTargets) {
      if (t.targetCohortId === o["outcomeCohortId"]) continue;
      const c = innerCaseMap.get(
        `${t.databaseId}|${t.targetCohortId}|${t.minPriorObservation}|${t.covariateId}`,
      );

      const caseAverageValue = (c?.["caseAverageValue"] as number) ?? 0;
      const caseStandardDeviation =
        (c?.["caseStandardDeviation"] as number) ?? 0;
      const denom = Math.sqrt(
        (caseStandardDeviation ** 2 +
          (t.targetStandardDeviation as number) ** 2) /
          2,
      );
      const SMD =
        denom === 0
          ? 0
          : (caseAverageValue - (t.targetAverageValue as number)) / denom;

      allData.push({
        ...t,
        outcomeCohortId: (c?.["outcomeCohortId"] ??
          o["outcomeCohortId"]) as number,
        outcomeName: (c?.["outcomeName"] ?? o["outcomeName"]) as string,
        outcomeWashoutDays: (c?.["outcomeWashoutDays"] ??
          o["outcomeWashoutDays"]) as number,
        riskWindowStart: (c?.["riskWindowStart"] ??
          o["riskWindowStart"]) as number,
        riskWindowEnd: (c?.["riskWindowEnd"] ?? o["riskWindowEnd"]) as number,
        startAnchor: (c?.["startAnchor"] ?? o["startAnchor"]) as string,
        endAnchor: (c?.["endAnchor"] ?? o["endAnchor"]) as string,
        caseCountValue: (c?.["caseCountValue"] as number) ?? 0,
        caseMinValue: (c?.["caseMinValue"] as number) ?? 0,
        caseMaxValue: (c?.["caseMaxValue"] as number) ?? 0,
        caseAverageValue,
        caseStandardDeviation,
        caseMedianValue: (c?.["caseMedianValue"] as number) ?? 0,
        caseP10Value: (c?.["caseP10Value"] as number) ?? 0,
        caseP25Value: (c?.["caseP25Value"] as number) ?? 0,
        caseP75Value: (c?.["caseP75Value"] as number) ?? 0,
        caseP90Value: (c?.["caseP90Value"] as number) ?? 0,
        SMD,
        absSMD: Math.abs(SMD),
      } as ContinuousRiskFactorResult);
    }
  }

  return allData;
}

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
    (ic) => `AND cc.TARGET_COHORT_ID IN (${ic})`,
    "targetId",
    params,
  );
  const outcomeClause = addFilterParam(
    toArray(outcomeIds ?? []) as (string | number)[],
    (ic) => `AND cc.OUTCOME_COHORT_ID IN (${ic})`,
    "outcomeId",
    params,
  );
  const dbClause = addFilterParam(
    toArray(databaseIds ?? []) as (string | number)[],
    (ic) => `AND d.database_id IN (${ic})`,
    "databaseId",
    params,
  );
  const rwStartClause = addFilterParam(
    toArray(riskWindowStart ?? []) as (string | number)[],
    (ic) => `AND cc.RISK_WINDOW_START IN (${ic})`,
    "rwStart",
    params,
  );
  const rwEndClause = addFilterParam(
    toArray(riskWindowEnd ?? []) as (string | number)[],
    (ic) => `AND cc.RISK_WINDOW_END IN (${ic})`,
    "rwEnd",
    params,
  );
  const startAnchorClause = addFilterParam(
    toArray(startAnchor ?? []) as (string | number)[],
    (ic) => `AND cc.START_ANCHOR IN (${ic})`,
    "startAnchor",
    params,
  );
  const endAnchorClause = addFilterParam(
    toArray(endAnchor ?? []) as (string | number)[],
    (ic) => `AND cc.END_ANCHOR IN (${ic})`,
    "endAnchor",
    params,
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

  return queryDb(sql, params) as unknown as Promise<CaseCountResult[]>;
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
    (ic) => `AND tcd.target_cohort_id IN (${ic})`,
    "targetId",
    params,
  );
  const outcomeClause = addFilterParam(
    toArray(outcomeIds ?? []) as (string | number)[],
    (ic) => `AND tcd.outcome_cohort_id IN (${ic})`,
    "outcomeId",
    params,
  );
  const ccTargetClause = addFilterParam(
    toArray(targetIds ?? []) as (string | number)[],
    (ic) => `AND cc.TARGET_COHORT_ID IN (${ic})`,
    "targetId",
    params,
  );
  const dbClause = addFilterParam(
    toArray(databaseIds ?? []) as (string | number)[],
    (ic) => `AND cc.database_id IN (${ic})`,
    "databaseId",
    params,
  );
  const exTargetClause = addFilterParam(
    toArray(targetIds ?? []) as (string | number)[],
    (ic) => `AND cc.TARGET_COHORT_ID IN (${ic})`,
    "targetId",
    params,
  );
  const exOutcomeClause = addFilterParam(
    toArray(outcomeIds ?? []) as (string | number)[],
    (ic) => `AND cc.outcome_COHORT_ID IN (${ic})`,
    "outcomeId",
    params,
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

  return queryDb(sql, params) as unknown as Promise<CaseTargetCountResult[]>;
}

export async function getBinaryRiskFactors(
  options: RiskFactorOptions,
): Promise<BinaryRiskFactorResult[] | null> {
  const {
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
  } = options;

  if (targetId === null || targetId === undefined)
    throw new Error("targetId must be entered");
  if (outcomeId === null || outcomeId === undefined)
    throw new Error("outcomeId must be entered");
  if (Array.isArray(targetId)) throw new Error("Must be single targetId");
  if (Array.isArray(outcomeId)) throw new Error("Must be single outcomeId");

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
        targetId,
        outcomeId,
      }),
      getCaseTargetBinaryFeatures({
        ...shared,
        targetIds: targetId,
        outcomeIds: outcomeId,
        databaseIds: dbIds,
        analysisIds,
        targetId,
        outcomeId,
      }),
    ]);

  return processBinaryRiskFactorFeatures({
    caseCounts: caseCounts as unknown as Row[],
    targetCounts: targetCounts as unknown as Row[],
    caseFeatures,
    targetFeatures,
  });
}

export async function getContinuousRiskFactors(
  options: RiskFactorOptions,
): Promise<ContinuousRiskFactorResult[] | null> {
  const {
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
  } = options;

  if (targetId === null || targetId === undefined)
    throw new Error("targetId must be entered");
  if (outcomeId === null || outcomeId === undefined)
    throw new Error("outcomeId must be entered");
  if (Array.isArray(targetId)) throw new Error("Must be single targetId");
  if (Array.isArray(outcomeId)) throw new Error("Must be single outcomeId");

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
      targetId,
      outcomeId,
    }),
    getTargetContinuousFeatures({
      ...shared,
      targetIds: targetId,
      analysisIds,
      databaseIds,
      targetId,
      outcomeId,
    }),
  ]);

  return processContinuousRiskFactorFeatures({ caseFeatures, targetFeatures });
}
