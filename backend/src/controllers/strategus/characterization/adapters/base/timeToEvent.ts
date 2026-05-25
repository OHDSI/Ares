import { queryDb } from "#config/db.js";
import {
  addOptionalClause,
  toArray,
  buildInClause,
} from "#shared/queryHelpers.js";
import type { TimeToEventOptions, TimeToEventResult } from "#types/index.js";

export async function getTimeToEvent({
  schema,
  cTablePrefix = "c_",
  cgTablePrefix = "cg_",
  databaseTable = "database_meta_data",
  targetIds = null,
  outcomeIds = null,
}: TimeToEventOptions): Promise<TimeToEventResult[]> {
  const params: Record<string, string | number | (string | number)[]> = {};

  const targetClause = addOptionalClause(
    targetIds !== null && targetIds !== undefined,
    `AND tte.TARGET_COHORT_DEFINITION_ID IN (${buildInClause("targetId", toArray(targetIds ?? []) as (string | number)[], params)})`,
  );
  const outcomeClause = addOptionalClause(
    outcomeIds !== null && outcomeIds !== undefined,
    `AND tte.OUTCOME_COHORT_DEFINITION_ID IN (${buildInClause("outcomeId", toArray(outcomeIds ?? []) as (string | number)[], params)})`,
  );

  const sql = `
    SELECT
      d.CDM_SOURCE_ABBREVIATION AS database_name,
      d.database_id,
      target_cohorts.cohort_name AS target_name,
      tte.target_cohort_definition_id AS target_id,
      outcome_cohorts.cohort_name AS outcome_name,
      tte.outcome_cohort_definition_id AS outcome_id,
      tte.outcome_type,
      tte.target_outcome_type,
      tte.time_to_event,
      tte.num_events,
      tte.time_scale
    FROM ${schema}.${cTablePrefix}time_to_event tte
    INNER JOIN ${schema}.${databaseTable} d
      ON tte.database_id = d.database_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition target_cohorts
      ON target_cohorts.cohort_definition_id = tte.target_cohort_definition_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition outcome_cohorts
      ON outcome_cohorts.cohort_definition_id = tte.outcome_cohort_definition_id
    WHERE 1 = 1
      ${targetClause}
      ${outcomeClause}
  `;

  return queryDb(sql, params) as unknown as Promise<TimeToEventResult[]>;
}
