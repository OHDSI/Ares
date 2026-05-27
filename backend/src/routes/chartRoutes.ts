import express, { Request, Response } from "express";
import dbInstance from "#config/duckdbConnection.js";
import { ok, err } from "#shared/response.js";
import { getCharts } from "#controllers/annotations.js";

const router = express.Router();

router.get("/api/v1/charts/", async (_req: Request, res: Response) => {
  const connection = await dbInstance.connect();
  try {
    const rows = await getCharts(connection);
    res.json(ok(rows));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json(err(message));
  } finally {
    connection.closeSync();
  }
});

export default router;
