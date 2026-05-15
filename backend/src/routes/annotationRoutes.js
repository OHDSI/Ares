import express from "express";

import dbInstance from "../config/duckdbConnection.js";
import {
  createAnnotation,
  deleteAnnotation,
  getAnnotationsByVizName, getPaginatedAnnotations,
  updateAnnotation
} from "../controllers/annotationsController.js";

const router = express.Router();


router.post('/api/v1/annotations/search', async (req, res) => {
  const connection = await dbInstance.connect();
  const { chart_ids } = req.body;

  try {
    const annotations = await getAnnotationsByVizName(connection, chart_ids)
    res.json(annotations);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
  finally {
    connection.closeSync()
  }

});

router.post('/api/v1/annotations/', async (req, res) => {
  const connection = await dbInstance.connect();
  const { first, step, filter } = req.body;

  try {
    const annotations = await getPaginatedAnnotations(connection, first, step, filter)
    res.json(annotations);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
  finally {
    connection.closeSync()
  }

});

router.get('/api/v1/charts/', async (req, res) => {
  const connection = await dbInstance.connect();

  try {
    const results = await connection.runAndReadAll('SELECT * FROM charts');
    const rows = results.getRowObjects();
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No charts available' });
    }
    else {
      res.json(rows);
    }
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
  finally {
    connection.closeSync();
  }
});

router.post('/api/v1/annotations/new', async (req, res) => {
  const { id, chartId, chartName, reportName, domainName, conceptId, coordinates, metadata, body } = req.body;
  const connection = await dbInstance.connect();
  try {
    const annotation = await createAnnotation(connection, chartId, chartName, reportName, domainName, conceptId, {id, coordinates, metadata, body})
    res.status(201).json({ annotation });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
  finally {
    connection.closeSync();
  }
});

router.put('/api/v1/annotations/:id', async (req, res) => {
  const { id } = req.params;
  const { coordinates, metadata, body } = req.body;
  const connection = await dbInstance.connect();
  try {
    const updatedAnnotation = await updateAnnotation(connection, id, {body, coordinates, metadata})
    res.json({ annotation: updatedAnnotation});
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
  finally {
    connection.closeSync();
  }
});

router.delete('/api/v1/annotations/:id', async (req, res) => {
  const { id } = req.params;
  const connection = await dbInstance.connect();
  try {
    await deleteAnnotation(connection, id)
    connection.closeSync();
    res.json({ message: 'Annotation deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: message });
  }
  finally {
    connection.closeSync();
  }
});

export default router;