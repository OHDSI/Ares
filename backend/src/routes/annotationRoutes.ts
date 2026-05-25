import express, { Request, Response } from "express";
import dbInstance from "../config/duckdbConnection.js";
import { ok, err } from "../shared/response.js";
import {
  createAnnotation,
  deleteAnnotation,
  getAnnotationsByVizName,
  getPaginatedAnnotations,
  updateAnnotation,
} from "../controllers/annotations.js";

const router = express.Router();

router.post(
  "/api/v1/annotations/search",
  async (req: Request, res: Response) => {
    const connection = await dbInstance.connect();
    const { chart_ids } = req.body as { chart_ids: string[] };
    try {
      const annotations = await getAnnotationsByVizName(connection, chart_ids);
      res.json(ok(annotations));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json(err(message));
    } finally {
      connection.closeSync();
    }
  },
);

router.post("/api/v1/annotations/", async (req: Request, res: Response) => {
  const connection = await dbInstance.connect();
  const { first, step, filter } = req.body as {
    first: number;
    step: number;
    filter?: string;
  };
  try {
    const result = await getPaginatedAnnotations(
      connection,
      first,
      step,
      filter,
    );
    res.json(
      ok(result.annotations, {
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        totalCount: result.totalCount,
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json(err(message));
  } finally {
    connection.closeSync();
  }
});

router.post("/api/v1/annotations/new", async (req: Request, res: Response) => {
  const {
    id,
    chartId,
    chartName,
    reportName,
    domainName,
    conceptId,
    coordinates,
    metadata,
    body,
  } = req.body;
  const connection = await dbInstance.connect();
  try {
    const annotation = await createAnnotation(
      connection,
      chartId,
      chartName,
      reportName,
      domainName,
      conceptId,
      { id, coordinates, metadata, body },
    );
    res.status(201).json(ok(annotation));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json(err(message));
  } finally {
    connection.closeSync();
  }
});

router.put("/api/v1/annotations/:id", async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { coordinates, metadata, body } = req.body;
  const connection = await dbInstance.connect();
  try {
    const updatedAnnotation = await updateAnnotation(connection, id, {
      body,
      coordinates,
      metadata,
    });
    res.json(ok(updatedAnnotation));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json(err(message));
  } finally {
    connection.closeSync();
  }
});

router.delete(
  "/api/v1/annotations/:id",
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const connection = await dbInstance.connect();
    try {
      await deleteAnnotation(connection, id);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json(err(message));
    } finally {
      connection.closeSync();
    }
  },
);

export default router;
