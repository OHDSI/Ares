import express, { Request, Response } from "express";
import { parseIntParam } from "../shared/queryHelpers.js";
import {
  queryDb,
  getQueryHistory,
  getHistoryOffset,
  clearQueryHistory,
} from "../config/db.js";
import logger, {
  getLogBuffer,
  getBufferOffset,
  clearLogBuffer,
} from "../utils/logger.js";
import { getRunningQueries } from "../controllers/debug.js";
import { ok, err } from "../shared/response.js";

const router = express.Router();

router.get("/api/debug/slow-query", (req: Request, res: Response) => {
  const secs = Math.min(
    Math.max(1, parseIntParam(req.query["secs"] as string | undefined) ?? 30),
    300,
  );
  const sleepSql =
    process.env["DB_PROVIDER"] === "databricks"
      ? "SELECT sleep(@secs)"
      : "SELECT pg_sleep(@secs)";
  queryDb(sleepSql, { secs }).catch((e: unknown) => {
    logger.warn(
      `debug/slow-query: ${e instanceof Error ? e.message : String(e)}`,
    );
  });
  res.json(ok(`Slow query started (${secs}s)`));
});

router.get("/api/debug/query-history", (req: Request, res: Response) => {
  const cursor = parseIntParam(req.query["cursor"] as string | undefined) ?? 0;
  const buf = getQueryHistory();
  const offset = getHistoryOffset();
  const bufIndex = Math.max(0, cursor - offset);
  const entries = buf.slice(bufIndex);
  res.json(ok(entries, { cursor: offset + buf.length }));
});

router.delete("/api/debug/query-history", (_req: Request, res: Response) => {
  clearQueryHistory();
  res.status(204).send();
});

router.get(
  "/api/debug/running-queries",
  async (_req: Request, res: Response) => {
    try {
      const rows = await getRunningQueries();
      res.json(ok(rows));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`debug/running-queries: ${message}`);
      res.status(500).json(err(message));
    }
  },
);

router.get("/api/debug/logs", (req: Request, res: Response) => {
  const cursor = parseIntParam(req.query["cursor"] as string | undefined) ?? 0;
  const buf = getLogBuffer();
  const offset = getBufferOffset();
  const bufIndex = Math.max(0, cursor - offset);
  const entries = buf.slice(bufIndex);
  res.json(ok(entries, { cursor: offset + buf.length }));
});

router.delete("/api/debug/logs", (_req: Request, res: Response) => {
  clearLogBuffer();
  res.status(204).send();
});

export default router;
