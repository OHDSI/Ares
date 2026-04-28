import { queryDb } from '../../../config/postgresDbConnection.js';
import { parseCovariateNameString } from './helpers/parseCovariateNameString.js';

function addOptionalClause(condition, clause) {
    return condition ? clause : '';
}

/**
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.cTablePrefix='c_']
 * @param {string} [options.cgTablePrefix='cg_']
 * @param {string} [options.databaseTable='database_meta_data']
 * @param {number[]} [options.targetIds]
 * @param {string[]} [options.databaseIds]
 * @returns {Promise<object[]>} rows with databaseId, databaseName, cohortId, cohortName, minPriorObservation, n
 */
export async function getCharacterizationCohortCounts({
                                                          schema,
                                                          cTablePrefix = 'c_',
                                                          cgTablePrefix = 'cg_',
                                                          databaseTable = 'database_meta_data',
                                                          targetIds = null,
                                                          databaseIds = null,
                                                      }) {
    const params = {};

    const targetClause = addOptionalClause(
        targetIds != null,
        `AND cc.target_cohort_id IN (${(targetIds ?? []).map((_, i) => `@targetId${i}`).join(',')})`,
    );
    if (targetIds) targetIds.forEach((id, i) => { params[`targetId${i}`] = id; });

    const dbClause = addOptionalClause(
        databaseIds != null,
        `AND cc.database_id IN (${(databaseIds ?? []).map((_, i) => `@databaseId${i}`).join(',')})`,
    );
    if (databaseIds) databaseIds.forEach((id, i) => { params[`databaseId${i}`] = id; });

    const sql = `
    SELECT
      cc.database_id,
      d.CDM_SOURCE_ABBREVIATION AS database_name,
      cc.target_cohort_id AS cohort_id,
      cg.cohort_name,
      cc.min_prior_observation,
      max(cc.person_count) AS n
    FROM ${schema}.${cTablePrefix}cohort_counts cc
    INNER JOIN ${schema}.${databaseTable} d
      ON cc.database_id = d.database_id
    INNER JOIN ${schema}.${cgTablePrefix}cohort_definition cg
      ON cg.cohort_definition_id = cc.target_cohort_id
    WHERE cc.cohort_type = 'Target'
      ${targetClause}
      ${dbClause}
    GROUP BY
      cc.database_id, d.CDM_SOURCE_ABBREVIATION,
      cc.target_cohort_id, cg.cohort_name, cc.min_prior_observation
  `;

    return queryDb(sql, params);
}

export async function getCharacterizationCohortBinary({
                                                          schema,
                                                          cTablePrefix = 'c_',
                                                          cgTablePrefix = 'cg_',
                                                          databaseTable = 'database_meta_data',
                                                          targetIds = null,
                                                          databaseIds = null,
                                                          minThreshold = 0,
                                                      }) {
    let counts = await getCharacterizationCohortCounts({
        schema,
        cTablePrefix,
        cgTablePrefix,
        databaseTable,
        targetIds,
        databaseIds,
    });

    if (targetIds != null) {
        const unique = [...new Set(targetIds)];
        const orderMap = Object.fromEntries(unique.map((id, i) => [id, i]));
        counts = counts
            .filter((r) => r.cohortId in orderMap)
            .sort((a, b) => orderMap[a.cohortId] - orderMap[b.cohortId]);
    }

    const colRef = counts.map((r, i) => ({ ...r, id: i + 1 }));
    if (colRef.length === 0) return { covariates: [], covRef: [] };

    const params = { minThreshold };

    const targetClause = addOptionalClause(
        targetIds != null,
        `AND cov.target_cohort_id IN (${(targetIds ?? []).map((_, i) => `@targetId${i}`).join(',')})`,
    );
    if (targetIds) targetIds.forEach((id, i) => { params[`targetId${i}`] = id; });

    const dbClause = addOptionalClause(
        databaseIds != null,
        `AND cov.database_id IN (${(databaseIds ?? []).map((_, i) => `@databaseId${i}`).join(',')})`,
    );
    if (databaseIds) databaseIds.forEach((id, i) => { params[`databaseId${i}`] = id; });

    const sql = `
    SELECT
      ref.covariate_name,
      ref.covariate_id,
      s.min_prior_observation,
      cov.target_cohort_id AS cohort_id,
      cov.database_id,
      cov.sum_value,
      cov.average_value
    FROM ${schema}.${cTablePrefix}covariates cov
    INNER JOIN ${schema}.${cTablePrefix}covariate_ref ref
      ON cov.covariate_id = ref.covariate_id
      AND cov.setting_id = ref.setting_id
      AND cov.database_id = ref.database_id
    INNER JOIN ${schema}.${cTablePrefix}settings s
      ON s.database_id = cov.database_id
      AND s.setting_id = cov.setting_id
    WHERE cov.cohort_type = 'Target'
      ${targetClause}
      ${dbClause}
      AND abs(cov.average_value) >= @minThreshold
  `;

    const rows = await queryDb(sql, params);

    const colRefKey = (r) => `${r.cohortId}|${r.databaseId}|${r.minPriorObservation}`;
    const colRefMap = new Map(colRef.map((r) => [colRefKey(r), r]));

    const merged = rows
        .map((r) => {
            const ref = colRefMap.get(colRefKey(r));
            return ref ? { ...r, id: ref.id, n: ref.n } : null;
        })
        .filter(Boolean);

    const pivotKey = (r) => `${r.covariateId}|${r.covariateName}`;
    const pivotMap = new Map();

    for (const r of merged) {
        const key = pivotKey(r);
        if (!pivotMap.has(key)) {
            pivotMap.set(key, { covariateName: r.covariateName, covariateNameParsed: parseCovariateNameString(r.covariateName), covariateId: r.covariateId });
        }
        const row = pivotMap.get(key);
        row[`sumValue_${r.id}`] = r.sumValue;
        row[`averageValue_${r.id}`] = r.averageValue;
        row[`n_${r.id}`] = r.n;
    }

    let res = [...pivotMap.values()];

    for (const row of res) {
        for (const ref of colRef) {
            if (row[`averageValue_${ref.id}`] == null) row[`averageValue_${ref.id}`] = -1 * minThreshold;
            if (row[`sumValue_${ref.id}`] == null) row[`sumValue_${ref.id}`] = -1 * Math.floor(minThreshold * ref.n);
            if (row[`n_${ref.id}`] == null) row[`n_${ref.id}`] = ref.n;
        }
    }

    const sumCols = Object.keys(res[0] ?? {}).filter((k) => k.startsWith('sumValue_'));
    if (colRef.length === 2 && sumCols.length === 2) {
        for (const row of res) {
            const sd1 = ((Math.abs(row.averageValue_1) - 1) ** 2 * Math.abs(row.sumValue_1)
                + (Math.abs(row.averageValue_1) - 0) ** 2 * (row.n_1 - Math.abs(row.sumValue_1))) / row.n_1;
            const sd2 = ((Math.abs(row.averageValue_2) - 1) ** 2 * Math.abs(row.sumValue_2)
                + (Math.abs(row.averageValue_2) - 0) ** 2 * (row.n_2 - Math.abs(row.sumValue_2))) / row.n_2;
            const denom = Math.sqrt((sd1 ** 2 + sd2 ** 2) / 2);
            row.SMD = denom === 0 ? 0 : (row.averageValue_1 - row.averageValue_2) / denom;
            row.absSMD = Math.abs(row.SMD);
        }
    }

    for (const row of res) {
        for (const key of Object.keys(row)) {
            if (key.startsWith('n_')) delete row[key];
        }
    }

    return { covariates: res, covRef: colRef };
}

export async function getCharacterizationCohortContinuous({
                                                              schema,
                                                              cTablePrefix = 'c_',
                                                              cgTablePrefix = 'cg_',
                                                              databaseTable = 'database_meta_data',
                                                              targetIds = null,
                                                              databaseIds = null,
                                                              minThreshold = 0,
                                                          }) {
    let counts = await getCharacterizationCohortCounts({
        schema,
        cTablePrefix,
        cgTablePrefix,
        databaseTable,
        targetIds,
        databaseIds,
    });

    if (targetIds != null) {
        const unique = [...new Set(targetIds)];
        const orderMap = Object.fromEntries(unique.map((id, i) => [id, i]));
        counts = counts
            .filter((r) => r.cohortId in orderMap)
            .sort((a, b) => orderMap[a.cohortId] - orderMap[b.cohortId]);
    }

    const colRef = counts.map((r, i) => ({ ...r, id: i + 1, minCount: r.n * minThreshold }));
    if (colRef.length === 0) return { covariates: [], covRef: [] };

    const params = {};

    const targetClause = addOptionalClause(
        targetIds != null,
        `AND cov.target_cohort_id IN (${(targetIds ?? []).map((_, i) => `@targetId${i}`).join(',')})`,
    );
    if (targetIds) targetIds.forEach((id, i) => { params[`targetId${i}`] = id; });

    const dbClause = addOptionalClause(
        databaseIds != null,
        `AND cov.database_id IN (${(databaseIds ?? []).map((_, i) => `@databaseId${i}`).join(',')})`,
    );
    if (databaseIds) databaseIds.forEach((id, i) => { params[`databaseId${i}`] = id; });

    const sql = `
    SELECT
      cov.target_cohort_id AS cohort_id,
      d.CDM_SOURCE_ABBREVIATION AS database_name,
      ref.covariate_name,
      s.min_prior_observation,
      cov.covariate_id,
      cov.database_id,
      cov.setting_id,
      cov.count_value,
      cov.average_value,
      cov.standard_deviation,
      cov.median_value,
      cov.min_value,
      cov.max_value,
      cov.p_10_value,
      cov.p_25_value,
      cov.p_75_value,
      cov.p_90_value
    FROM ${schema}.${cTablePrefix}covariates_continuous cov
    INNER JOIN ${schema}.${cTablePrefix}covariate_ref ref
      ON cov.covariate_id = ref.covariate_id
      AND cov.setting_id = ref.setting_id
      AND cov.database_id = ref.database_id
    INNER JOIN ${schema}.${cTablePrefix}settings s
      ON cov.setting_id = s.setting_id
      AND cov.database_id = s.database_id
    INNER JOIN ${schema}.${databaseTable} d
      ON s.database_id = d.database_id
    WHERE cov.cohort_type = 'Target'
      ${targetClause}
      ${dbClause}
  `;

    const rows = await queryDb(sql, params);

    const colRefKey = (r) => `${r.cohortId}|${r.databaseId}|${r.minPriorObservation}`;
    const colRefMap = new Map(colRef.map((r) => [colRefKey(r), r]));

    const merged = rows
        .map((r) => {
            const ref = colRefMap.get(colRefKey(r));
            return ref ? { ...r, id: ref.id, minCount: ref.minCount } : null;
        })
        .filter(Boolean)
        .filter((r) => r.countValue >= r.minCount);

    const valueFields = [
        'countValue', 'averageValue', 'standardDeviation', 'medianValue',
        'minValue', 'maxValue', 'p10Value', 'p25Value', 'p75Value', 'p90Value',
    ];
    const pivotKey = (r) => `${r.covariateId}|${r.covariateName}|${r.minPriorObservation}`;
    const pivotMap = new Map();

    for (const r of merged) {
        const key = pivotKey(r);
        if (!pivotMap.has(key)) {
            pivotMap.set(key, {
                covariateName: r.covariateName,
                covariateNameParsed: parseCovariateNameString(r.covariateName),
                covariateId: r.covariateId,
                minPriorObservation: r.minPriorObservation,
            });
        }
        const row = pivotMap.get(key);
        for (const field of valueFields) {
            row[`${field}_${r.id}`] = r[field] ?? 0;
        }
    }

    let res = [...pivotMap.values()];

    for (const row of res) {
        for (const ref of colRef) {
            for (const field of valueFields) {
                if (row[`${field}_${ref.id}`] == null) row[`${field}_${ref.id}`] = 0;
            }
        }
    }

    const countCols = Object.keys(res[0] ?? {}).filter((k) => k.startsWith('countValue_'));
    if (colRef.length === 2 && countCols.length === 2) {
        for (const row of res) {
            const denom = Math.sqrt((Math.abs(row.standardDeviation_1) ** 2 + Math.abs(row.standardDeviation_2) ** 2) / 2);
            row.SMD = denom === 0 ? 0 : (Math.abs(row.averageValue_1) - Math.abs(row.averageValue_2)) / denom;
            row.absSMD = Math.abs(row.SMD);
        }
    }

    return { covariates: res, covRef: colRef };
}