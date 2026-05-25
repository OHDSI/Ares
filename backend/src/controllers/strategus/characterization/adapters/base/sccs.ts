import { queryDb } from "#config/db.js";
import {
  addOptionalClause,
  toArray,
  buildInClause,
  pivotType,
} from "#shared/queryHelpers.js";
import type { TablePrefixOptions, OutcomeTableOptions } from "#types/index.js";

export async function getSccsTargets({
  schema,
  sccsTablePrefix = "sccs_",
  cgTablePrefix = "cg_",
}: TablePrefixOptions): Promise<Record<string, unknown>[]> {
  const sql = `
    SELECT DISTINCT
      cd.cohort_name,
      sc.era_id AS cohort_definition_id,
      'selfControlledCaseSeries' AS type,
      1 AS value
    FROM ${schema}.${sccsTablePrefix}result sr
    INNER JOIN ${schema}.${sccsTablePrefix}covariate sc
      ON sc.exposures_outcome_set_id = sr.exposures_outcome_set_id
      AND sc.database_id = sr.database_id
      AND sc.analysis_id = sr.analysis_id
      AND sc.covariate_id = sr.covariate_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cd
      ON sc.era_id = cd.cohort_definition_id
  `;

  return pivotType(await queryDb(sql));
}

export async function getSccsOutcomes({
  schema,
  sccsTablePrefix = "sccs_",
  cgTablePrefix = "cg_",
  targetId = null,
}: OutcomeTableOptions): Promise<Record<string, unknown>[]> {
  const params: Record<string, string | number | (string | number)[]> = {};

  const targetClause = addOptionalClause(
    targetId !== null && targetId !== undefined,
    `AND sc.era_id IN (${buildInClause("targetId", toArray(targetId ?? []) as (string | number)[], params)})`,
  );

  const sql = `
    SELECT DISTINCT
      cd.cohort_name,
      eos.outcome_id AS cohort_definition_id,
      'selfControlledCaseSeries' AS type,
      1 AS value
    FROM ${schema}.${sccsTablePrefix}result sr
    INNER JOIN ${schema}.${sccsTablePrefix}exposures_outcome_set eos
      ON eos.exposures_outcome_set_id = sr.exposures_outcome_set_id
    INNER JOIN ${schema}.${sccsTablePrefix}covariate sc
      ON sc.exposures_outcome_set_id = sr.exposures_outcome_set_id
      AND sc.database_id = sr.database_id
      AND sc.analysis_id = sr.analysis_id
      AND sc.covariate_id = sr.covariate_id
    INNER JOIN ${schema}.${sccsTablePrefix}exposure e
      ON e.exposures_outcome_set_id = sc.exposures_outcome_set_id
      AND e.era_id = sc.era_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cd
      ON eos.outcome_id = cd.cohort_definition_id
    WHERE e.true_effect_size IS NULL
      ${targetClause}
  `;

  return pivotType(await queryDb(sql, params));
}
