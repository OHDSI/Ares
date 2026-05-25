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

type Row = Record<string, unknown>;

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
}): Promise<Row[] | null> {
  const allRows: Row[] = [];

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
      SELECT DISTINCT
        cg.cohort_name,
        ts.target_id AS cohort_definition_id,
        'riskFactors' AS type,
        1 AS value
      FROM ${schema}.${cTablePrefix}case_settings cs
      INNER JOIN ${schema}.${cTablePrefix}target_settings ts
        ON cs.characterization_target_id = ts.characterization_target_id
        AND cs.database_id = ts.database_id
        AND cs.setting_id = ts.setting_id
      INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
        ON ts.target_id = cg.cohort_definition_id
    `);
    if (rfRows1) allRows.push(...rfRows1);

    const rfRows2 = await safeQuery(`
      SELECT DISTINCT
        cg.cohort_name,
        ts.target_id AS cohort_definition_id,
        'databaseComparator' AS type,
        1 AS value
      FROM ${schema}.${cTablePrefix}target_settings ts
      INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
        ON ts.target_id = cg.cohort_definition_id
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
}): Promise<Row[] | null> {
  const allRows: Row[] = [];

  const params: NamedParams = {};
  const targetArr =
    targetId !== null && targetId !== undefined
      ? (toArray(targetId) as (string | number)[])
      : null;
  const targetKeys = targetArr?.map((_, i) => `@targetId${i}`).join(",");
  if (targetArr?.length)
    targetArr.forEach((v, i) => {
      params[`targetId${i}`] = v;
    });

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

  const caseTargetJoin = targetArr?.length
    ? `INNER JOIN ${schema}.${cTablePrefix}target_settings ts
       ON cs.characterization_target_id = ts.characterization_target_id
       AND cs.database_id = ts.database_id
       AND cs.setting_id = ts.setting_id
     WHERE ts.target_id IN (${targetKeys})`
    : "";

  const detailTargetJoin = targetArr?.length
    ? `INNER JOIN ${schema}.${cTablePrefix}target_settings ts2
       ON cs2.characterization_target_id = ts2.characterization_target_id
       AND cs2.database_id = ts2.database_id
       AND cs2.setting_id = ts2.setting_id
     WHERE ts2.target_id IN (${targetKeys})`
    : "";

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
          SELECT DISTINCT
            cg.cohort_name,
            cs.outcome_id AS cohort_definition_id,
            'riskFactors' AS type,
            1 AS value
          FROM ${schema}.${cTablePrefix}case_settings cs
          INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
            ON cs.outcome_id = cg.cohort_definition_id
          ${caseTargetJoin}
        `,
          params,
        )
      : null,
    useRf
      ? safeQuery(
          `
          SELECT DISTINCT
            cs2.outcome_id AS cohort_definition_id,
            cs2.risk_window_start,
            cs2.risk_window_end,
            cs2.start_anchor,
            cs2.end_anchor,
            cs2.outcome_washout_days
          FROM ${schema}.${cTablePrefix}case_settings cs2
          ${detailTargetJoin}
        `,
          params,
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
    const groups = new Map<number, Row[]>();
    for (const r of detailRows) {
      const id = r["cohortDefinitionId"] as number;
      if (!groups.has(id)) groups.set(id, []);
      (groups.get(id) as Row[]).push(r);
    }

    const detailMap = new Map<
      number,
      { tarNames: string; tarStrings: string; outcomeWashoutDays: string }
    >();
    for (const [id, rows] of groups) {
      const tarNames = [
        ...new Set(
          rows.map(
            (r) =>
              `(${r["startAnchor"]} + ${r["riskWindowStart"]}) - (${r["endAnchor"]} + ${r["riskWindowEnd"]})`,
          ),
        ),
      ];
      const tarStrings = [
        ...new Set(
          rows.map(
            (r) =>
              `${r["riskWindowStart"]}/${r["startAnchor"]}/${r["riskWindowEnd"]}/${r["endAnchor"]}`,
          ),
        ),
      ];
      const washouts = [...new Set(rows.map((r) => r["outcomeWashoutDays"]))];
      detailMap.set(id, {
        tarNames: tarNames.join(":"),
        tarStrings: tarStrings.join(":"),
        outcomeWashoutDays: washouts.join(":"),
      });
    }

    for (const o of outcomes) {
      const detail = detailMap.get(o["cohortDefinitionId"] as number);
      if (detail) Object.assign(o, detail);
    }
  }

  return outcomes;
}

export async function getCmTargets({
  schema,
  cmTablePrefix = "cm_",
  cgTablePrefix = "cg_",
}: TablePrefixOptions): Promise<Row[]> {
  const sql = `
    SELECT DISTINCT
      cd.cohort_name,
      tc.target_id AS cohort_definition_id,
      'cohortMethod' AS type,
      1 AS value
    FROM ${schema}.${cmTablePrefix}result cr
    INNER JOIN ${schema}.${cmTablePrefix}target_comparator tc
      ON cr.target_comparator_id = tc.target_comparator_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cd
      ON tc.target_id = cd.cohort_definition_id
  `;

  const rows = await queryDb(sql);
  return pivotType(rows);
}

export async function getCmOutcomes({
  schema,
  cmTablePrefix = "cm_",
  cgTablePrefix = "cg_",
  targetId = null,
}: OutcomeTableOptions): Promise<Row[]> {
  const params: NamedParams = {};
  const targetClause = addFilterParam(
    targetId !== null && targetId !== undefined
      ? (toArray(targetId) as (string | number)[])
      : null,
    (ic) => `AND tc.target_id IN (${ic})`,
    "targetId",
    params,
  );

  const sql = `
    SELECT DISTINCT
      cd.cohort_name,
      tco.outcome_id AS cohort_definition_id,
      'cohortMethod' AS type,
      1 AS value
    FROM ${schema}.${cmTablePrefix}result cr
    INNER JOIN ${schema}.${cmTablePrefix}target_comparator tc
      ON cr.target_comparator_id = tc.target_comparator_id
    INNER JOIN ${schema}.${cmTablePrefix}target_comparator_outcome tco
      ON tc.target_comparator_id = tco.target_comparator_id
      AND cr.outcome_id = tco.outcome_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cd
      ON tco.outcome_id = cd.cohort_definition_id
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
        SELECT 1 FROM ${schema}.${cTablePrefix}risk_factor_covariates rfc
        INNER JOIN ${schema}.${cTablePrefix}case_settings cs
          ON rfc.characterization_case_id = cs.characterization_case_id
          AND rfc.database_id = cs.database_id
          AND rfc.setting_id = cs.setting_id
        INNER JOIN ${schema}.${cTablePrefix}target_settings ts
          ON cs.characterization_target_id = ts.characterization_target_id
          AND cs.database_id = ts.database_id
          AND cs.setting_id = ts.setting_id
        WHERE ts.target_id = @targetId
          AND cs.outcome_id = o.outcome_id
        LIMIT 1
      ) AS has_risk_factor_data,
      EXISTS (
        SELECT 1 FROM ${schema}.${cTablePrefix}case_series_covariates csc
        INNER JOIN ${schema}.${cTablePrefix}case_settings cs
          ON csc.characterization_case_id = cs.characterization_case_id
          AND csc.database_id = cs.database_id
          AND csc.setting_id = cs.setting_id
        INNER JOIN ${schema}.${cTablePrefix}target_settings ts
          ON cs.characterization_target_id = ts.characterization_target_id
          AND cs.database_id = ts.database_id
          AND cs.setting_id = ts.setting_id
        WHERE ts.target_id = @targetId
          AND cs.outcome_id = o.outcome_id
        LIMIT 1
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
