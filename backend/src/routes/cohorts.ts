import express, { Request, Response } from "express";
import { runWithQueryContext } from "#config/db.js";
import logger from "#utils/logger.js";
import { parseIntParam, parseIntList } from "#shared/queryHelpers.js";
import schemaResolver from "#middleware/schemaResolver.js";
import { ok, err } from "#shared/response.js";
import {
  getCohortCounts,
  getCohortGeneration,
  getCohortInclusionRules,
  getCohortInclusionStats,
  getCohortDefinitions,
} from "#controllers/strategus/cohorts.js";
import { renderCohortMarkdown } from "#utils/circeRenderer.js";

const router = express.Router();

const PATH_LABELS: Record<string, string> = {
  counts: "Cohorts",
  generation: "Cohorts",
  definitions: "Cohorts",
  "inclusion-rules": "Cohorts",
  "inclusion-stats": "Cohorts",
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

router.get("/api/cohorts/counts", async (req: Request, res: Response) => {
  const { cohortIds, databaseIds } = req.query as Record<
    string,
    string | undefined
  >;
  try {
    const rows = await getCohortCounts({
      schema: req.resolvedSchema,
      cohortIds: cohortIds ? parseIntList(cohortIds) : null,
      databaseIds: databaseIds ? databaseIds.split(",") : null,
    });
    res.json(ok(rows));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`cohorts/counts: ${message}`);
    res.status(500).json(err(message));
  }
});

router.get("/api/cohorts/generation", async (req: Request, res: Response) => {
  const { cohortIds } = req.query as Record<string, string | undefined>;
  try {
    const rows = await getCohortGeneration({
      schema: req.resolvedSchema,
      cohortIds: cohortIds ? parseIntList(cohortIds) : null,
    });
    res.json(ok(rows));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`cohorts/generation: ${message}`);
    res.status(500).json(err(message));
  }
});

router.get("/api/cohorts/definitions", async (req: Request, res: Response) => {
  const { cohortIds, slim } = req.query as Record<string, string | undefined>;
  try {
    const rows = await getCohortDefinitions({
      schema: req.resolvedSchema,
      targetIds: cohortIds ? parseIntList(cohortIds) : null,
      slim: slim === "true",
    });
    res.json(ok(rows));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`cohorts/definitions: ${message}`);
    res.status(500).json(err(message));
  }
});

router.get(
  "/api/cohorts/definition-markdown",
  async (req: Request, res: Response) => {
    const { cohortId } = req.query as Record<string, string | undefined>;
    if (!cohortId) return res.status(400).json(err("cohortId is required"));
    try {
      const rows = await getCohortDefinitions({
        schema: req.resolvedSchema,
        targetIds: parseIntList(cohortId),
      });
      const row = rows[0];
      if (!row) return res.status(404).json(err("Cohort not found"));
      const markdown = renderCohortMarkdown(
        (row["json"] as string | null) ??
          (row["cohortJson"] as string | null) ??
          "{}",
      );
      res.json(ok({ markdown }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`cohorts/definition-markdown: ${message}`);
      res.status(500).json(err(message));
    }
  },
);

router.get(
  "/api/cohorts/inclusion-rules",
  async (req: Request, res: Response) => {
    const { cohortId } = req.query as Record<string, string | undefined>;
    if (!cohortId) {
      return res.status(400).json(err("cohortId is required"));
    }
    const cohortIdInt = parseIntParam(cohortId);
    if (cohortIdInt === null)
      return res.status(400).json(err("cohortId must be a number"));
    try {
      const rows = await getCohortInclusionRules({
        schema: req.resolvedSchema,
        cohortId: cohortIdInt,
      });
      res.json(ok(rows));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`cohorts/inclusion-rules: ${message}`);
      res.status(500).json(err(message));
    }
  },
);

router.get(
  "/api/cohorts/inclusion-stats",
  async (req: Request, res: Response) => {
    const { cohortId, databaseIds } = req.query as Record<
      string,
      string | undefined
    >;
    if (!cohortId) {
      return res.status(400).json(err("cohortId is required"));
    }
    const cohortIdInt = parseIntParam(cohortId);
    if (cohortIdInt === null)
      return res.status(400).json(err("cohortId must be a number"));
    try {
      const rows = await getCohortInclusionStats({
        schema: req.resolvedSchema,
        cohortId: cohortIdInt,
        databaseIds: databaseIds ? databaseIds.split(",") : null,
      });
      res.json(ok(rows));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`cohorts/inclusion-stats: ${message}`);
      res.status(500).json(err(message));
    }
  },
);

export default router;
