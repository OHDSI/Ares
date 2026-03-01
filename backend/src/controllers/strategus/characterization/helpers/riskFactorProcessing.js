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

    const allData = [];

    const paramKeys = new Set();
    const params = [];
    for (const cc of caseCounts) {
        const key = [
            cc.databaseName, cc.databaseId, cc.minPriorObservation,
            cc.outcomeWashoutDays, cc.riskWindowStart, cc.riskWindowEnd,
            cc.startAnchor, cc.endAnchor,
        ].join('|');
        if (!paramKeys.has(key)) {
            paramKeys.add(key);
            params.push({
                databaseName: cc.databaseName,
                databaseId: cc.databaseId,
                minPriorObservation: cc.minPriorObservation,
                outcomeWashoutDays: cc.outcomeWashoutDays,
                riskWindowStart: cc.riskWindowStart,
                riskWindowEnd: cc.riskWindowEnd,
                startAnchor: cc.startAnchor,
                endAnchor: cc.endAnchor,
            });
        }
    }

    for (const p of params) {
        const caseCount = caseCounts.find((r) =>
            r.databaseName === p.databaseName
            && r.databaseId === p.databaseId
            && r.minPriorObservation === p.minPriorObservation
            && r.outcomeWashoutDays === p.outcomeWashoutDays
            && r.riskWindowStart === p.riskWindowStart
            && r.riskWindowEnd === p.riskWindowEnd
            && r.startAnchor === p.startAnchor
            && r.endAnchor === p.endAnchor
        );

        const targetCount = targetCounts.find((r) =>
            r.databaseName === p.databaseName
            && r.databaseId === p.databaseId
            && r.minPriorObservation === p.minPriorObservation
            && r.outcomeWashoutDays === p.outcomeWashoutDays
        );

        if (!caseCount || !targetCount) continue;
        if (caseCount.personCount <= 0 || targetCount.personCount <= 0) continue;

        const nonCaseCount = targetCount.personCount - caseCount.personCount;

        const tempCases = caseFeatures
            .filter((r) =>
                r.databaseName === p.databaseName
                && r.databaseId === p.databaseId
                && r.minPriorObservation === p.minPriorObservation
                && r.outcomeWashoutDays === p.outcomeWashoutDays
                && r.riskWindowStart === p.riskWindowStart
                && r.riskWindowEnd === p.riskWindowEnd
                && r.startAnchor === p.startAnchor
                && r.endAnchor === p.endAnchor
                && r.sumValue >= 0
            )
            .map((r) => ({
                ...r,
                caseCount: r.sumValue,
                caseAverage: r.averageValue,
            }));

        const tempTarget = targetFeatures
            .filter((r) =>
                r.databaseName === p.databaseName
                && r.databaseId === p.databaseId
                && r.minPriorObservation === p.minPriorObservation
                && r.outcomeWashoutDays === p.outcomeWashoutDays
                && r.sumValue >= 0
            );

        for (const t of tempTarget) {
            const matchKey = (c) =>
                c.databaseName === t.databaseName
                && c.databaseId === t.databaseId
                && c.targetName === t.targetName
                && c.targetCohortId === t.targetCohortId
                && c.outcomeName === t.outcomeName
                && c.outcomeCohortId === t.outcomeCohortId
                && c.minPriorObservation === t.minPriorObservation
                && c.outcomeWashoutDays === t.outcomeWashoutDays
                && c.covariateName === t.covariateName
                && c.covariateId === t.covariateId;

            const c = tempCases.find(matchKey);

            const cc = c?.caseCount ?? 0;
            const ca = c?.caseAverage ?? 0;
            const rws = c?.riskWindowStart ?? p.riskWindowStart;
            const rwe = c?.riskWindowEnd ?? p.riskWindowEnd;
            const sa = c?.startAnchor ?? p.startAnchor;
            const ea = c?.endAnchor ?? p.endAnchor;

            const nc = t.sumValue - cc;
            const nca = nonCaseCount === 0 ? 0 : (t.sumValue - cc) / nonCaseCount;
            const meanDiff = ca - nca;

            const std1 = caseCount.personCount === 0 ? 0
                : Math.sqrt(((1 - ca) ** 2 * cc + (-ca) ** 2 * (caseCount.personCount - cc)) / caseCount.personCount);
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
                riskWindowStart: rws,
                riskWindowEnd: rwe,
                startAnchor: sa,
                endAnchor: ea,
                covariateName: t.covariateName,
                covariateId: t.covariateId,
                caseCount: cc,
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
    const outcomeKeys = new Set();
    const outcomes = [];
    for (const r of caseFeatures) {
        const key = [
            r.outcomeName, r.outcomeCohortId, r.outcomeWashoutDays,
            r.riskWindowStart, r.riskWindowEnd, r.startAnchor, r.endAnchor,
        ].join('|');
        if (!outcomeKeys.has(key)) {
            outcomeKeys.add(key);
            outcomes.push({
                outcomeName: r.outcomeName,
                outcomeCohortId: r.outcomeCohortId,
                outcomeWashoutDays: r.outcomeWashoutDays,
                riskWindowStart: r.riskWindowStart,
                riskWindowEnd: r.riskWindowEnd,
                startAnchor: r.startAnchor,
                endAnchor: r.endAnchor,
            });
        }
    }

    if (outcomes.length === 0) return null;

    const renameTarget = (r) => ({
        databaseName: r.databaseName,
        databaseId: r.databaseId,
        targetName: r.targetName,
        targetCohortId: r.targetCohortId,
        minPriorObservation: r.minPriorObservation,
        covariateName: r.covariateName,
        covariateId: r.covariateId,
        targetCountValue: r.countValue,
        targetMinValue: r.minValue,
        targetMaxValue: r.maxValue,
        targetAverageValue: r.averageValue,
        targetStandardDeviation: r.standardDeviation,
        targetMedianValue: r.medianValue,
        targetP10Value: r.p10Value,
        targetP25Value: r.p25Value,
        targetP75Value: r.p75Value,
        targetP90Value: r.p90Value,
    });

    const renameCase = (r) => ({
        databaseName: r.databaseName,
        databaseId: r.databaseId,
        targetName: r.targetName,
        targetCohortId: r.targetCohortId,
        minPriorObservation: r.minPriorObservation,
        covariateName: r.covariateName,
        covariateId: r.covariateId,
        outcomeName: r.outcomeName,
        outcomeCohortId: r.outcomeCohortId,
        outcomeWashoutDays: r.outcomeWashoutDays,
        riskWindowStart: r.riskWindowStart,
        riskWindowEnd: r.riskWindowEnd,
        startAnchor: r.startAnchor,
        endAnchor: r.endAnchor,
        caseCountValue: r.countValue,
        caseMinValue: r.minValue,
        caseMaxValue: r.maxValue,
        caseAverageValue: r.averageValue,
        caseStandardDeviation: r.standardDeviation,
        caseMedianValue: r.medianValue,
        caseP10Value: r.p10Value,
        caseP25Value: r.p25Value,
        caseP75Value: r.p75Value,
        caseP90Value: r.p90Value,
    });

    const allData = [];

    for (const o of outcomes) {
        const renamedTargets = targetFeatures
            .filter((r) => r.targetCohortId !== o.outcomeCohortId)
            .map(renameTarget);

        const filteredCases = caseFeatures
            .filter((r) =>
                r.outcomeCohortId === o.outcomeCohortId
                && r.outcomeWashoutDays === o.outcomeWashoutDays
                && r.riskWindowStart === o.riskWindowStart
                && r.riskWindowEnd === o.riskWindowEnd
                && r.startAnchor === o.startAnchor
                && r.endAnchor === o.endAnchor
            )
            .map(renameCase);

        for (const t of renamedTargets) {
            const c = filteredCases.find((r) =>
                r.databaseName === t.databaseName
                && r.databaseId === t.databaseId
                && r.targetName === t.targetName
                && r.targetCohortId === t.targetCohortId
                && r.minPriorObservation === t.minPriorObservation
                && r.covariateName === t.covariateName
                && r.covariateId === t.covariateId
            );

            const row = {
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
                caseAverageValue: c?.caseAverageValue ?? 0,
                caseStandardDeviation: c?.caseStandardDeviation ?? 0,
                caseMedianValue: c?.caseMedianValue ?? 0,
                caseP10Value: c?.caseP10Value ?? 0,
                caseP25Value: c?.caseP25Value ?? 0,
                caseP75Value: c?.caseP75Value ?? 0,
                caseP90Value: c?.caseP90Value ?? 0,
            };

            const denom = Math.sqrt((row.caseStandardDeviation ** 2 + row.targetStandardDeviation ** 2) / 2);
            row.SMD = denom === 0 ? 0 : (row.caseAverageValue - row.targetAverageValue) / denom;
            row.absSMD = Math.abs(row.SMD);

            allData.push(row);
        }
    }

    return allData;
}