import { queryDb } from "#config/db.js";
import {
  addOptionalClause,
  toArray,
  buildInClause,
  pivotType,
} from "#shared/queryHelpers.js";
import type { TablePrefixOptions, OutcomeTableOptions } from "#types/index.js";

export async function getPredictionTargets({
  schema,
  plpTablePrefix = "plp_",
  cgTablePrefix = "cg_",
}: TablePrefixOptions): Promise<Record<string, unknown>[]> {
  const sql = `
    SELECT DISTINCT
      cohorts.cohort_name,
      cohorts.cohort_definition_id,
      'prediction' AS type,
      1 AS value
    FROM ${schema}.${plpTablePrefix}model_designs model_designs
    INNER JOIN (
      SELECT c.cohort_id, c.cohort_definition_id, cd.cohort_name
      FROM ${schema}.${plpTablePrefix}cohorts c
      INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cd
        ON c.cohort_definition_id = cd.cohort_definition_id
        AND c.cohort_name = cd.cohort_name
    ) cohorts
      ON model_designs.target_id = cohorts.cohort_id
  `;

  return pivotType(await queryDb(sql));
}

export async function getPredictionOutcomes({
  schema,
  plpTablePrefix = "plp_",
  cgTablePrefix = "cg_",
  targetId = null,
}: OutcomeTableOptions): Promise<Record<string, unknown>[]> {
  const params: Record<string, string | number | (string | number)[]> = {};

  const targetJoin = addOptionalClause(
    targetId !== null && targetId !== undefined,
    `
    INNER JOIN (
      SELECT DISTINCT cohort_id
      FROM ${schema}.${plpTablePrefix}cohorts
      WHERE cohort_definition_id IN (${buildInClause("targetId", toArray(targetId ?? []) as (string | number)[], params)})
    ) targets
      ON model_designs.target_id = targets.cohort_id
  `,
  );

  const sql = `
    SELECT DISTINCT
      cohorts.cohort_name,
      cohorts.cohort_definition_id,
      'prediction' AS type,
      1 AS value
    FROM ${schema}.${plpTablePrefix}model_designs model_designs
    INNER JOIN (
      SELECT c.cohort_id, c.cohort_definition_id, cd.cohort_name
      FROM ${schema}.${plpTablePrefix}cohorts c
      INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cd
        ON c.cohort_definition_id = cd.cohort_definition_id
        AND c.cohort_name = cd.cohort_name
    ) cohorts
      ON model_designs.outcome_id = cohorts.cohort_id
    ${targetJoin}
  `;

  return pivotType(await queryDb(sql, params));
}
