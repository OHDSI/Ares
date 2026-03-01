import { queryDb } from '../../../../config/postgresDbConnection.js';

function addOptionalClause(condition, clause) {
    return condition ? clause : '';
}

function toArray(v) {
    return Array.isArray(v) ? v : [v];
}

function buildInClause(prefix, values, params) {
    const keys = values.map((_, i) => `@${prefix}${i}`);
    values.forEach((v, i) => { params[`${prefix}${i}`] = v; });
    return keys.join(',');
}

function pivotType(rows) {
    const map = new Map();
    for (const r of rows) {
        const key = `${r.cohortDefinitionId}|${r.cohortName}`;
        if (!map.has(key)) map.set(key, { cohortName: r.cohortName, cohortDefinitionId: r.cohortDefinitionId });
        map.get(key)[r.type] = r.value;
    }
    return [...map.values()];
}

/**
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.cmTablePrefix='cm_']
 * @param {string} [options.cgTablePrefix='cg_']
 * @returns {Promise<object[]>}
 */
export async function getCmTargets({
                                       schema,
                                       cmTablePrefix = 'cm_',
                                       cgTablePrefix = 'cg_',
                                   }) {
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

/**
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.cmTablePrefix='cm_']
 * @param {string} [options.cgTablePrefix='cg_']
 * @param {number} [options.targetId]
 * @returns {Promise<object[]>}
 */
export async function getCmOutcomes({
                                        schema,
                                        cmTablePrefix = 'cm_',
                                        cgTablePrefix = 'cg_',
                                        targetId = null,
                                    }) {
    const params = {};

    const targetClause = addOptionalClause(targetId != null,
        `AND cr.target_id IN (${buildInClause('targetId', toArray(targetId ?? []), params)})`);

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