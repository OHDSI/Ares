import express from "express";
import dotenv from "dotenv";


const {queryDb} = await import('../config/postgresDbConnection.js');
import {connectionHandler, getQueryHistory, getHistoryOffset, clearQueryHistory, runWithQueryContext} from '../config/postgresDbConnection.js';

dotenv.config();

import logger, { getLogBuffer, getBufferOffset, clearLogBuffer } from "../utils/logger.js";


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
import {getOutcomeDataAvailability} from "../controllers/strategus/characterization/outcomeAvailable.js";

const schemaName = process.env.STRATEGUS_SCHEMA || 'app'

// Maps each URL segment to a human-readable report label so history entries
const PATH_LABELS = {
    'binary-risk-factors':          'Risk Factors',
    'continuous-risk-factors':      'Risk Factors',
    'case-counts':                  'Risk Factors',
    'case-target-counts':           'Risk Factors',
    'binary-case-series':           'Case Series',
    'continuous-case-series':       'Case Series',
    'dechallenge-rechallenge':      'Dechallenge / Rechallenge',
    'dechallenge-rechallenge-fails':'Dechallenge / Rechallenge',
    'incidence-rates':              'Cohort Incidence',
    'cohort-binary':                'Cohort Comparison',
    'cohort-continuous':            'Cohort Comparison',
    'time-to-event':                'Time to Event',
    'target-table':                 'Summaries',
    'outcome-table':                'Summaries',
    'cohort-unique-people':         'Summaries',
    'outcome-data-availability':    'Summaries',
    'datasources':                  'Data Sources',
};

router.use((req, res, next) => {
    const segment = req.path.split('/').filter(Boolean).pop() ?? '';
    const label = PATH_LABELS[segment] ?? null;
    if (label) {
        runWithQueryContext(label, next);
    } else {
        next();
    }
});

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
            FROM ${schemaName}.cg_cohort_count cc
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

router.get('/api/characterization/outcome-data-availability', async (req, res) => {
    const { targetId, outcomeIds } = req.query;
    if (!targetId || !outcomeIds) {
        return res.status(400).json({ error: 'targetId and outcomeIds are required' });
    }

    try {
        const rows = await getOutcomeDataAvailability({
            schema: schemaName,
            targetId: parseInt(targetId, 10),
            outcomeIds: outcomeIds.split(',').map(Number),
        });
        res.json(rows);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${message}`);
        res.status(500).json({ error: message });
    }
});


router.get('/api/debug/slow-query', (req, res) => {
    const secs = Math.min(parseInt(req.query.secs ?? '30', 10), 300);
    // fire-and-forget so the HTTP response returns immediately
    queryDb(`SELECT pg_sleep(${secs})`).catch(() => {});
    res.json({ message: `Slow query started (${secs}s)` });
});

router.get('/api/debug/query-history', (req, res) => {
    const cursor = parseInt(req.query.cursor ?? '0', 10);
    const buf = getQueryHistory();
    const offset = getHistoryOffset();
    const bufIndex = Math.max(0, cursor - offset);
    const entries = buf.slice(bufIndex);
    res.json({ entries, cursor: offset + buf.length });
});

router.delete('/api/debug/query-history', (req, res) => {
    clearQueryHistory();
    res.json({ message: 'History cleared' });
});

router.get('/api/debug/running-queries', async (req, res) => {
    try {
        const rows = await queryDb(`
            SELECT
                pid,
                state,
                query,
                EXTRACT(EPOCH FROM (now() - query_start))::int AS duration_seconds,
                query_start,
                application_name,
                wait_event_type,
                wait_event
            FROM pg_stat_activity
            WHERE state = 'active'
              AND query NOT ILIKE '%pg_stat_activity%'
              AND pid <> pg_backend_pid()
            ORDER BY query_start ASC
        `);
        res.json(rows);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`debug/running-queries: ${message}`);
        res.status(500).json({ error: message });
    }
});

router.get('/api/debug/logs', (req, res) => {
    const cursor = parseInt(req.query.cursor ?? '0', 10);
    const buf = getLogBuffer();
    const offset = getBufferOffset();
    // cursor is an absolute write count; translate to current buffer index
    const bufIndex = Math.max(0, cursor - offset);
    const entries = buf.slice(bufIndex);
    res.json({ entries, cursor: offset + buf.length });
});

router.delete('/api/debug/logs', (req, res) => {
    clearLogBuffer();
    res.json({ message: 'Log buffer cleared' });
});

//todo: maybe separate different modules into their own routers but will do for now


export default router;