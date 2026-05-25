import logger from "#utils/logger.js";
import { safeParse } from "#utils/json.js";
import type { DuckDBConnection } from "@duckdb/node-api";
import type {
  Annotation,
  AnnotationBody,
  AnnotationCoordinates,
  AnnotationMetadata,
  AnnotationNote,
  AnnotationsByChartId,
  Chart,
  PaginatedAnnotation,
} from "#types/index.js";

interface DuckDBTimestamp {
  micros: bigint | number;
}

interface RawAnnotationRow extends Record<string, unknown> {
  annotation_id: string;
  viz_id: string;
  created_by: string;
  created_at: DuckDBTimestamp;
  updated_at: DuckDBTimestamp;
  xMin: number | null;
  xMax: number | null;
  yMin: number | null;
  yMax: number | null;
  scopeType: string | null;
  scopeValue: string | null;
  bodyTitle: string | null;
  bodyDescription: string | null;
  noteId: string | null;
  noteTitle: string | null;
  noteDescription: string | null;
  noteCreatedAt: DuckDBTimestamp;
  noteUpdatedAt: DuckDBTimestamp;
  noteCreatedBy: string | null;
  noteLastUpdated: DuckDBTimestamp;
  chart_id: string;
  chart_name: string;
  report_name: string;
  domain_name: string | null;
  concept_id: string | null;
}

interface AnnotationPayload {
  id?: string;
  coordinates?: AnnotationCoordinates;
  metadata: AnnotationMetadata & {
    scope?: { type: string; value: unknown } | null;
  };
  body?: AnnotationBody;
}

interface UpdatePayload {
  body?: AnnotationBody;
  coordinates?: AnnotationCoordinates;
  metadata?: { scope?: { type: string; value: unknown } };
}

function toMs(ts: DuckDBTimestamp): number {
  return Number(ts.micros) / 1000;
}

const createAnnotation = async (
  connection: DuckDBConnection,
  chart_id: string,
  chart_name: string,
  report_name: string,
  domain_name: string | undefined,
  concept_id: number | undefined,
  annotationData: AnnotationPayload,
): Promise<Annotation | Error> => {
  logger.debug(
    `User ${annotationData.metadata.createdBy} submitted a new annotation`,
  );
  try {
    const chartResult = await connection.runAndReadAll(
      `SELECT * FROM charts WHERE chart_id = ?`,
      [chart_id],
    );
    let chart = chartResult.getRowObjects()?.[0] as unknown as
      | Chart
      | undefined;

    if (!chart) {
      const chartId = crypto.randomUUID();
      await connection.run(
        `INSERT INTO charts (id, chart_id, chart_name, report_name, domain_name, concept_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          chartId,
          chart_id,
          chart_name,
          report_name,
          domain_name ?? "NULL",
          concept_id ?? "NULL",
        ],
      );
      chart = {
        id: chartId,
        chart_id,
        chart_name,
        report_name,
        domain_name: domain_name ?? null,
        concept_id: null,
      };
    }

    const annotationId = crypto.randomUUID();

    await connection.run(
      `INSERT INTO annotations (id, viz_id, created_by, created_at, updated_at, deleted_at)
        VALUES (?, ?, ?, ?, ?, NULL)`,
      [
        annotationId,
        chart.id,
        annotationData.metadata.createdBy ?? "unknown",
        new Date().toISOString(),
        new Date().toISOString(),
      ],
    );

    if (annotationData.coordinates) {
      await connection.run(
        `INSERT INTO annotations_coordinates (annotation_id, xMin, xMax, yMin, yMax)
            VALUES (?, ?, ?, ?, ?)`,
        [
          annotationId,
          annotationData.coordinates.xMin,
          annotationData.coordinates.xMax,
          annotationData.coordinates.yMin,
          annotationData.coordinates.yMax,
        ],
      );
    }

    if (annotationData.metadata.scope) {
      await connection.run(
        `INSERT INTO annotations_metadata (annotation_id, scope_type, scope_value)
            VALUES (?, ?, ?)`,
        [
          annotationId,
          annotationData.metadata.scope.type,
          JSON.stringify(annotationData.metadata.scope.value),
        ],
      );
    }

    if (annotationData.body) {
      await connection.run(
        `INSERT INTO annotations_body (annotation_id, title, description)
            VALUES (?, ?, ?)`,
        [
          annotationId,
          annotationData.body.title,
          annotationData.body.description,
        ],
      );

      if (annotationData.body.notes && annotationData.body.notes.length > 0) {
        for (const note of annotationData.body.notes) {
          await connection.run(
            `INSERT INTO annotations_notes (note_id, annotation_id, title, description, created_at, updated_at, created_by, last_updated)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              crypto.randomUUID(),
              annotationId,
              note.title,
              note.description,
              note.createdAt
                ? new Date(note.createdAt).toISOString()
                : new Date().toISOString(),
              note.updatedAt
                ? new Date(note.updatedAt).toISOString()
                : new Date().toISOString(),
              note.createdBy ?? "unknown",
              note.lastUpdated
                ? new Date(note.lastUpdated).toISOString()
                : new Date().toISOString(),
            ],
          );
        }
      }
    }

    logger.debug(`Annotation ${annotationId} successfully created`);
    return {
      id: annotationId,
      metadata: annotationData.metadata,
      coordinates: annotationData.coordinates ?? null,
      body: annotationData.body ?? { title: "", description: "", notes: [] },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`createAnnotation: ${message}`);
    return new Error("Error occurred while creating annotation");
  }
};

const getAnnotationsByVizName = async (
  connection: DuckDBConnection,
  chart_ids: string[],
): Promise<AnnotationsByChartId> => {
  logger.debug(`Getting annotations by chart name: ${chart_ids}`);
  try {
    const placeholders = chart_ids.map(() => "?").join(",");
    const query = `
            SELECT
                a.id AS annotation_id, a.viz_id, a.created_by, a.created_at, a.updated_at,
                ac.xMin AS xMin, ac.xMax AS xMax, ac.yMin AS yMin, ac.yMax AS yMax,
                am.scope_type AS scopeType, am.scope_value AS scopeValue,
                ab.title AS bodyTitle, ab.description AS bodyDescription,
                an.note_id AS noteId, an.title AS noteTitle, an.description AS noteDescription,
                an.created_at AS noteCreatedAt, an.updated_at AS noteUpdatedAt, an.created_by AS noteCreatedBy, an.last_updated AS noteLastUpdated,
                c.chart_id
            FROM charts c
            JOIN annotations a ON c.id = a.viz_id
            LEFT JOIN annotations_coordinates ac ON a.id = ac.annotation_id
            LEFT JOIN annotations_metadata am ON a.id = am.annotation_id
            LEFT JOIN annotations_body ab ON a.id = ab.annotation_id
            LEFT JOIN annotations_notes an ON a.id = an.annotation_id
            WHERE c.chart_id IN (${placeholders})
              AND a.deleted_at IS NULL
        `;

    const resultSet = await connection.runAndReadAll(query, chart_ids);
    const rows = resultSet.getRowObjects() as RawAnnotationRow[];

    if (rows.length === 0) return {};

    const result: AnnotationsByChartId = {};

    rows.forEach((row) => {
      if (!result[row.chart_id]) result[row.chart_id] = [];

      const existing = (result[row.chart_id] as Annotation[]).find(
        (a) => a.id === row.annotation_id,
      );

      if (!existing) {
        (result[row.chart_id] as Annotation[]).push({
          id: row.annotation_id,
          coordinates:
            row.xMin !== null &&
            row.xMax !== null &&
            row.yMin !== null &&
            row.yMax !== null
              ? {
                  xMin: row.xMin,
                  xMax: row.xMax,
                  yMin: row.yMin,
                  yMax: row.yMax,
                }
              : null,
          metadata: {
            createdBy: row.created_by,
            createdAt: toMs(row.created_at),
            updatedAt: toMs(row.updated_at),
            scope: row.scopeType
              ? {
                  type: row.scopeType,
                  value: row.scopeValue ? safeParse(row.scopeValue) : null,
                }
              : null,
          },
          body: {
            title: row.bodyTitle ?? "",
            description: row.bodyDescription ?? "",
            notes: [],
          },
        });
      }

      const annotation = (result[row.chart_id] as Annotation[]).find(
        (a) => a.id === row.annotation_id,
      )!;
      if (row.noteId) {
        annotation.body.notes.push({
          id: row.noteId,
          title: row.noteTitle ?? "",
          description: row.noteDescription ?? "",
          createdAt: toMs(row.noteCreatedAt),
          updatedAt: toMs(row.noteUpdatedAt),
          createdBy: row.noteCreatedBy ?? "",
          lastUpdated: toMs(row.noteLastUpdated),
        });
      }
    });

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`getAnnotationsByVizName: ${message}`);
    throw new Error("Unable to fetch annotations", { cause: error });
  }
};

const getPaginatedAnnotations = async (
  connection: DuckDBConnection,
  first: number,
  step: number,
  filter: string | undefined,
): Promise<{
  annotations: PaginatedAnnotation[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}> => {
  try {
    let filterClause = "";
    let filterParams: (string | number)[] = [];
    if (filter && filter.trim() !== "") {
      filterClause = ` AND (ab.title ILIKE ? OR ab.description ILIKE ? OR a.created_by ILIKE ?)`;
      const filterTerm = `%${filter.trim()}%`;
      filterParams = [filterTerm, filterTerm, filterTerm];
    }

    const countQuery = `
      SELECT COUNT(DISTINCT a.id) AS count
      FROM annotations a
      LEFT JOIN annotations_body ab ON a.id = ab.annotation_id
      WHERE a.deleted_at IS NULL
      ${filterClause};
    `;
    const countResult = await connection.runAndReadAll(
      countQuery,
      filterParams,
    );
    const countRows = countResult.getRowObjects();
    const totalCount = Number(countRows[0]?.["count"] ?? 0);
    const totalPages = Math.ceil(totalCount / step);
    const offset = first;

    const dataQuery = `
      SELECT
        a.id AS annotation_id,
        a.viz_id,
        a.created_by,
        a.created_at,
        a.updated_at,
        ac.xMin,
        ac.xMax,
        ac.yMin,
        ac.yMax,
        am.scope_type AS scopeType,
        am.scope_value AS scopeValue,
        ab.title AS bodyTitle,
        ab.description AS bodyDescription,
        an.note_id AS noteId,
        an.title AS noteTitle,
        an.description AS noteDescription,
        an.created_at AS noteCreatedAt,
        an.updated_at AS noteUpdatedAt,
        an.created_by AS noteCreatedBy,
        an.last_updated AS noteLastUpdated,
        c.chart_id,
        c.chart_name,
        c.report_name,
        c.domain_name,
        c.concept_id
      FROM charts c
      JOIN annotations a ON c.id = a.viz_id
      LEFT JOIN annotations_coordinates ac ON a.id = ac.annotation_id
      LEFT JOIN annotations_metadata am ON a.id = am.annotation_id
      LEFT JOIN annotations_body ab ON a.id = ab.annotation_id
      LEFT JOIN annotations_notes an ON a.id = an.annotation_id
      WHERE a.deleted_at IS NULL
      ${filterClause}
      LIMIT ? OFFSET ?;
    `;
    const dataParams = filterParams.concat([step, offset]);
    const dataResult = await connection.runAndReadAll(dataQuery, dataParams);
    const rows = dataResult.getRowObjects() as RawAnnotationRow[];

    if (rows.length === 0) {
      return {
        annotations: [],
        totalPages,
        currentPage: Math.floor(first / step) + 1,
        totalCount,
      };
    }

    const annotationsMap: Record<string, PaginatedAnnotation> = {};

    rows.forEach((row) => {
      if (!annotationsMap[row.annotation_id]) {
        annotationsMap[row.annotation_id] = {
          id: row.annotation_id,
          vizId: row.viz_id,
          viz_name: row["chart_name"],
          viz_id: row.chart_id,
          report_name: row["report_name"],
          domain_name: row["domain_name"],
          concept_id: row["concept_id"],
          createdBy: row.created_by,
          createdAt: toMs(row.created_at),
          updatedAt: toMs(row.updated_at),
          coordinates:
            row.xMin !== null
              ? {
                  xMin: row.xMin,
                  xMax: row.xMax!,
                  yMin: row.yMin!,
                  yMax: row.yMax!,
                }
              : null,
          metadata: row.scopeType
            ? {
                type: row.scopeType,
                value: row.scopeValue ? safeParse(row.scopeValue) : null,
              }
            : null,
          body: {
            title: row.bodyTitle ?? "",
            description: row.bodyDescription ?? "",
            notes: [],
          },
        };
      }
      if (row.noteId) {
        const ann = annotationsMap[row.annotation_id];
        if (!ann) return;
        (ann["body"] as AnnotationBody).notes.push({
          id: row.noteId,
          title: row.noteTitle ?? "",
          description: row.noteDescription ?? "",
          createdAt: toMs(row.noteCreatedAt),
          updatedAt: toMs(row.noteUpdatedAt),
          createdBy: row.noteCreatedBy ?? "",
          lastUpdated: toMs(row.noteLastUpdated),
        } as AnnotationNote);
      }
    });

    const annotations = Object.values(annotationsMap);

    return {
      annotations,
      totalPages,
      currentPage: Math.floor(first / step) + 1,
      totalCount,
    };
  } catch (error) {
    logger.error(
      `getPaginatedAnnotations: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw new Error("Unable to fetch paginated annotations", { cause: error });
  }
};

const getAnnotation = async (
  connection: DuckDBConnection,
  annotationId: string,
): Promise<Annotation> => {
  logger.debug(`Getting annotation ${annotationId}`);
  try {
    const annotationResult = await connection.runAndReadAll(
      `SELECT * FROM annotations WHERE id = ?`,
      [annotationId],
    );
    const annotation = annotationResult.getRowObjects()?.[0] as
      | Record<string, unknown>
      | undefined;

    if (!annotation) {
      logger.warn(`getAnnotation: annotation ${annotationId} not found`);
    }

    const coordResult = await connection.runAndReadAll(
      `SELECT xMin, xMax, yMin, yMax FROM annotations_coordinates WHERE annotation_id = ?`,
      [annotationId],
    );
    const coordinates = coordResult.getRowObjects()?.[0] as unknown as
      | AnnotationCoordinates
      | undefined;

    const metaResult = await connection.runAndReadAll(
      `SELECT scope_type AS type, scope_value AS value FROM annotations_metadata WHERE annotation_id = ?`,
      [annotationId],
    );
    const metadata = metaResult.getRowObjects()?.[0] as
      | { type: string; value: string }
      | undefined;

    const bodyResult = await connection.runAndReadAll(
      `SELECT title, description FROM annotations_body WHERE annotation_id = ?`,
      [annotationId],
    );
    const body = bodyResult.getRowObjects()?.[0] as
      | { title: string; description: string }
      | undefined;

    const notesResult = await connection.runAndReadAll(
      `SELECT note_id AS id, title, description, created_at AS createdAt, updated_at AS updatedAt,
                created_by AS createdBy, last_updated AS lastUpdated
         FROM annotations_notes WHERE annotation_id = ?`,
      [annotationId],
    );
    const notes = (
      notesResult.getRowObjects() as Array<Record<string, unknown>>
    ).map((note) => ({
      id: note["id"] as string,
      title: note["title"] as string,
      description: note["description"] as string,
      createdBy: note["createdBy"] as string,
      lastUpdated: toMs(note["lastUpdated"] as DuckDBTimestamp),
      updatedAt: toMs(note["updatedAt"] as DuckDBTimestamp),
      createdAt: toMs(note["createdAt"] as DuckDBTimestamp),
    })) as AnnotationNote[];

    return {
      id: (annotation?.["id"] as string) ?? annotationId,
      coordinates: coordinates ?? null,
      metadata: {
        createdBy: annotation?.["created_by"] as string,
        createdAt: toMs(annotation?.["created_at"] as DuckDBTimestamp),
        updatedAt: toMs(annotation?.["updated_at"] as DuckDBTimestamp),
        ...(metadata
          ? { scope: { type: metadata.type, value: safeParse(metadata.value) } }
          : {}),
      },
      body: {
        title: body?.title ?? "",
        description: body?.description ?? "",
        notes,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`getAnnotation: ${message}`);
    throw new Error("Unable to fetch annotations", { cause: error });
  }
};

const updateAnnotation = async (
  connection: DuckDBConnection,
  annotationId: string,
  updatedAnnotation: UpdatePayload,
): Promise<Partial<Annotation> & { id: string }> => {
  logger.debug(`Updating annotation ${annotationId}`);
  try {
    const { body, coordinates, metadata } = updatedAnnotation;
    const updatedAt = new Date().toISOString();

    const annotationResult = await connection.runAndReadAll(
      `SELECT * FROM annotations WHERE id = ?`,
      [annotationId],
    );
    const annotation = annotationResult.getRowObjects()[0];

    if (!annotation) {
      logger.warn(`updateAnnotation: annotation ${annotationId} not found`);
    }

    await connection.run(`UPDATE annotations SET updated_at = ? WHERE id = ?`, [
      updatedAt,
      annotationId,
    ]);

    if (coordinates) {
      const { xMin, xMax, yMin, yMax } = coordinates;
      await connection.run(
        `UPDATE annotations_coordinates SET xMin = ?, xMax = ?, yMin = ?, yMax = ? WHERE annotation_id = ?`,
        [xMin, xMax, yMin, yMax, annotationId],
      );
    }

    if (metadata?.scope) {
      await connection.run(
        `UPDATE annotations_metadata SET scope_type = ?, scope_value = ? WHERE annotation_id = ?`,
        [
          metadata.scope.type,
          JSON.stringify(metadata.scope.value),
          annotationId,
        ],
      );
    }

    if (body) {
      const { title, description, notes } = body;
      await connection.run(
        `UPDATE annotations_body SET title = ?, description = ? WHERE annotation_id = ?`,
        [title, description, annotationId],
      );

      if (notes) {
        const submittedNotes = notes.reduce<string[]>((acc, obj) => {
          acc.push(obj.id);
          return acc;
        }, []);

        const existingResult = await connection.runAndReadAll(
          `SELECT * FROM annotations_notes WHERE annotation_id = ?;`,
          [annotationId],
        );
        const existingNotes = existingResult
          .getRowObjects()
          .reduce<string[]>((acc, obj) => {
            acc.push(obj["note_id"] as string);
            return acc;
          }, []);

        const toUpdate = submittedNotes.filter((value) =>
          existingNotes.includes(value),
        );
        const toCreate = notes.filter((value) => !value.id);
        const toDelete = existingNotes.filter(
          (value) => !submittedNotes.includes(value),
        );

        for (const note of notes.filter((n) => toUpdate.includes(n.id))) {
          await connection.run(
            `UPDATE annotations_notes SET title = ?, description = ?, updated_at = ?, last_updated = ? WHERE note_id = ?`,
            [
              note.title,
              note.description,
              new Date(note.updatedAt).toISOString(),
              new Date(note.lastUpdated).toISOString(),
              note.id,
            ],
          );
        }
        for (const noteId of toDelete) {
          await connection.run(
            `DELETE FROM annotations_notes WHERE note_id = ?`,
            [noteId],
          );
        }
        for (const note of toCreate) {
          await connection.run(
            `INSERT INTO annotations_notes (note_id, annotation_id, title, description, created_at, updated_at, created_by, last_updated)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              crypto.randomUUID(),
              annotationId,
              note.title,
              note.description,
              new Date().toISOString(),
              new Date().toISOString(),
              note.createdBy,
              new Date().toISOString(),
            ],
          );
        }
      }
    }
    logger.debug(`Annotation ${annotationId} successfully updated`);

    return {
      id: annotationId,
      metadata: {
        ...(updatedAnnotation.metadata as AnnotationMetadata),
        updatedAt: Date.parse(updatedAt),
      },
      ...(updatedAnnotation.coordinates !== undefined
        ? { coordinates: updatedAnnotation.coordinates }
        : {}),
      ...(updatedAnnotation.body !== undefined
        ? { body: updatedAnnotation.body }
        : {}),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`updateAnnotation: ${message}`);
    throw new Error("Error occurred while updating annotation", {
      cause: error,
    });
  }
};

const deleteAnnotation = async (
  connection: DuckDBConnection,
  annotationId: string,
): Promise<void> => {
  logger.debug(`Deleting annotation ${annotationId}`);
  try {
    const annotationResult = await connection.runAndReadAll(
      `SELECT * FROM annotations WHERE id = ?`,
      [annotationId],
    );
    const annotation = annotationResult.getRowObjects()[0];

    if (!annotation) {
      logger.debug(`No annotation with id ${annotationId} found`);
      return;
    }

    const deletedAt = new Date().toISOString();
    await connection.run(`UPDATE annotations SET deleted_at = ? WHERE id = ?`, [
      deletedAt,
      annotationId,
    ]);
    logger.debug(
      `Annotation ${annotationId} successfully marked as deleted at ${deletedAt}`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`deleteAnnotation: ${message}`);
    throw new Error("Error occurred while marking annotation as deleted", {
      cause: error,
    });
  }
};

export async function getCharts(
  connection: DuckDBConnection,
): Promise<Chart[]> {
  const results = await connection.runAndReadAll("SELECT * FROM charts");
  return results.getRowObjects() as unknown as Chart[];
}

export {
  createAnnotation,
  updateAnnotation,
  getAnnotationsByVizName,
  deleteAnnotation,
  getPaginatedAnnotations,
  getAnnotation,
};
