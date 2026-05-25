import express, { Request, Response } from "express";
import { runWithQueryContext } from "../config/db.js";
import logger from "../utils/logger.js";
import {
  parseIntParam,
  parseFloatParam,
  parseIntList,
} from "#shared/queryHelpers.js";
import schemaResolver from "#middleware/schemaResolver.js";
import { ok, err } from "#shared/response.js";
import {
  getTargetTable,
  getOutcomeTable,
} from "../controllers/strategus/characterization/summaries.js";
import {
  getCharacterizationCohortBinary,
  getCharacterizationCohortContinuous,
} from "../controllers/strategus/characterization/cohortComparison.js";
import {
  getDechallengeRechallenge,
  getDechallengeRechallengeFails,
} from "../controllers/strategus/characterization/dechallengeRechallenge.js";
import {
  getCaseCounts,
  getCaseTargetCounts,
  getBinaryRiskFactors,
  getContinuousRiskFactors,
} from "../controllers/strategus/characterization/riskFactors.js";
import { getTimeToEvent } from "../controllers/strategus/characterization/timeToEvent.js";
import {
  getBinaryCaseSeries,
  getContinuousCaseSeries,
} from "../controllers/strategus/characterization/caseSeries.js";
import { getIncidenceRates } from "../controllers/strategus/characterization/incidence.js";
import { getOutcomeDataAvailability } from "../controllers/strategus/characterization/outcomeAvailable.js";
import { getCohortUniquePeople } from "../controllers/strategus/cohorts.js";

const router = express.Router();

const PATH_LABELS: Record<string, string> = {
  "binary-risk-factors": "Risk Factors",
  "continuous-risk-factors": "Risk Factors",
  "case-counts": "Risk Factors",
  "case-target-counts": "Risk Factors",
  "binary-case-series": "Case Series",
  "continuous-case-series": "Case Series",
  "dechallenge-rechallenge": "Dechallenge / Rechallenge",
  "dechallenge-rechallenge-fails": "Dechallenge / Rechallenge",
  "incidence-rates": "Cohort Incidence",
  "cohort-binary": "Cohort Comparison",
  "cohort-continuous": "Cohort Comparison",
  "time-to-event": "Time to Event",
  "target-table": "Summaries",
  "outcome-table": "Summaries",
  "cohort-unique-people": "Summaries",
  "outcome-data-availability": "Summaries",
};

router.use((req: Request, _res, next) => {
  const segment = req.path.split("/").filter(Boolean).pop() ?? "";
  const label = PATH_LABELS[segment] ?? null;
  if (label) {
    runWithQueryContext(label, next);
  } else {
    next();
  }
});

router.use(schemaResolver);

router.get(
  "/api/characterization/cohort-binary",
  async (req: Request, res: Response) => {
    const { targetIds, databaseIds, minThreshold } = req.query as Record<
      string,
      string | undefined
    >;
    if (!targetIds) {
      return res.status(400).json(err("targetIds query parameter is required"));
    }
    try {
      const result = await getCharacterizationCohortBinary({
        schema: req.resolvedSchema,
        targetIds: parseIntList(targetIds),
        databaseIds: databaseIds ? databaseIds.split(",") : null,
        minThreshold: parseFloatParam(minThreshold) ?? 0,
      });
      res.json(ok(result));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`cohort-binary: ${message}`);
      res.status(500).json(err(message));
    }
  },
);

router.get(
  "/api/characterization/cohort-continuous",
  async (req: Request, res: Response) => {
    const { targetIds, databaseIds, minThreshold } = req.query as Record<
      string,
      string | undefined
    >;
    if (!targetIds) {
      return res.status(400).json(err("targetIds query parameter is required"));
    }
    try {
      const result = await getCharacterizationCohortContinuous({
        schema: req.resolvedSchema,
        targetIds: parseIntList(targetIds),
        databaseIds: databaseIds ? databaseIds.split(",") : null,
        minThreshold: parseFloatParam(minThreshold) ?? 0,
      });
      res.json(ok(result));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`cohort-continuous: ${message}`);
      res.status(500).json(err(message));
    }
  },
);

router.get(
  "/api/characterization/target-table",
  async (req: Request, res: Response) => {
    try {
      const rows = await getTargetTable({
        schema: req.resolvedSchema,
        getPredictionInclusion: false,
        getCohortMethodInclusion: false,
        getSccsInclusion: false,
      });
      res.json(ok(rows));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`target-table: ${message}`);
      res.status(500).json(err(message));
    }
  },
);

router.get(
  "/api/characterization/outcome-table",
  async (req: Request, res: Response) => {
    const { targetId } = req.query as Record<string, string | undefined>;
    if (!targetId) {
      return res.status(400).json(err("targetId query parameter is required"));
    }
    const targetIdInt = parseIntParam(targetId);
    if (targetIdInt === null)
      return res.status(400).json(err("targetId must be a number"));
    try {
      const rows = await getOutcomeTable({
        schema: req.resolvedSchema,
        targetId: targetIdInt,
        getPredictionInclusion: false,
        getCohortMethodInclusion: false,
        getSccsInclusion: false,
      });
      res.json(ok(rows));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`outcome-table: ${message}`);
      res.status(500).json(err(message));
    }
  },
);

router.get(
  "/api/characterization/dechallenge-rechallenge",
  async (req: Request, res: Response) => {
    const { targetIds, outcomeIds } = req.query as Record<
      string,
      string | undefined
    >;
    try {
      const rows = await getDechallengeRechallenge({
        schema: req.resolvedSchema,
        targetIds: targetIds ? parseIntList(targetIds) : null,
        outcomeIds: outcomeIds ? parseIntList(outcomeIds) : null,
      });
      res.json(ok(rows));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`dechallenge-rechallenge: ${message}`);
      res.status(500).json(err(message));
    }
  },
);

router.get(
  "/api/characterization/dechallenge-rechallenge-fails",
  async (req: Request, res: Response) => {
    const {
      targetId,
      outcomeId,
      databaseId,
      dechallengeStopInterval,
      dechallengeEvaluationWindow,
    } = req.query as Record<string, string | undefined>;
    if (!targetId || !outcomeId || !databaseId) {
      return res
        .status(400)
        .json(err("targetId, outcomeId, and databaseId are required"));
    }
    const targetIdInt = parseIntParam(targetId);
    const outcomeIdInt = parseIntParam(outcomeId);
    if (targetIdInt === null || outcomeIdInt === null)
      return res
        .status(400)
        .json(err("targetId and outcomeId must be numbers"));
    try {
      const rows = await getDechallengeRechallengeFails({
        schema: req.resolvedSchema,
        targetId: targetIdInt,
        outcomeId: outcomeIdInt,
        databaseId,
        dechallengeStopInterval: parseIntParam(dechallengeStopInterval),
        dechallengeEvaluationWindow: parseIntParam(dechallengeEvaluationWindow),
      });
      res.json(ok(rows));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`dechallenge-rechallenge-fails: ${message}`);
      res.status(500).json(err(message));
    }
  },
);

router.get(
  "/api/characterization/cohort-unique-people",
  async (req: Request, res: Response) => {
    const { cohortId } = req.query as Record<string, string | undefined>;
    if (!cohortId) {
      return res.status(400).json(err("cohortId is required"));
    }
    const cohortIdInt = parseIntParam(cohortId);
    if (cohortIdInt === null)
      return res.status(400).json(err("cohortId must be a number"));
    try {
      const rows = await getCohortUniquePeople({
        schema: req.resolvedSchema,
        cohortId: cohortIdInt,
      });
      const isUnique =
        rows.length > 0 &&
        rows.every((r) => r["cohortEntries"] === r["cohortSubjects"]);
      res.json(ok({ isUnique }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`cohort-unique-people: ${message}`);
      res.status(500).json(err(message));
    }
  },
);

router.get(
  "/api/characterization/case-counts",
  async (req: Request, res: Response) => {
    const {
      targetIds,
      outcomeIds,
      databaseIds,
      riskWindowStart,
      riskWindowEnd,
      startAnchor,
      endAnchor,
    } = req.query as Record<string, string | undefined>;
    try {
      const rwStart = parseIntParam(riskWindowStart);
      const rwEnd = parseIntParam(riskWindowEnd);
      const rows = await getCaseCounts({
        schema: req.resolvedSchema,
        targetIds: targetIds ? parseIntList(targetIds) : null,
        outcomeIds: outcomeIds ? parseIntList(outcomeIds) : null,
        databaseIds: databaseIds ? databaseIds.split(",") : null,
        riskWindowStart: rwStart !== null ? [rwStart] : null,
        riskWindowEnd: rwEnd !== null ? [rwEnd] : null,
        startAnchor: startAnchor ? [startAnchor] : null,
        endAnchor: endAnchor ? [endAnchor] : null,
      });
      res.json(ok(rows));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`case-counts: ${message}`);
      res.status(500).json(err(message));
    }
  },
);

router.get(
  "/api/characterization/case-target-counts",
  async (req: Request, res: Response) => {
    const { targetIds, outcomeIds, databaseIds } = req.query as Record<
      string,
      string | undefined
    >;
    try {
      const rows = await getCaseTargetCounts({
        schema: req.resolvedSchema,
        targetIds: targetIds ? parseIntList(targetIds) : null,
        outcomeIds: outcomeIds ? parseIntList(outcomeIds) : null,
        databaseIds: databaseIds ? databaseIds.split(",") : null,
      });
      res.json(ok(rows));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`case-target-counts: ${message}`);
      res.status(500).json(err(message));
    }
  },
);

router.get(
  "/api/characterization/binary-risk-factors",
  async (req: Request, res: Response) => {
    const {
      targetId,
      outcomeId,
      databaseId,
      riskWindowStart,
      riskWindowEnd,
      startAnchor,
      endAnchor,
    } = req.query as Record<string, string | undefined>;
    if (!targetId || !outcomeId) {
      return res.status(400).json(err("targetId and outcomeId are required"));
    }
    const targetIdInt = parseIntParam(targetId);
    const outcomeIdInt = parseIntParam(outcomeId);
    if (targetIdInt === null || outcomeIdInt === null)
      return res
        .status(400)
        .json(err("targetId and outcomeId must be numbers"));
    try {
      const databaseIds = databaseId
        ? databaseId.split(",").filter(Boolean)
        : null;
      const result = await getBinaryRiskFactors({
        schema: req.resolvedSchema,
        targetId: targetIdInt,
        outcomeId: outcomeIdInt,
        databaseIds,
        riskWindowStart: parseIntParam(riskWindowStart),
        riskWindowEnd: parseIntParam(riskWindowEnd),
        startAnchor: startAnchor ?? null,
        endAnchor: endAnchor ?? null,
      });
      res.json(ok(result));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`binary-risk-factors: ${message}`);
      res.status(500).json(err(message));
    }
  },
);

router.get(
  "/api/characterization/continuous-risk-factors",
  async (req: Request, res: Response) => {
    const {
      targetId,
      outcomeId,
      databaseId,
      riskWindowStart,
      riskWindowEnd,
      startAnchor,
      endAnchor,
    } = req.query as Record<string, string | undefined>;
    if (!targetId || !outcomeId) {
      return res.status(400).json(err("targetId and outcomeId are required"));
    }
    const targetIdInt = parseIntParam(targetId);
    const outcomeIdInt = parseIntParam(outcomeId);
    if (targetIdInt === null || outcomeIdInt === null)
      return res
        .status(400)
        .json(err("targetId and outcomeId must be numbers"));
    try {
      const databaseIds = databaseId
        ? databaseId.split(",").filter(Boolean)
        : null;
      const result = await getContinuousRiskFactors({
        schema: req.resolvedSchema,
        targetId: targetIdInt,
        outcomeId: outcomeIdInt,
        databaseIds,
        riskWindowStart: parseIntParam(riskWindowStart),
        riskWindowEnd: parseIntParam(riskWindowEnd),
        startAnchor: startAnchor ?? null,
        endAnchor: endAnchor ?? null,
      });
      res.json(ok(result));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`continuous-risk-factors: ${message}`);
      res.status(500).json(err(message));
    }
  },
);

router.get(
  "/api/characterization/time-to-event",
  async (req: Request, res: Response) => {
    const { targetIds, outcomeIds } = req.query as Record<
      string,
      string | undefined
    >;
    try {
      const rows = await getTimeToEvent({
        schema: req.resolvedSchema,
        targetIds: targetIds ? parseIntList(targetIds) : null,
        outcomeIds: outcomeIds ? parseIntList(outcomeIds) : null,
      });
      res.json(ok(rows));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`time-to-event: ${message}`);
      res.status(500).json(err(message));
    }
  },
);

router.get(
  "/api/characterization/binary-case-series",
  async (req: Request, res: Response) => {
    const {
      targetId,
      outcomeId,
      databaseId,
      riskWindowStart,
      riskWindowEnd,
      startAnchor,
      endAnchor,
    } = req.query as Record<string, string | undefined>;
    if (!targetId || !outcomeId) {
      return res.status(400).json(err("targetId and outcomeId are required"));
    }
    const targetIdInt = parseIntParam(targetId);
    const outcomeIdInt = parseIntParam(outcomeId);
    if (targetIdInt === null || outcomeIdInt === null)
      return res
        .status(400)
        .json(err("targetId and outcomeId must be numbers"));
    try {
      const rows = await getBinaryCaseSeries({
        schema: req.resolvedSchema,
        targetId: targetIdInt,
        outcomeId: outcomeIdInt,
        databaseIds: databaseId ? [databaseId] : null,
        riskWindowStart: parseIntParam(riskWindowStart),
        riskWindowEnd: parseIntParam(riskWindowEnd),
        startAnchor: startAnchor ?? null,
        endAnchor: endAnchor ?? null,
      });
      res.json(ok(rows));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`binary-case-series: ${message}`);
      res.status(500).json(err(message));
    }
  },
);

router.get(
  "/api/characterization/continuous-case-series",
  async (req: Request, res: Response) => {
    const {
      targetId,
      outcomeId,
      databaseId,
      riskWindowStart,
      riskWindowEnd,
      startAnchor,
      endAnchor,
    } = req.query as Record<string, string | undefined>;
    if (!targetId || !outcomeId) {
      return res.status(400).json(err("targetId and outcomeId are required"));
    }
    const targetIdInt = parseIntParam(targetId);
    const outcomeIdInt = parseIntParam(outcomeId);
    if (targetIdInt === null || outcomeIdInt === null)
      return res
        .status(400)
        .json(err("targetId and outcomeId must be numbers"));
    try {
      const rows = await getContinuousCaseSeries({
        schema: req.resolvedSchema,
        targetId: targetIdInt,
        outcomeId: outcomeIdInt,
        databaseIds: databaseId ? [databaseId] : null,
        riskWindowStart: parseIntParam(riskWindowStart),
        riskWindowEnd: parseIntParam(riskWindowEnd),
        startAnchor: startAnchor ?? null,
        endAnchor: endAnchor ?? null,
      });
      res.json(ok(rows));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`continuous-case-series: ${message}`);
      res.status(500).json(err(message));
    }
  },
);

router.get(
  "/api/characterization/incidence-rates",
  async (req: Request, res: Response) => {
    const { targetIds, outcomeIds } = req.query as Record<
      string,
      string | undefined
    >;
    try {
      const rows = await getIncidenceRates({
        schema: req.resolvedSchema,
        targetIds: targetIds ? parseIntList(targetIds) : null,
        outcomeIds: outcomeIds ? parseIntList(outcomeIds) : null,
      });
      res.json(ok(rows));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`incidence-rates: ${message}`);
      res.status(500).json(err(message));
    }
  },
);

router.get(
  "/api/characterization/outcome-data-availability",
  async (req: Request, res: Response) => {
    const { targetId, outcomeIds } = req.query as Record<
      string,
      string | undefined
    >;
    if (!targetId || !outcomeIds) {
      return res.status(400).json(err("targetId and outcomeIds are required"));
    }
    const targetIdInt = parseIntParam(targetId);
    if (targetIdInt === null)
      return res.status(400).json(err("targetId must be a number"));
    try {
      const rows = await getOutcomeDataAvailability({
        schema: req.resolvedSchema,
        targetId: targetIdInt,
        outcomeIds: parseIntList(outcomeIds),
      });
      res.json(ok(rows));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`outcome-data-availability: ${message}`);
      res.status(500).json(err(message));
    }
  },
);

export default router;
