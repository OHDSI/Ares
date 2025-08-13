import express from "express";

import dbInstance from "../config/dbConnection.js";
import {
  createAnnotation,
  deleteAnnotation,
  getAnnotationsByVizName, getPaginatedAnnotations,
  updateAnnotation
} from "../controllers/annotationsController.js";
import logger from "../utils/logger.js";

const router = express.Router();

router.post('/api/v1/annotations/search', async (req, res) => {
  const connection = await dbInstance.connect();
  const { chart_ids } = req.body;

  try {
    const annotations = await getAnnotationsByVizName(connection, chart_ids)
    res.json(annotations);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`${message}`);
    res.status(500).json({ error: message });
  }
  finally {
    connection.close()
  }

});

// router.get('/api/v1/annotations/:id', async (req, res) => {
//   const { id } = req.params;
//   const connection = await dbInstance.connect();
//
//   const results = await connection.runAndReadAll('SELECT * FROM chart_data WHERE id = ?', [id]);
//   const rows = results.getRowsJson();
//
//   connection.close();
//   if (rows.length === 0) {
//     return res.status(404).json({ error: 'Data not found' });
//   }
//   res.json(results[0]);
// });

router.post('/api/v1/annotations/', async (req, res) => {
  const connection = await dbInstance.connect();
  const { first, step, filter } = req.body;

  try {
    const annotations = await getPaginatedAnnotations(connection, first, step, filter)
    res.json(annotations);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`${message}`);
    res.status(500).json({ error: message });
  }
  finally {
    connection.close()
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
    logger.error(`${message}`);
    res.status(500).json({ error: message });
  }
  finally {
    connection.close();
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
    logger.error(`${message}`);
    res.status(500).json({ error: message });
  }
  finally {
    connection.close();
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
    logger.error(`${message}`);
    res.status(500).json({ error: message });
  }
  finally {
    connection.close();
  }
});

router.delete('/api/v1/annotations/:id', async (req, res) => {
  const { id } = req.params;
  const connection = await dbInstance.connect();
  try {
    await deleteAnnotation(connection, id)
    connection.close();
    res.json({ message: 'Annotation deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`${message}`);
    res.status(500).json({ error: message });
  }
  finally {
    connection.close();
  }
});

export default router;