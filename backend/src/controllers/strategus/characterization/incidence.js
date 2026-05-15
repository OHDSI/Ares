import { queryDb } from "../../../config/postgresDbConnection.js";

function addOptionalClause(condition, clause) {
  return condition ? clause : "";
}

/**
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.ciTablePrefix='ci_']
 * @param {string} [options.cgTablePrefix='cg_']
 * @param {string} [options.databaseTable='database_meta_data']
 * @param {number[]} [options.targetIds]
 * @param {number[]} [options.outcomeIds]
 * @returns {Promise<object[]>}
 */
export async function getIncidenceRates({
  schema,
  ciTablePrefix = "ci_",
  cgTablePrefix = "cg_",
  databaseTable = "database_meta_data",
  targetIds = null,
  outcomeIds = null,
}) {
  const params = {};

  const targetClause = addOptionalClause(
    targetIds != null,
    `AND target_cohort_definition_id IN (${(targetIds ?? []).map((_, i) => `@targetId${i}`).join(",")})`,
  );
  if (targetIds)
    targetIds.forEach((id, i) => {
      params[`targetId${i}`] = id;
    });

  const outcomeClause = addOptionalClause(
    outcomeIds != null,
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

  const rows = await queryDb(sql, params);

  if (rows.length > 0) {
    for (const r of rows) {
      if (r.incidenceProportionP100p == null) {
        r.incidenceProportionP100p = r.personsAtRisk
          ? (r.outcomes / r.personsAtRisk) * 100
          : 0;
      }
      if (r.incidenceRateP100py == null) {
        r.incidenceRateP100py = r.personDays
          ? (r.outcomes / (r.personDays / 365)) * 100
          : 0;
      }
      for (const key of Object.keys(r)) {
        if (r[key] == null) r[key] = "Any";
      }
      r.tar = `( ${r.tarStartWith} + ${r.tarStartOffset} ) - ( ${r.tarEndWith} + ${r.tarEndOffset} )`;
    }

    const seen = new Set();
    const unique = rows.filter((r) => {
      const key = JSON.stringify(r);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return unique;
  }

  return rows;
}
