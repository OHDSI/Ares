import { queryDb } from "#config/db.js";
import {
  addOptionalClause,
  toArray,
  buildInClause,
  pivotType,
} from "#shared/queryHelpers.js";
import type {
  IncidenceOptions,
  IncidenceTargetOptions,
  IncidenceOutcomeOptions,
  IncidenceRateResult,
} from "#types/index.js";
import type { NamedParams } from "#types/index.js";

export async function getIncidenceRates({
  schema,
  ciTablePrefix = "ci_",
  cgTablePrefix = "cg_",
  databaseTable = "database_meta_data",
  targetIds = null,
  outcomeIds = null,
}: IncidenceOptions): Promise<IncidenceRateResult[]> {
  const params: NamedParams = {};

  const targetClause = addOptionalClause(
    targetIds !== null && targetIds !== undefined,
    `AND target_cohort_definition_id IN (${(targetIds ?? []).map((_, i) => `@targetId${i}`).join(",")})`,
  );
  if (targetIds)
    targetIds.forEach((id, i) => {
      params[`targetId${i}`] = id;
    });

  const outcomeClause = addOptionalClause(
    outcomeIds !== null && outcomeIds !== undefined,
    `AND outcome_cohort_definition_id IN (${(outcomeIds ?? []).map((_, i) => `@outcomeId${i}`).join(",")})`,
  );
  if (outcomeIds)
    outcomeIds.forEach((id, i) => {
      params[`outcomeId${i}`] = id;
    });

  const sql = `
    SELECT
      d.cdm_source_abbreviation AS database_name,
      d.database_id,
      cg1.cohort_name AS target_name,
      i.target_cohort_definition_id AS target_id,
      cg2.cohort_name AS outcome_name,
      i.outcome_cohort_definition_id AS outcome_id,
      i.clean_window,
      i.subgroup_name,
      i.age_group_name,
      i.gender_name,
      i.start_year,
      i.tar_start_with,
      i.tar_start_offset,
      i.tar_end_with,
      i.tar_end_offset,
      i.persons_at_risk_pe,
      i.persons_at_risk,
      i.person_days_pe,
      i.person_days,
      i.person_outcomes_pe,
      i.person_outcomes,
      i.outcomes_pe,
      i.outcomes,
      i.incidence_proportion_p100p,
      i.incidence_rate_p100py
    FROM (
      SELECT
        od.outcome_cohort_definition_id,
        od.clean_window,
        agd.age_group_name,
        tad.tar_start_with,
        tad.tar_start_offset,
        tad.tar_end_with,
        tad.tar_end_offset,
        sd.subgroup_name,
        i.*
      FROM ${schema}.${ciTablePrefix}incidence_summary i
      JOIN ${schema}.${ciTablePrefix}outcome_def od
        ON i.outcome_id = od.outcome_id
        AND i.ref_id = od.ref_id
      JOIN ${schema}.${ciTablePrefix}tar_def tad
        ON i.tar_id = tad.tar_id
        AND i.ref_id = tad.ref_id
      JOIN ${schema}.${ciTablePrefix}subgroup_def sd
        ON i.subgroup_id = sd.subgroup_id
        AND i.ref_id = sd.ref_id
      LEFT JOIN ${schema}.${ciTablePrefix}age_group_def agd
        ON i.age_group_id = agd.age_group_id
        AND i.ref_id = agd.ref_id
    ) i
    INNER JOIN ${schema}.${databaseTable} d
      ON d.database_id = i.database_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg1
      ON cg1.cohort_definition_id = i.target_cohort_definition_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg2
      ON cg2.cohort_definition_id = i.outcome_cohort_definition_id
    WHERE 1 = 1
      ${targetClause}
      ${outcomeClause}
  `;

  const rows = (await queryDb(sql, params)) as unknown as IncidenceRateResult[];

  if (rows.length > 0) {
    for (const r of rows) {
      if (
        r.incidenceProportionP100p === null ||
        r.incidenceProportionP100p === undefined
      ) {
        r.incidenceProportionP100p = r.personsAtRisk
          ? (r.outcomes / (r.personsAtRisk as number)) * 100
          : 0;
      }
      if (
        r.incidenceRateP100py === null ||
        r.incidenceRateP100py === undefined
      ) {
        r.incidenceRateP100py = r.personDays
          ? (r.outcomes / ((r.personDays as number) / 365)) * 100
          : 0;
      }
      for (const key of Object.keys(r) as (keyof IncidenceRateResult)[]) {
        if (r[key] === null || r[key] === undefined)
          (r as unknown as Record<string, unknown>)[key as string] = "Any";
      }
      (r as unknown as Record<string, unknown>)["tar"] =
        `( ${r.tarStartWith} + ${r.tarStartOffset} ) - ( ${r.tarEndWith} + ${r.tarEndOffset} )`;
    }

    const seen = new Set<string>();
    return rows.filter((r) => {
      const key = JSON.stringify(r);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return rows;
}

export async function getIncidenceTargets({
  schema,
  ciTablePrefix = "ci_",
  cgTablePrefix = "cg_",
}: IncidenceTargetOptions): Promise<Record<string, unknown>[]> {
  const sql = `
    SELECT DISTINCT
      cg.cohort_name,
      ci.target_cohort_definition_id AS cohort_definition_id,
      'cohortIncidence' AS type,
      1 AS value
    FROM ${schema}.${ciTablePrefix}target_def ci
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
      ON ci.target_cohort_definition_id = cg.cohort_definition_id
  `;

  return pivotType(await queryDb(sql));
}

export async function getIncidenceOutcomes({
  schema,
  ciTablePrefix = "ci_",
  cgTablePrefix = "cg_",
  targetId = null,
}: IncidenceOutcomeOptions): Promise<Record<string, unknown>[]> {
  const params: NamedParams = {};

  const targetJoin = addOptionalClause(
    targetId !== null && targetId !== undefined,
    `
    INNER JOIN (
      SELECT DISTINCT outcome_id
      FROM ${schema}.${ciTablePrefix}incidence_summary
      WHERE target_cohort_definition_id IN (${buildInClause("targetId", toArray(targetId ?? []) as (string | number)[], params)})
    ) temp ON temp.outcome_id = ci.outcome_id
  `,
  );

  const sql = `
    SELECT DISTINCT
      cg.cohort_name,
      ci.outcome_cohort_definition_id AS cohort_definition_id,
      'cohortIncidence' AS type,
      1 AS value
    FROM ${schema}.${ciTablePrefix}outcome_def ci
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
      ON ci.outcome_cohort_definition_id = cg.cohort_definition_id
    ${targetJoin}
  `;

  return pivotType(await queryDb(sql, params));
}
