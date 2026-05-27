import express, { Request, Response } from "express";
import { runWithQueryContext } from "#config/db.js";
import logger from "#utils/logger.js";
import schemaResolver from "#middleware/schemaResolver.js";
import { ok, err } from "#shared/response.js";
import { getDatasources } from "#controllers/strategus/dataSources.js";
import { getDbList } from "#controllers/strategus/dbList.js";

const DB_LIST_SCHEMA = process.env["DB_LIST_SCHEMA"] ?? null;

const router = express.Router();

router.use((req: Request, _res, next) => {
  const segment = req.path.split("/").filter(Boolean).pop() ?? "";
  if (segment === "datasources") {
    runWithQueryContext("Data Sources", next);
  } else {
    next();
  }
});

router.use(schemaResolver);

router.get("/api/datasources", async (req: Request, res: Response) => {
  try {
    const rows = await getDatasources({ schema: req.resolvedSchema });
    res.json(ok(rows));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`datasources: ${message}`);
    res.status(500).json(err(message));
  }
});

router.get("/api/db-list", async (_req: Request, res: Response) => {
  if (!DB_LIST_SCHEMA) {
    return res.json(ok([]));
  }
  try {
    const rows = await getDbList({ listSchema: DB_LIST_SCHEMA });
    res.json(ok(rows));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`db-list: ${message}`);
    res.status(500).json(err(message));
  }
});

export default router;
