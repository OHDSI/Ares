import { queryDb } from '../../../config/postgresDbConnection.js';
import { getCohortDefinitions, extractSubsetCohorts } from './helpers/cohortDefinitions.js';
import { getIncidenceTargets, getIncidenceOutcomes } from './helpers/incidenceTargets.js';
import { getCharacterizationTargets, getCharacterizationOutcomes } from './helpers/characterizationTargets.js';
import { getPredictionTargets, getPredictionOutcomes } from './helpers/predictionTargets.js';
import { getCmTargets, getCmOutcomes } from './helpers/cmTargets.js';
import { getSccsTargets, getSccsOutcomes } from './helpers/sccsTargets.js';

const ANALYSIS_COLUMNS = [
    'timeToEvent', 'dechalRechal', 'riskFactors', 'databaseComparator',
    'cohortComparator', 'caseSeries', 'cohortMethod',
    'selfControlledCaseSeries', 'prediction', 'cohortIncidence',
];

const OUTCOME_ANALYSIS_COLUMNS = [
    'timeToEvent', 'dechalRechal', 'riskFactors', 'caseSeries',
    'cohortMethod', 'selfControlledCaseSeries', 'prediction', 'cohortIncidence',
];

function leftMerge(left, right, leftKeys, rightKeys) {
    const index = new Map();
    for (const r of right) {
        const key = rightKeys.map((k) => r[k]).join('|');
        index.set(key, r);
    }
    return left.map((l) => {
        const key = leftKeys.map((k) => l[k]).join('|');
        const match = index.get(key);
        return match ? { ...l, ...match } : { ...l };
    });
}

function fillNulls(rows) {
    for (const row of rows) {
        for (const key of Object.keys(row)) {
            if (row[key] == null) row[key] = 0;
        }
    }
}

function ensureColumns(rows, columns) {
    for (const row of rows) {
        for (const col of columns) {
            if (row[col] == null) row[col] = 0;
        }
    }
}

function summarizeCounts(rawCounts) {
    const groups = new Map();
    for (const r of rawCounts) {
        if (!groups.has(r.cohortId)) groups.set(r.cohortId, []);
        groups.get(r.cohortId).push(r);
    }

    const result = [];
    for (const [cohortId, rows] of groups) {
        const dbNames = [...new Set(rows.map((r) => r.databaseName))];
        const dbIds = [...new Set(rows.map((r) => r.databaseId))];
        const subjects = rows.map((r) => r.cohortSubjects);
        const entries = rows.map((r) => r.cohortEntries);

        result.push({
            cohortId,
            numDatabase: dbNames.length,
            databaseString: dbNames.join(', '),
            databaseIdString: dbIds.join(', '),
            databaseStringCount: [...new Set(rows.map((r) => `${r.databaseName} (${r.cohortSubjects})`))].join(', '),
            minSubjectCount: Math.min(...subjects),
            maxSubjectCount: Math.max(...subjects),
            minEntryCount: Math.min(...entries),
            maxEntryCount: Math.max(...entries),
        });
    }
    return result;
}

async function fetchCohortCountsRaw(schema, cgTablePrefix, databaseTable) {
    const sql = `
    SELECT
      dt.cdm_source_abbreviation AS database_name,
      cc.*
    FROM ${schema}.${cgTablePrefix}cohort_count cc
    INNER JOIN ${schema}.${databaseTable} dt
      ON cc.database_id = dt.database_id
  `;
    return queryDb(sql);
}

async function safeCall(fn) {
    try {
        return await fn();
    } catch (e) {
        console.warn(e.message);
        return null;
    }
}

/**
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.cgTablePrefix='cg_']
 * @param {string} [options.cTablePrefix='c_']
 * @param {string} [options.ciTablePrefix='ci_']
 * @param {string} [options.cmTablePrefix='cm_']
 * @param {string} [options.sccsTablePrefix='sccs_']
 * @param {string} [options.plpTablePrefix='plp_']
 * @param {string} [options.databaseTable='database_meta_data']
 * @param {boolean} [options.getIncidenceInclusion=true]
 * @param {boolean} [options.getCharacterizationInclusion=true]
 * @param {boolean} [options.getPredictionInclusion=true]
 * @param {boolean} [options.getCohortMethodInclusion=true]
 * @param {boolean} [options.getSccsInclusion=true]
 * @param {boolean} [options.printTimes=false]
 * @returns {Promise<object[]>}
 */
export async function getTargetTable({
                                         schema,
                                         cgTablePrefix = 'cg_',
                                         cTablePrefix = 'c_',
                                         ciTablePrefix = 'ci_',
                                         cmTablePrefix = 'cm_',
                                         sccsTablePrefix = 'sccs_',
                                         plpTablePrefix = 'plp_',
                                         databaseTable = 'database_meta_data',
                                         getIncidenceInclusion = true,
                                         getCharacterizationInclusion = true,
                                         getPredictionInclusion = true,
                                         getCohortMethodInclusion = true,
                                         getSccsInclusion = true,
                                         printTimes = false,
                                     }) {
    const totalStart = Date.now();
    let start = Date.now();

    let cohorts = (await getCohortDefinitions({ schema }))
        .map((r) => ({
            cohortId: r.cohortDefinitionId,
            cohortName: r.cohortName,
            subsetParent: r.subsetParent,
            subsetDefinitionId: r.subsetDefinitionId,
            subsetDefinitionJson: r.subsetDefinitionJson,
        }));

    if (printTimes) console.log(`extracting target cohorts: ${Date.now() - start}ms`);
    start = Date.now();

    for (const c of cohorts) {
        c.subsetCohortId = extractSubsetCohorts(c.subsetDefinitionJson);
    }

    const parents = new Map();
    for (const c of cohorts) {
        if (c.cohortId === c.subsetParent) {
            parents.set(c.cohortId, c.cohortName);
        }
    }
    for (const c of cohorts) {
        c.parentName = parents.get(c.subsetParent) ?? null;
    }

    if (printTimes) console.log(`processing target cohorts: ${Date.now() - start}ms`);
    start = Date.now();

    const rawCounts = await fetchCohortCountsRaw(schema, cgTablePrefix, databaseTable);
    const counts = summarizeCounts(rawCounts);

    let cohortCounts = leftMerge(cohorts, counts, ['cohortId'], ['cohortId'])
        .filter((r) => r.numDatabase != null);

    if (printTimes) console.log(`extracting target cohort counts: ${Date.now() - start}ms`);

    if (getIncidenceInclusion) {
        start = Date.now();
        const inc = await safeCall(() => getIncidenceTargets({ schema, cgTablePrefix, ciTablePrefix }));
        if (inc) cohortCounts = leftMerge(cohortCounts, inc, ['cohortId', 'cohortName'], ['cohortDefinitionId', 'cohortName']);
        if (printTimes) console.log(`extracting incidence targets: ${Date.now() - start}ms`);
    }

    if (getCharacterizationInclusion) {
        start = Date.now();
        const char = await safeCall(() => getCharacterizationTargets({ schema, cgTablePrefix, cTablePrefix, printTimes }));
        if (char) cohortCounts = leftMerge(cohortCounts, char, ['cohortId', 'cohortName'], ['cohortDefinitionId', 'cohortName']);
        if (printTimes) console.log(`extracting characterization targets: ${Date.now() - start}ms`);
    }

    if (getPredictionInclusion) {
        start = Date.now();
        const pred = await safeCall(() => getPredictionTargets({ schema, cgTablePrefix, plpTablePrefix }));
        if (pred) cohortCounts = leftMerge(cohortCounts, pred, ['cohortId', 'cohortName'], ['cohortDefinitionId', 'cohortName']);
        if (printTimes) console.log(`extracting prediction targets: ${Date.now() - start}ms`);
    }

    if (getCohortMethodInclusion) {
        start = Date.now();
        const cm = await safeCall(() => getCmTargets({ schema, cgTablePrefix, cmTablePrefix }));
        if (cm) cohortCounts = leftMerge(cohortCounts, cm, ['cohortId', 'cohortName'], ['cohortDefinitionId', 'cohortName']);
        if (printTimes) console.log(`extracting cohort method targets: ${Date.now() - start}ms`);
    }

    if (getSccsInclusion) {
        start = Date.now();
        const sccs = await safeCall(() => getSccsTargets({ schema, cgTablePrefix, sccsTablePrefix }));
        if (sccs) cohortCounts = leftMerge(cohortCounts, sccs, ['cohortId', 'cohortName'], ['cohortDefinitionId', 'cohortName']);
        if (printTimes) console.log(`extracting sccs targets: ${Date.now() - start}ms`);
    }

    fillNulls(cohortCounts);
    ensureColumns(cohortCounts, ANALYSIS_COLUMNS);

    // cohortCounts.sort((a, b) =>
    //     (a.parentName ?? '').localeCompare(b.parentName ?? '')
    //     || (a.cohortName ?? '').localeCompare(b.cohortName ?? '')
    // );

    cohortCounts.sort((a, b) =>
        String(a.parentName ?? '').localeCompare(String(b.parentName ?? ''))
        || String(a.cohortName ?? '').localeCompare(String(b.cohortName ?? ''))
    );

    console.log(`-- Total time for extracting target table: ${Date.now() - totalStart}ms`);
    return cohortCounts;
}

/**
 * @param {object} options
 * @param {string} options.schema
 * @param {string} [options.cgTablePrefix='cg_']
 * @param {string} [options.cTablePrefix='c_']
 * @param {string} [options.ciTablePrefix='ci_']
 * @param {string} [options.cmTablePrefix='cm_']
 * @param {string} [options.sccsTablePrefix='sccs_']
 * @param {string} [options.plpTablePrefix='plp_']
 * @param {string} [options.databaseTable='database_meta_data']
 * @param {number} [options.targetId]
 * @param {boolean} [options.getIncidenceInclusion=true]
 * @param {boolean} [options.getCharacterizationInclusion=true]
 * @param {boolean} [options.getPredictionInclusion=true]
 * @param {boolean} [options.getCohortMethodInclusion=true]
 * @param {boolean} [options.getSccsInclusion=true]
 * @param {boolean} [options.printTimes=false]
 * @returns {Promise<object[]>}
 */
export async function getOutcomeTable({
                                          schema,
                                          cgTablePrefix = 'cg_',
                                          cTablePrefix = 'c_',
                                          ciTablePrefix = 'ci_',
                                          cmTablePrefix = 'cm_',
                                          sccsTablePrefix = 'sccs_',
                                          plpTablePrefix = 'plp_',
                                          databaseTable = 'database_meta_data',
                                          targetId = null,
                                          getIncidenceInclusion = true,
                                          getCharacterizationInclusion = true,
                                          getPredictionInclusion = true,
                                          getCohortMethodInclusion = true,
                                          getSccsInclusion = true,
                                          printTimes = false,
                                      }) {
    const totalStart = Date.now();
    let start = Date.now();

    let cohorts = (await getCohortDefinitions({ schema }))
        .map((r) => ({
            cohortId: r.cohortDefinitionId,
            cohortName: r.cohortName,
            subsetParent: r.subsetParent,
            subsetDefinitionId: r.subsetDefinitionId,
        }));

    if (printTimes) console.log(`extracting outcome cohorts: ${Date.now() - start}ms`);
    start = Date.now();

    const parents = new Map();
    for (const c of cohorts) {
        if (c.cohortId === c.subsetParent) {
            parents.set(c.cohortId, c.cohortName);
        }
    }
    for (const c of cohorts) {
        c.parentName = parents.get(c.subsetParent) ?? null;
    }

    if (printTimes) console.log(`processing outcome parent cohorts: ${Date.now() - start}ms`);
    start = Date.now();

    const rawCounts = await fetchCohortCountsRaw(schema, cgTablePrefix, databaseTable);
    const counts = summarizeCounts(rawCounts);

    let cohortCounts = leftMerge(cohorts, counts, ['cohortId'], ['cohortId'])
        .filter((r) => r.numDatabase != null);

    if (printTimes) console.log(`adding outcome cohort counts: ${Date.now() - start}ms`);

    if (getIncidenceInclusion) {
        start = Date.now();
        const inc = await safeCall(() => getIncidenceOutcomes({ schema, cgTablePrefix, ciTablePrefix, targetId }));
        if (inc) cohortCounts = leftMerge(cohortCounts, inc, ['cohortId', 'cohortName'], ['cohortDefinitionId', 'cohortName']);
        if (printTimes) console.log(`finding incidence outcomes: ${Date.now() - start}ms`);
    }

    if (getCharacterizationInclusion) {
        start = Date.now();
        const char = await safeCall(() => getCharacterizationOutcomes({ schema, cgTablePrefix, cTablePrefix, targetId, printTimes }));
        if (char) cohortCounts = leftMerge(cohortCounts, char, ['cohortId', 'cohortName'], ['cohortDefinitionId', 'cohortName']);
        if (printTimes) console.log(`extracting characterization outcomes: ${Date.now() - start}ms`);
    }

    if (getPredictionInclusion) {
        start = Date.now();
        const pred = await safeCall(() => getPredictionOutcomes({ schema, cgTablePrefix, plpTablePrefix, targetId }));
        if (pred) cohortCounts = leftMerge(cohortCounts, pred, ['cohortId', 'cohortName'], ['cohortDefinitionId', 'cohortName']);
        if (printTimes) console.log(`extracting prediction outcomes: ${Date.now() - start}ms`);
    }

    if (getCohortMethodInclusion) {
        start = Date.now();
        const cm = await safeCall(() => getCmOutcomes({ schema, cgTablePrefix, cmTablePrefix, targetId }));
        if (cm) cohortCounts = leftMerge(cohortCounts, cm, ['cohortId', 'cohortName'], ['cohortDefinitionId', 'cohortName']);
        if (printTimes) console.log(`extracting cohort method outcomes: ${Date.now() - start}ms`);
    }

    if (getSccsInclusion) {
        start = Date.now();
        const sccs = await safeCall(() => getSccsOutcomes({ schema, cgTablePrefix, sccsTablePrefix, targetId }));
        if (sccs) cohortCounts = leftMerge(cohortCounts, sccs, ['cohortId', 'cohortName'], ['cohortDefinitionId', 'cohortName']);
        if (printTimes) console.log(`extracting sccs outcomes: ${Date.now() - start}ms`);
    }

    fillNulls(cohortCounts);
    ensureColumns(cohortCounts, OUTCOME_ANALYSIS_COLUMNS);

    cohortCounts = cohortCounts.filter((r) =>
        OUTCOME_ANALYSIS_COLUMNS.some((col) => r[col] !== 0)
    );

    cohortCounts = cohortCounts.filter((r) =>
        OUTCOME_ANALYSIS_COLUMNS.some((col) => r[col] !== 0)
    );


    cohortCounts.sort((a, b) =>
        String(a.parentName ?? '').localeCompare(String(b.parentName ?? ''))
        || String(a.cohortName ?? '').localeCompare(String(b.cohortName ?? ''))
    );

    // cohortCounts.sort((a, b) =>
    //     (a.parentName ?? '').localeCompare(b.parentName ?? '')
    //     || (a.cohortName ?? '').localeCompare(b.cohortName ?? '')
    // );

    console.log(`-- Total time for extracting outcome table: ${Date.now() - totalStart}ms`);
    return cohortCounts;
}