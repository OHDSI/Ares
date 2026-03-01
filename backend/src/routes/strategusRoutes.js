import express from "express";
import dotenv from "dotenv";


const {queryDb} = await import('../config/postgresDbConnection.js');
import {connectionHandler} from '../config/postgresDbConnection.js';

dotenv.config();

import logger from "../utils/logger.js";


const router = express.Router();


import {getTargetTable, getOutcomeTable} from '../controllers/strategus/characterization/summaries.js';
import {
    getCharacterizationCohortBinary,
    getCharacterizationCohortContinuous,
} from '../controllers/strategus/characterization/cohortComparison.js';

import {
    getDechallengeRechallenge,
    getDechallengeRechallengeFails,
} from '../controllers/strategus/characterization/dechallengeRechallenge.js';

import {
    getCaseCounts,
    getCaseTargetCounts,
    getBinaryRiskFactors,
    getContinuousRiskFactors,
} from '../controllers/strategus/characterization/riskFactors.js';
import {getTimeToEvent} from "../controllers/strategus/characterization/timeToEvent.js";

import {getBinaryCaseSeries, getContinuousCaseSeries} from '../controllers/strategus/characterization/caseSeries.js';
import {getIncidenceRates} from "../controllers/strategus/characterization/incidence.js";
import {getDatasources} from "../controllers/strategus/dataSources.js";

const schemaName = process.env.STRATEGUS_SCHEMA || 'app'

router.get('/api/characterization/cohort-binary', async (req, res) => {
    const {targetIds, databaseIds, minThreshold} = req.query;
    if (!targetIds) {
        return res.status(400).json({error: 'targetIds query parameter is required'});
    }

    try {
        const result = await getCharacterizationCohortBinary({
            schema: schemaName,
            targetIds: targetIds.split(',').map(Number),
            databaseIds: databaseIds ? databaseIds.split(',') : null,
            minThreshold: minThreshold != null ? parseFloat(minThreshold) : 0,
        });
        res.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${message}`);
        res.status(500).json({error: message});
    }
});

router.get('/api/characterization/cohort-continuous', async (req, res) => {
    const {targetIds, databaseIds, minThreshold} = req.query;
    if (!targetIds) {
        return res.status(400).json({error: 'targetIds query parameter is required'});
    }

    try {
        const result = await getCharacterizationCohortContinuous({
            schema: schemaName,
            targetIds: targetIds.split(',').map(Number),
            databaseIds: databaseIds ? databaseIds.split(',') : null,
            minThreshold: minThreshold != null ? parseFloat(minThreshold) : 0,
        });
        res.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${message}`);
        res.status(500).json({error: message});
    }
});


//Target and outcome tables
router.get('/api/characterization/target-table', async (req, res) => {
    try {
        const rows = await getTargetTable({
            schema: schemaName,
            getPredictionInclusion: false,
            getCohortMethodInclusion: false,
            getSccsInclusion: false,
        });
        res.json(rows);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${message}`);
        res.status(500).json({error: message});
    }
});

router.get('/api/characterization/outcome-table', async (req, res) => {
    const {targetId} = req.query;
    if (!targetId) {
        return res.status(400).json({error: 'targetId query parameter is required'});
    }

    try {
        const rows = await getOutcomeTable({
            schema: schemaName,
            targetId: parseInt(targetId, 10),
            getPredictionInclusion: false,
            getCohortMethodInclusion: false,
            getSccsInclusion: false,
        });
        res.json(rows);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${message}`);
        res.status(500).json({error: message});
    }
});

router.get('/api/characterization/dechallenge-rechallenge', async (req, res) => {
    const {targetIds, outcomeIds} = req.query;

    try {
        const rows = await getDechallengeRechallenge({
            schema: schemaName,
            targetIds: targetIds ? targetIds.split(',').map(Number) : null,
            outcomeIds: outcomeIds ? outcomeIds.split(',').map(Number) : null,
        });
        res.json(rows);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${message}`);
        res.status(500).json({error: message});
    }
});

// dechallenge rechanllenge

router.get('/api/characterization/dechallenge-rechallenge-fails', async (req, res) => {
    const {targetId, outcomeId, databaseId, dechallengeStopInterval, dechallengeEvaluationWindow} = req.query;
    if (!targetId || !outcomeId || !databaseId) {
        return res.status(400).json({error: 'targetId, outcomeId, and databaseId are required'});
    }

    try {
        const rows = await getDechallengeRechallengeFails({
            schema: schemaName,
            targetId: parseInt(targetId, 10),
            outcomeId: parseInt(outcomeId, 10),
            databaseId,
            dechallengeStopInterval: dechallengeStopInterval != null ? parseInt(dechallengeStopInterval, 10) : null,
            dechallengeEvaluationWindow: dechallengeEvaluationWindow != null ? parseInt(dechallengeEvaluationWindow, 10) : null,
        });
        res.json(rows);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${message}`);
        res.status(500).json({error: message});
    }
});

router.get('/api/characterization/cohort-unique-people', async (req, res) => {
    const {cohortId} = req.query;
    if (!cohortId) {
        return res.status(400).json({error: 'cohortId is required'});
    }

    try {
        const sql = `
            SELECT cc.database_id, cc.cohort_id, cc.cohort_entries, cc.cohort_subjects
            FROM app.cg_cohort_count cc
            WHERE cc.cohort_id = ${parseInt(cohortId, 10)}
        `;
        const rows = await queryDb(sql);
        const isUnique = rows.length > 0 && rows.every((r) => r.cohortEntries === r.cohortSubjects);
        res.json({isUnique});
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${message}`);
        res.status(500).json({error: message});
    }
});

// risk factors


router.get('/api/characterization/case-counts', async (req, res) => {
    const {targetIds, outcomeIds, databaseIds, riskWindowStart, riskWindowEnd, startAnchor, endAnchor} = req.query;

    try {
        const rows = await getCaseCounts({
            schema: schemaName,
            targetIds: targetIds ? targetIds.split(',').map(Number) : null,
            outcomeIds: outcomeIds ? outcomeIds.split(',').map(Number) : null,
            databaseIds: databaseIds ? databaseIds.split(',') : null,
            riskWindowStart: riskWindowStart != null ? [parseInt(riskWindowStart, 10)] : null,
            riskWindowEnd: riskWindowEnd != null ? [parseInt(riskWindowEnd, 10)] : null,
            startAnchor: startAnchor ? [startAnchor] : null,
            endAnchor: endAnchor ? [endAnchor] : null,
        });
        res.json(rows);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${message}`);
        res.status(500).json({error: message});
    }
});

router.get('/api/characterization/case-target-counts', async (req, res) => {
    const {targetIds, outcomeIds, databaseIds} = req.query;

    try {
        const rows = await getCaseTargetCounts({
            schema: schemaName,
            targetIds: targetIds ? targetIds.split(',').map(Number) : null,
            outcomeIds: outcomeIds ? outcomeIds.split(',').map(Number) : null,
            databaseIds: databaseIds ? databaseIds.split(',') : null,
        });
        res.json(rows);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${message}`);
        res.status(500).json({error: message});
    }
});

router.get('/api/characterization/binary-risk-factors', async (req, res) => {
    const {targetId, outcomeId, databaseId, riskWindowStart, riskWindowEnd, startAnchor, endAnchor} = req.query;
    if (!targetId || !outcomeId) {
        return res.status(400).json({error: 'targetId and outcomeId are required'});
    }

    try {
        const result = await getBinaryRiskFactors({
            schema: schemaName,
            targetId: parseInt(targetId, 10),
            outcomeId: parseInt(outcomeId, 10),
            databaseId: databaseId || null,
            riskWindowStart: riskWindowStart != null ? parseInt(riskWindowStart, 10) : null,
            riskWindowEnd: riskWindowEnd != null ? parseInt(riskWindowEnd, 10) : null,
            startAnchor: startAnchor || null,
            endAnchor: endAnchor || null,
        });
        res.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${message}`);
        res.status(500).json({error: message});
    }
});

router.get('/api/characterization/continuous-risk-factors', async (req, res) => {
    const {targetId, outcomeId, databaseId, riskWindowStart, riskWindowEnd, startAnchor, endAnchor} = req.query;
    if (!targetId || !outcomeId) {
        return res.status(400).json({error: 'targetId and outcomeId are required'});
    }

    try {
        const result = await getContinuousRiskFactors({
            schema: schemaName,
            targetId: parseInt(targetId, 10),
            outcomeId: parseInt(outcomeId, 10),
            databaseIds: databaseId ? [databaseId] : null,
            riskWindowStart: riskWindowStart != null ? parseInt(riskWindowStart, 10) : null,
            riskWindowEnd: riskWindowEnd != null ? parseInt(riskWindowEnd, 10) : null,
            startAnchor: startAnchor || null,
            endAnchor: endAnchor || null,
        });
        res.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${message}`);
        res.status(500).json({error: message});
    }
});

//time-to-event

router.get('/api/characterization/time-to-event', async (req, res) => {
    const {targetIds, outcomeIds} = req.query;

    try {
        const rows = await getTimeToEvent({
            schema: schemaName,
            targetIds: targetIds ? targetIds.split(',').map(Number) : null,
            outcomeIds: outcomeIds ? outcomeIds.split(',').map(Number) : null,
        });
        res.json(rows);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${message}`);
        res.status(500).json({error: message});
    }
});

//case series


router.get('/api/characterization/binary-case-series', async (req, res) => {
    const {targetId, outcomeId, databaseId, riskWindowStart, riskWindowEnd, startAnchor, endAnchor} = req.query;
    if (!targetId || !outcomeId) {
        return res.status(400).json({error: 'targetId and outcomeId are required'});
    }

    try {
        const rows = await getBinaryCaseSeries(connectionHandler, {
            schema: schemaName,
            targetId: parseInt(targetId, 10),
            outcomeId: parseInt(outcomeId, 10),
            databaseIds: databaseId ? [databaseId] : null,
            riskWindowStart: riskWindowStart != null ? parseInt(riskWindowStart, 10) : null,
            riskWindowEnd: riskWindowEnd != null ? parseInt(riskWindowEnd, 10) : null,
            startAnchor: startAnchor || null,
            endAnchor: endAnchor || null,
        });
        res.json(rows);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${message}`);
        res.status(500).json({error: message});
    }
});

router.get('/api/characterization/continuous-case-series', async (req, res) => {
    const {targetId, outcomeId, databaseId, riskWindowStart, riskWindowEnd, startAnchor, endAnchor} = req.query;
    if (!targetId || !outcomeId) {
        return res.status(400).json({error: 'targetId and outcomeId are required'});
    }

    try {
        const rows = await getContinuousCaseSeries(connectionHandler, {
            schema: schemaName,
            targetId: parseInt(targetId, 10),
            outcomeId: parseInt(outcomeId, 10),
            databaseIds: databaseId ? [databaseId] : null,
            riskWindowStart: riskWindowStart != null ? parseInt(riskWindowStart, 10) : null,
            riskWindowEnd: riskWindowEnd != null ? parseInt(riskWindowEnd, 10) : null,
            startAnchor: startAnchor || null,
            endAnchor: endAnchor || null,
        });
        res.json(rows);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${message}`);
        res.status(500).json({error: message});
    }
});

// cohort incidence

router.get('/api/characterization/incidence-rates', async (req, res) => {
    const {targetIds, outcomeIds} = req.query;

    try {
        const rows = await getIncidenceRates({
            schema: schemaName,
            targetIds: targetIds ? targetIds.split(',').map(Number) : null,
            outcomeIds: outcomeIds ? outcomeIds.split(',').map(Number) : null,
        });
        res.json(rows);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${message}`);
        res.status(500).json({error: message});
    }
});

//data sources

router.get('/api/datasources', async (req, res) => {
    try {
        const rows = await getDatasources({schema: schemaName});
        res.json(rows);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${message}`);
        res.status(500).json({error: message});
    }
});

//todo: maybe separate different modules into their own routers but will do for now


export default router;