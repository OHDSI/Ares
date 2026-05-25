import { queryDb } from "#config/db.js";
import logger from "#utils/logger.js";
import {
  toArray,
  safeQuery,
  pivotType,
  addFilterParam,
} from "#shared/queryHelpers.js";
import type {
  TablePrefixOptions,
  OutcomeTableOptions,
  OutcomeAvailabilityOptions,
  OutcomeAvailabilityResult,
} from "#types/index.js";
import type { NamedParams } from "#types/index.js";

export async function getCharacterizationTargets({
  schema,
  cTablePrefix = "c_",
  cgTablePrefix = "cg_",
  useTte = true,
  useDcrc = true,
  useRf = true,
}: TablePrefixOptions & {
  useTte?: boolean;
  useDcrc?: boolean;
  useRf?: boolean;
}): Promise<Record<string, unknown>[] | null> {
  const allRows: Record<string, unknown>[] = [];

  if (useTte) {
    let tableOrView: string;
    try {
      await queryDb(
        `SELECT * FROM ${schema}.${cTablePrefix}time_to_event_targets LIMIT 1`,
      );
      tableOrView = `${schema}.${cTablePrefix}time_to_event_targets`;
    } catch {
      tableOrView = `(SELECT DISTINCT target_cohort_definition_id FROM ${schema}.${cTablePrefix}time_to_event)`;
    }
    const tteRows = await safeQuery(`
      SELECT
        cg.cohort_name,
        tte.target_cohort_definition_id AS cohort_definition_id,
        'timeToEvent' AS type,
        1 AS value
      FROM ${tableOrView} tte
      INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
        ON tte.target_cohort_definition_id = cg.cohort_definition_id
    `);
    if (tteRows) allRows.push(...tteRows);
  }

  if (useDcrc) {
    const dcrcRows = await safeQuery(`
      SELECT
        cg.cohort_name,
        dr.target_cohort_definition_id AS cohort_definition_id,
        'dechalRechal' AS type,
        1 AS value
      FROM (SELECT DISTINCT target_cohort_definition_id FROM ${schema}.${cTablePrefix}dechallenge_rechallenge) dr
      INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
        ON dr.target_cohort_definition_id = cg.cohort_definition_id
    `);
    if (dcrcRows) allRows.push(...dcrcRows);
  }

  if (useRf) {
    const rfRows1 = await safeQuery(`
      SELECT
        cg.cohort_name,
        cd.target_cohort_id AS cohort_definition_id,
        'riskFactors' AS type,
        1 AS value
      FROM (SELECT DISTINCT target_cohort_id FROM ${schema}.${cTablePrefix}cohort_details WHERE cohort_type IN ('Cases')) cd
      INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
        ON cd.target_cohort_id = cg.cohort_definition_id
    `);
    if (rfRows1) allRows.push(...rfRows1);

    const rfRows2 = await safeQuery(`
      SELECT
        cg.cohort_name,
        cd.target_cohort_id AS cohort_definition_id,
        'databaseComparator' AS type,
        1 AS value
      FROM (SELECT DISTINCT target_cohort_id FROM ${schema}.${cTablePrefix}cohort_details WHERE cohort_type IN ('Target')) cd
      INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
        ON cd.target_cohort_id = cg.cohort_definition_id
    `);
    if (rfRows2) allRows.push(...rfRows2);
  }

  if (allRows.length === 0) {
    logger.warn("No target data");
    return null;
  }

  const colTypes = [
    "timeToEvent",
    "dechalRechal",
    "riskFactors",
    "databaseComparator",
  ];
  const targets = pivotType(allRows, colTypes);

  for (const t of targets) {
    t["caseSeries"] = t["riskFactors"];
    t["cohortComparator"] = t["databaseComparator"];
  }

  return targets;
}

export async function getCharacterizationOutcomes({
  schema,
  cTablePrefix = "c_",
  cgTablePrefix = "cg_",
  targetId = null,
  useTte = true,
  useDcrc = true,
  useRf = true,
}: OutcomeTableOptions & {
  useTte?: boolean;
  useDcrc?: boolean;
  useRf?: boolean;
}): Promise<Record<string, unknown>[] | null> {
  const allRows: Record<string, unknown>[] = [];

  const params: NamedParams = {};
  const targetArr =
    targetId !== null && targetId !== undefined
      ? (toArray(targetId) as (string | number)[])
      : null;
  const targetClause = addFilterParam(
    targetArr,
    (ic) => `WHERE tte.target_cohort_definition_id IN (${ic})`,
    "targetId",
    params,
  );
  const drTargetClause = addFilterParam(
    targetArr,
    (ic) => `WHERE dr.target_cohort_definition_id IN (${ic})`,
    "targetId",
    params,
  );
  const cdTargetClause = addFilterParam(
    targetArr,
    (ic) => `AND cd.target_cohort_id IN (${ic})`,
    "targetId",
    params,
  );

  const detailParams: NamedParams = {};
  const detailTargetClause = addFilterParam(
    targetArr,
    (ic) => `AND target_cohort_id IN (${ic})`,
    "dtTargetId",
    detailParams,
  );

  const [tteRows, dcrcRows, rfRows, detailRows] = await Promise.all([
    useTte
      ? safeQuery(
          `
          SELECT
            cg.cohort_name,
            tte.outcome_cohort_definition_id AS cohort_definition_id,
            'timeToEvent' AS type,
            1 AS value
          FROM ${schema}.${cTablePrefix}time_to_event tte
          INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
            ON tte.outcome_cohort_definition_id = cg.cohort_definition_id
          ${targetClause}
          GROUP BY cg.cohort_name, tte.outcome_cohort_definition_id
        `,
          params,
        )
      : null,
    useDcrc
      ? safeQuery(
          `
          SELECT
            cg.cohort_name,
            dr.outcome_cohort_definition_id AS cohort_definition_id,
            'dechalRechal' AS type,
            1 AS value
          FROM ${schema}.${cTablePrefix}dechallenge_rechallenge dr
          INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
            ON dr.outcome_cohort_definition_id = cg.cohort_definition_id
          ${drTargetClause}
          GROUP BY cg.cohort_name, dr.outcome_cohort_definition_id
        `,
          params,
        )
      : null,
    useRf
      ? safeQuery(
          `
          SELECT
            cg.cohort_name,
            cd.outcome_cohort_id AS cohort_definition_id,
            'riskFactors' AS type,
            1 AS value
          FROM ${schema}.${cTablePrefix}cohort_details cd
          INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
            ON cd.outcome_cohort_id = cg.cohort_definition_id
          WHERE cd.cohort_type = 'Cases'
            ${cdTargetClause}
          GROUP BY cg.cohort_name, cd.outcome_cohort_id
        `,
          params,
        )
      : null,
    useRf
      ? safeQuery(
          `
          SELECT DISTINCT
            outcome_cohort_id AS cohort_definition_id,
            risk_window_start,
            risk_window_end,
            start_anchor,
            end_anchor,
            outcome_washout_days
          FROM ${schema}.${cTablePrefix}cohort_counts
          WHERE outcome_cohort_id IS NOT NULL
            AND outcome_cohort_id != 0
            ${detailTargetClause}
        `,
          detailParams,
        )
      : null,
  ]);

  if (tteRows) allRows.push(...tteRows);
  if (dcrcRows) allRows.push(...dcrcRows);
  if (rfRows) allRows.push(...rfRows);

  if (allRows.length === 0) return null;

  const colTypes = ["timeToEvent", "dechalRechal", "riskFactors"];
  const outcomes = pivotType(allRows, colTypes);

  for (const o of outcomes) {
    o["caseSeries"] = o["riskFactors"];
  }

  if (useRf && detailRows) {
    const groups = new Map<unknown, Record<string, unknown>[]>();
    for (const r of detailRows) {
      if (!groups.has(r["cohortDefinitionId"]))
        groups.set(r["cohortDefinitionId"], []);
      groups.get(r["cohortDefinitionId"])!.push(r);
    }

    const detailMap = new Map<unknown, Record<string, unknown>>();
    for (const [id, rows] of groups) {
      const tarNames = [
        ...new Set(
          rows.map(
            (r) =>
              `(${r["startAnchor"]} + ${r["riskWindowStart"]}) - (${r["endAnchor"]} + ${r["riskWindowEnd"]})`,
          ),
        ),
      ] as string[];
      const tarStrings = [
        ...new Set(
          rows.map(
            (r) =>
              `${r["riskWindowStart"]}/${r["startAnchor"]}/${r["riskWindowEnd"]}/${r["endAnchor"]}`,
          ),
        ),
      ] as string[];
      const washouts = [...new Set(rows.map((r) => r["outcomeWashoutDays"]))];
      detailMap.set(id, {
        tarNames: tarNames.join(":"),
        tarStrings: tarStrings.join(":"),
        outcomeWashoutDays: washouts.join(":"),
      });
    }

    for (const o of outcomes) {
      const detail = detailMap.get(o["cohortDefinitionId"]);
      if (detail) Object.assign(o, detail);
    }
  }

  return outcomes;
}

export async function getCmTargets({
  schema,
  cmTablePrefix = "cm_",
  cgTablePrefix = "cg_",
}: TablePrefixOptions): Promise<Record<string, unknown>[]> {
  const sql = `
    SELECT DISTINCT
      cd.cohort_name,
      cr.target_id AS cohort_definition_id,
      'cohortMethod' AS type,
      1 AS value
    FROM ${schema}.${cmTablePrefix}result cr
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cd
      ON cr.target_id = cd.cohort_definition_id
  `;

  const rows = await queryDb(sql);
  return pivotType(rows);
}

export async function getCmOutcomes({
  schema,
  cmTablePrefix = "cm_",
  cgTablePrefix = "cg_",
  targetId = null,
}: OutcomeTableOptions): Promise<Record<string, unknown>[]> {
  const params: NamedParams = {};
  const targetClause = addFilterParam(
    targetId !== null && targetId !== undefined
      ? (toArray(targetId) as (string | number)[])
      : null,
    (ic) => `AND cr.target_id IN (${ic})`,
    "targetId",
    params,
  );

  const sql = `
    SELECT DISTINCT
      cd.cohort_name,
      cr.outcome_id AS cohort_definition_id,
      'cohortMethod' AS type,
      1 AS value
    FROM ${schema}.${cmTablePrefix}result cr
    INNER JOIN ${schema}.${cmTablePrefix}target_comparator_outcome tco
      ON cr.target_id = tco.target_id
      AND cr.comparator_id = tco.comparator_id
      AND cr.outcome_id = tco.outcome_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cd
      ON cr.outcome_id = cd.cohort_definition_id
    WHERE tco.outcome_of_interest = 1
      ${targetClause}
  `;

  const rows = await queryDb(sql, params);
  return pivotType(rows);
}

export async function getOutcomeDataAvailability({
  schema,
  cTablePrefix = "c_",
  ciTablePrefix = "ci_",
  targetId,
  outcomeIds,
}: OutcomeAvailabilityOptions): Promise<OutcomeAvailabilityResult[]> {
  if (!targetId || !outcomeIds?.length) return [];

  const params: NamedParams = { targetId };
  const oidPlaceholders = outcomeIds.map((id, i) => {
    params[`oid${i}`] = id;
    return `@oid${i}`;
  });

  const sql = `
    WITH outcomes AS (
      SELECT unnest(ARRAY[${oidPlaceholders.join(",")}]::int[]) AS outcome_id
    )
    SELECT
      o.outcome_id,
      EXISTS (
        SELECT 1 FROM ${schema}.${cTablePrefix}dechallenge_rechallenge dr
        WHERE dr.target_cohort_definition_id = @targetId
          AND dr.outcome_cohort_definition_id = o.outcome_id
      ) AS has_dechal_data,
      EXISTS (
        SELECT 1 FROM ${schema}.${cTablePrefix}cohort_counts cc
        WHERE cc.target_cohort_id = @targetId
          AND cc.outcome_cohort_id = o.outcome_id
          AND cc.cohort_type = 'Cases'
      ) AS has_risk_factor_data,
      EXISTS (
        SELECT 1 FROM ${schema}.${cTablePrefix}cohort_details cd
        WHERE cd.target_cohort_id = @targetId
          AND cd.outcome_cohort_id = o.outcome_id
          AND cd.cohort_type IN ('CasesBefore', 'CasesBetween', 'CasesAfter')
      ) AS has_case_series_data,
      EXISTS (
        SELECT 1 FROM ${schema}.${cTablePrefix}time_to_event tte
        WHERE tte.target_cohort_definition_id = @targetId
          AND tte.outcome_cohort_definition_id = o.outcome_id
      ) AS has_time_to_event_data,
      EXISTS (
        SELECT 1 FROM ${schema}.${ciTablePrefix}incidence_summary cis
        INNER JOIN ${schema}.${ciTablePrefix}outcome_def od
          ON cis.ref_id = od.ref_id AND cis.outcome_id = od.outcome_id
        INNER JOIN ${schema}.${ciTablePrefix}target_def td
          ON od.ref_id = td.ref_id
        WHERE td.target_cohort_definition_id = @targetId
          AND od.outcome_cohort_definition_id = o.outcome_id
      ) AS has_incidence_data
    FROM outcomes o
  `;

  return queryDb(sql, params) as Promise<OutcomeAvailabilityResult[]>;
}
