import { parseCovariateNameString } from './parseCovariateNameString.js';

/**
 * @param {object} options
 * @param {object[]} options.caseCounts
 * @param {object[]} options.targetCounts
 * @param {object[]} options.caseFeatures
 * @param {object[]} options.targetFeatures
 * @returns {object[]|null}
 */
export function processBinaryRiskFactorFeatures({
                                                    caseCounts,
                                                    targetCounts,
                                                    caseFeatures,
                                                    targetFeatures,
                                                }) {
    if (!targetCounts.length || !caseCounts.length) {
        console.warn('No targets or outcomes');
        return null;
    }

    // Index caseCounts by full param key
    const caseCountIndex = new Map();
    for (const r of caseCounts) {
        caseCountIndex.set(`${r.databaseId}|${r.minPriorObservation}|${r.outcomeWashoutDays}|${r.riskWindowStart}|${r.riskWindowEnd}|${r.startAnchor}|${r.endAnchor}`, r);
    }

    // Index targetCounts by db+obs+washout
    const targetCountIndex = new Map();
    for (const r of targetCounts) {
        targetCountIndex.set(`${r.databaseId}|${r.minPriorObservation}|${r.outcomeWashoutDays}`, r);
    }

    // Index caseFeatures: paramKey -> covariateKey -> feature
    const caseFeatIndex = new Map();
    for (const r of caseFeatures) {
        if (r.sumValue < 0) continue;
        const pKey = `${r.databaseId}|${r.minPriorObservation}|${r.outcomeWashoutDays}|${r.riskWindowStart}|${r.riskWindowEnd}|${r.startAnchor}|${r.endAnchor}`;
        let inner = caseFeatIndex.get(pKey);
        if (!inner) { inner = new Map(); caseFeatIndex.set(pKey, inner); }
        inner.set(`${r.targetCohortId}|${r.outcomeCohortId}|${r.covariateId}`, r);
    }

    // Group targetFeatures by db+obs+washout
    const targetFeatIndex = new Map();
    for (const r of targetFeatures) {
        if (r.sumValue < 0) continue;
        const key = `${r.databaseId}|${r.minPriorObservation}|${r.outcomeWashoutDays}`;
        let arr = targetFeatIndex.get(key);
        if (!arr) { arr = []; targetFeatIndex.set(key, arr); }
        arr.push(r);
    }

    const allData = [];
    const seenParamKeys = new Set();

    for (const cc of caseCounts) {
        const pKey = `${cc.databaseId}|${cc.minPriorObservation}|${cc.outcomeWashoutDays}|${cc.riskWindowStart}|${cc.riskWindowEnd}|${cc.startAnchor}|${cc.endAnchor}`;
        if (seenParamKeys.has(pKey)) continue;
        seenParamKeys.add(pKey);

        const caseCount = caseCountIndex.get(pKey);
        const tcKey = `${cc.databaseId}|${cc.minPriorObservation}|${cc.outcomeWashoutDays}`;
        const targetCount = targetCountIndex.get(tcKey);

        if (!caseCount || !targetCount) continue;
        if (caseCount.personCount <= 0 || targetCount.personCount <= 0) continue;

        const nonCaseCount = targetCount.personCount - caseCount.personCount;
        const caseFeatMap = caseFeatIndex.get(pKey) ?? new Map();
        const targetFeats = targetFeatIndex.get(tcKey) ?? [];

        for (const t of targetFeats) {
            const c = caseFeatMap.get(`${t.targetCohortId}|${t.outcomeCohortId}|${t.covariateId}`);

            const cc_val = c?.sumValue ?? 0;
            const ca = c?.averageValue ?? 0;
            const nc = t.sumValue - cc_val;
            const nca = nonCaseCount === 0 ? 0 : nc / nonCaseCount;
            const meanDiff = ca - nca;

            const std1 = caseCount.personCount === 0 ? 0
                : Math.sqrt(((1 - ca) ** 2 * cc_val + (-ca) ** 2 * (caseCount.personCount - cc_val)) / caseCount.personCount);
            const std2 = nonCaseCount === 0 ? 0
                : Math.sqrt(((1 - nca) ** 2 * nc + (-nca) ** 2 * (nonCaseCount - nc)) / nonCaseCount);

            const denom = Math.sqrt((std1 ** 2 + std2 ** 2) / 2);
            const smd = denom === 0 ? 0 : meanDiff / denom;

            allData.push({
                databaseName: t.databaseName,
                databaseId: t.databaseId,
                targetName: t.targetName,
                targetCohortId: t.targetCohortId,
                outcomeName: t.outcomeName,
                outcomeCohortId: t.outcomeCohortId,
                minPriorObservation: t.minPriorObservation,
                outcomeWashoutDays: t.outcomeWashoutDays,
                riskWindowStart: c?.riskWindowStart ?? cc.riskWindowStart,
                riskWindowEnd: c?.riskWindowEnd ?? cc.riskWindowEnd,
                startAnchor: c?.startAnchor ?? cc.startAnchor,
                endAnchor: c?.endAnchor ?? cc.endAnchor,
                covariateName: t.covariateName,
                covariateNameParsed: parseCovariateNameString(t.covariateName),
                covariateId: t.covariateId,
                casePersonCount: caseCount.personCount,
                nonCasePersonCount: nonCaseCount,
                caseCount: cc_val,
                caseAverage: ca,
                nonCaseCount: nc,
                nonCaseAverage: nca,
                SMD: smd,
                absSMD: Math.abs(smd),
            });
        }
    }

    return allData;
}

/**
 * @param {object} options
 * @param {object[]} options.caseFeatures
 * @param {object[]} options.targetFeatures
 * @returns {object[]|null}
 */
export function processContinuousRiskFactorFeatures({
                                                        caseFeatures,
                                                        targetFeatures,
                                                    }) {
    const outcomeKeysSeen = new Set();
    const outcomes = [];
    for (const r of caseFeatures) {
        const key = `${r.outcomeCohortId}|${r.outcomeWashoutDays}|${r.riskWindowStart}|${r.riskWindowEnd}|${r.startAnchor}|${r.endAnchor}`;
        if (!outcomeKeysSeen.has(key)) {
            outcomeKeysSeen.add(key);
            outcomes.push({ outcomeName: r.outcomeName, outcomeCohortId: r.outcomeCohortId, outcomeWashoutDays: r.outcomeWashoutDays, riskWindowStart: r.riskWindowStart, riskWindowEnd: r.riskWindowEnd, startAnchor: r.startAnchor, endAnchor: r.endAnchor });
        }
    }

    if (outcomes.length === 0) return null;

    // Index caseFeatures: outcomeKey -> (databaseId|targetCohortId|minPriorObs|covariateId) -> renamed feature
    const caseIndex = new Map();
    for (const r of caseFeatures) {
        const oKey = `${r.outcomeCohortId}|${r.outcomeWashoutDays}|${r.riskWindowStart}|${r.riskWindowEnd}|${r.startAnchor}|${r.endAnchor}`;
        let inner = caseIndex.get(oKey);
        if (!inner) { inner = new Map(); caseIndex.set(oKey, inner); }
        inner.set(`${r.databaseId}|${r.targetCohortId}|${r.minPriorObservation}|${r.covariateId}`, {
            outcomeName: r.outcomeName, outcomeCohortId: r.outcomeCohortId, outcomeWashoutDays: r.outcomeWashoutDays,
            riskWindowStart: r.riskWindowStart, riskWindowEnd: r.riskWindowEnd, startAnchor: r.startAnchor, endAnchor: r.endAnchor,
            caseCountValue: r.countValue, caseMinValue: r.minValue, caseMaxValue: r.maxValue,
            caseAverageValue: r.averageValue, caseStandardDeviation: r.standardDeviation, caseMedianValue: r.medianValue,
            caseP10Value: r.p10Value, caseP25Value: r.p25Value, caseP75Value: r.p75Value, caseP90Value: r.p90Value,
        });
    }

    // Pre-rename all targetFeatures once
    const renamedTargets = targetFeatures.map((r) => ({
        databaseName: r.databaseName, databaseId: r.databaseId, targetName: r.targetName, targetCohortId: r.targetCohortId,
        minPriorObservation: r.minPriorObservation, covariateName: r.covariateName, covariateNameParsed: parseCovariateNameString(r.covariateName), covariateId: r.covariateId,
        targetCountValue: r.countValue, targetMinValue: r.minValue, targetMaxValue: r.maxValue,
        targetAverageValue: r.averageValue, targetStandardDeviation: r.standardDeviation, targetMedianValue: r.medianValue,
        targetP10Value: r.p10Value, targetP25Value: r.p25Value, targetP75Value: r.p75Value, targetP90Value: r.p90Value,
    }));

    const allData = [];

    for (const o of outcomes) {
        const oKey = `${o.outcomeCohortId}|${o.outcomeWashoutDays}|${o.riskWindowStart}|${o.riskWindowEnd}|${o.startAnchor}|${o.endAnchor}`;
        const innerCaseMap = caseIndex.get(oKey) ?? new Map();

        for (const t of renamedTargets) {
            if (t.targetCohortId === o.outcomeCohortId) continue;
            const c = innerCaseMap.get(`${t.databaseId}|${t.targetCohortId}|${t.minPriorObservation}|${t.covariateId}`);

            const caseAverageValue = c?.caseAverageValue ?? 0;
            const caseStandardDeviation = c?.caseStandardDeviation ?? 0;
            const denom = Math.sqrt((caseStandardDeviation ** 2 + t.targetStandardDeviation ** 2) / 2);
            const SMD = denom === 0 ? 0 : (caseAverageValue - t.targetAverageValue) / denom;

            allData.push({
                ...t,
                outcomeCohortId: c?.outcomeCohortId ?? o.outcomeCohortId,
                outcomeName: c?.outcomeName ?? o.outcomeName,
                outcomeWashoutDays: c?.outcomeWashoutDays ?? o.outcomeWashoutDays,
                riskWindowStart: c?.riskWindowStart ?? o.riskWindowStart,
                riskWindowEnd: c?.riskWindowEnd ?? o.riskWindowEnd,
                startAnchor: c?.startAnchor ?? o.startAnchor,
                endAnchor: c?.endAnchor ?? o.endAnchor,
                caseCountValue: c?.caseCountValue ?? 0,
                caseMinValue: c?.caseMinValue ?? 0,
                caseMaxValue: c?.caseMaxValue ?? 0,
                caseAverageValue,
                caseStandardDeviation,
                caseMedianValue: c?.caseMedianValue ?? 0,
                caseP10Value: c?.caseP10Value ?? 0,
                caseP25Value: c?.caseP25Value ?? 0,
                caseP75Value: c?.caseP75Value ?? 0,
                caseP90Value: c?.caseP90Value ?? 0,
                SMD,
                absSMD: Math.abs(SMD),
            });
        }
    }

    return allData;
}