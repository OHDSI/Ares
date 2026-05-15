import { queryDb } from "../../../../config/postgresDbConnection.js";

function addOptionalClause(condition, clause) {
  return condition ? clause : "";
}

function toArray(v) {
  return Array.isArray(v) ? v : [v];
}

function buildInClause(prefix, values, params) {
  const keys = values.map((_, i) => `@${prefix}${i}`);
  values.forEach((v, i) => {
    params[`${prefix}${i}`] = v;
  });
  return keys.join(",");
}

/**
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.cgTablePrefix='cg_']
 * @param {number[]} [options.targetIds]
 * @returns {Promise<object[]>}
 */
export async function getCohortDefinitions({
  schema,
  cgTablePrefix = "cg_",
  targetIds = null,
}) {
  let subsetTableExists = true;
  try {
    await queryDb(
      `SELECT * FROM ${schema}.${cgTablePrefix}cohort_subset_definition LIMIT 1`,
    );
  } catch {
    subsetTableExists = false;
  }

  const params = {};
  const targetClause = addOptionalClause(
    targetIds != null,
    `WHERE cd.cohort_definition_id IN (${buildInClause("targetId", toArray(targetIds ?? []), params)})`,
  );
  const targetClauseNoAlias = addOptionalClause(
    targetIds != null,
    `WHERE cohort_definition_id IN (${(targetIds ?? []).map((_, i) => `@targetId${i}`).join(",")})`,
  );

  let sql;
  if (subsetTableExists) {
    sql = `
      SELECT cd.*, cd.sql_command AS sql, csd.json AS subset_definition_json
      FROM ${schema}.${cgTablePrefix}cohort_definition cd
      LEFT JOIN ${schema}.${cgTablePrefix}cohort_subset_definition csd
        ON cd.subset_definition_id = csd.subset_definition_id
      ${targetClause}
    `;
  } else {
    sql = `
      SELECT *, sql_command AS sql, NULL AS subset_definition_json
      FROM ${schema}.${cgTablePrefix}cohort_definition
      ${targetClauseNoAlias}
    `;
  }

  return queryDb(sql, params);
}

/**
 * Extracts cohort IDs from a subset definition JSON string.
 * @param {string|null} json
 * @returns {string}
 */
export function extractSubsetCohorts(json) {
  if (json == null || json === "") return "";

  try {
    const parsed = typeof json === "string" ? JSON.parse(json) : json;
    const defs = Array.isArray(parsed) ? parsed : [parsed];

    const cohortIds = new Set();
    for (const def of defs) {
      const operators = def.subsetOperators ?? [];
      for (const op of operators) {
        if (op.subsetType === "CohortSubsetOperator") {
          for (const id of op.cohortIds ?? []) {
            cohortIds.add(id);
          }
        }
      }
    }

    return [...cohortIds].join("");
  } catch {
    return "";
  }
}
