import { queryDb } from '../../../config/postgresDbConnection.js';

/**
 * For a given target, checks which outcomes have actual result data
 * per analysis type. Returns one row per outcome with boolean flags.
 *
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.cTablePrefix='c_']
 * @param {string} [options.ciTablePrefix='ci_']
 * @param {number} options.targetId
 * @param {number[]} options.outcomeIds - list of outcome cohort IDs to check
 * @returns {Promise<object[]>}
 */
export async function getOutcomeDataAvailability({
                                                     schema,
                                                     cTablePrefix = 'c_',
                                                     ciTablePrefix = 'ci_',
                                                     targetId,
                                                     outcomeIds,
                                                 }) {
    if (!targetId || !outcomeIds?.length) return [];

    const params = { targetId };

    const oidPlaceholders = outcomeIds.map((id, i) => {
        params[`oid${i}`] = id;
        return `@oid${i}`;
    });

    const sql = `
    WITH outcomes AS (
      SELECT unnest(ARRAY[${oidPlaceholders.join(',')}]::int[]) AS outcome_id
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

    return queryDb(sql, params);
}