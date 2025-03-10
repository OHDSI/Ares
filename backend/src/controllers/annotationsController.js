import { v4 as uuidv4 } from 'uuid';
import logger from "../utils/logger.js";

const createAnnotation = async (connection, chart_id, chart_name, report_name, domain_name, concept_id, annotationData) => {
    logger.debug(`User ${annotationData.metadata.createdBy} submitted a new annotation`);
    try {
        let chart = await connection.runAndReadAll(
            `SELECT * FROM charts WHERE chart_id = ?`,
            [chart_id]
        );

        chart = chart.getRowObjects()?.[0];


        if (!chart) {
            logger.debug(`Chart ${chart_id} not found. Creating new entry.`);

            const chartId = uuidv4();

            await connection.run(
                `INSERT INTO charts (id, chart_id, chart_name, report_name, domain_name, concept_id) VALUES (?, ?, ?, ?, ?, ?)`,
                [chartId, chart_id, chart_name, report_name, domain_name || 'NULL', concept_id || 'NULL']
            );
            chart = { id: chartId, chart_id, chart_name, report_name, domain_name };

            logger.debug(`Chart created: ${chartId}`);
        }

        const annotationId = uuidv4();

        await connection.run(
            `INSERT INTO annotations (id, viz_id, created_by, created_at, updated_at, deleted_at) 
        VALUES (?, ?, ?, ?, ?, NULL)`,
            [
                annotationId,
                chart.id,
                annotationData.metadata.createdBy || "unknown",
                new Date().toISOString(),
                new Date().toISOString(),
            ]
        );


        if (annotationData.coordinates) {
            logger.debug(`Inserting coordinates for annotation: ${annotationId}`);
            await connection.run(
                `INSERT INTO annotations_coordinates (annotation_id, x1_axis, x2_axis, y1_axis, y2_axis, width, height) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    annotationId,
                    annotationData.coordinates.x1Axis,
                    annotationData.coordinates.x2Axis,
                    annotationData.coordinates.y1Axis,
                    annotationData.coordinates.y2Axis,
                    annotationData.coordinates.width,
                    annotationData.coordinates.height,
                ]
            );
        }


        if (annotationData.metadata.scope) {
            logger.debug(`Inserting scope for annotation: ${annotationId}`);
            await connection.run(
                `INSERT INTO annotations_metadata (annotation_id, scope_type, scope_value) 
            VALUES (?, ?, ?)`,
                [
                    annotationId,
                    annotationData.metadata.scope.type,
                    JSON.stringify(annotationData.metadata.scope.value),
                ]
            );
        }

        if (annotationData.body) {
            logger.debug(`Inserting body for annotation: ${annotationId}`);
            await connection.run(
                `INSERT INTO annotations_body (annotation_id, title, description) 
            VALUES (?, ?, ?)`,
                [
                    annotationId,
                    annotationData.body.title,
                    annotationData.body.description,
                ]
            );
        }

        if (annotationData.body.notes && annotationData.body.notes.length > 0) {
            logger.debug(`Inserting notes for annotation: ${annotationId}`);
            for (const note of annotationData.body.notes) {
                await connection.run(
                    `INSERT INTO annotations_notes (note_id, annotation_id, title, description, created_at, updated_at, created_by, last_updated) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        uuidv4(),
                        annotationId,
                        note.title,
                        note.description,
                        note.createdAt ? new Date(note.createdAt).toISOString() : new Date().toISOString(),
                        note.updatedAt ?  new Date(note.updatedAt).toISOString() : new Date().toISOString(),
                        note.createdBy || "unknown",
                        note.lastUpdated ? new Date(note.lastUpdated).toISOString() : new Date().toISOString(),
                    ]
                );
            }
        }

        logger.debug(`Annotation ${annotationId} successfully created`);

        return {
            id: annotationId,
            metadata: annotationData.metadata,
            coordinates: annotationData.coordinates,
            body: annotationData.body,
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${message}`);
        return new Error('Error occurred while creating annotation');

    }
};

const getAnnotationsByVizName = async (connection, chart_ids) => {
    logger.debug(`Getting annotations by chart name: ${chart_ids}`);
    try {
        const placeholders = chart_ids.map(() => '?').join(',');
        const query = `
            SELECT 
                a.id AS annotation_id, a.viz_id, a.created_by, a.created_at, a.updated_at,
                ac.x1_axis AS x1Axis, ac.x2_axis AS x2Axis, ac.y1_axis AS y1Axis, ac.y2_axis AS y2Axis, ac.width, ac.height,
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

        let rows = await connection.runAndReadAll(query, chart_ids);

        rows = rows.getRowObjects()

        if (rows.length === 0) return {};

        const result = {};

        rows.forEach(row => {
            if (!result[row.chart_id]) result[row.chart_id] = {};

            if (!result[row.chart_id][row.annotation_id]) {
                result[row.chart_id][row.annotation_id] = {
                    id: row.annotation_id,
                    coordinates: row.x1Axis !== null ? {
                        x1Axis: row.x1Axis, x2Axis: row.x2Axis,
                        y1Axis: row.y1Axis, y2Axis: row.y2Axis,
                        width: row.width, height: row.height
                    } : null,
                    metadata: {
                        createdBy: row.created_by,
                        createdAt: Number(row.created_at.micros) / 1000,
                        updatedAt: Number(row.updated_at.micros) / 1000,
                        scope: row.scopeType ? {
                            type: row.scopeType,
                            value: row.scopeValue ? JSON.parse(row.scopeValue) : null
                        } : null,
                    },
                    body: {
                        title: row.bodyTitle || '',
                        description: row.bodyDescription || '',
                        notes: []
                    }
                };
            }

            if (row.noteId) {
                result[row.chart_id][row.annotation_id].body.notes.push({
                    id: row.noteId,
                    title: row.noteTitle,
                    description: row.noteDescription,
                    createdAt: Number(row.noteCreatedAt.micros) / 1000,
                    updatedAt: Number(row.noteUpdatedAt.micros) / 1000,
                    createdBy: row.noteCreatedBy,
                    lastUpdated: Number(row.noteLastUpdated.micros) / 1000
                });
            }
        });

        Object.keys(result).forEach(vizName => {
            result[vizName] = Object.values(result[vizName]);
        });

        return result;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${message}`);
        throw new Error('Unable to fetch annotations');
    }
};

const getPaginatedAnnotations = async (connection, first, step, filter) => {
    try {
        let filterClause = '';
        let filterParams = [];
        if (filter && filter.trim() !== '') {
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
        const countResult = await connection.runAndReadAll(countQuery, filterParams);
        const countRows = countResult.getRowObjects();
        const totalCount = Number(countRows[0].count);
        const totalPages = Math.ceil(totalCount / step);
        const offset = first;

        const dataQuery = `
      SELECT 
        a.id AS annotation_id,
        a.viz_id,
        a.created_by,
        a.created_at,
        a.updated_at,
        ac.x1_axis AS x1Axis,
        ac.x2_axis AS x2Axis,
        ac.y1_axis AS y1Axis,
        ac.y2_axis AS y2Axis,
        ac.width,
        ac.height,
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
        const rows = dataResult.getRowObjects();

        if (rows.length === 0) {
            return { annotations: [], totalPages, currentPage: Math.floor(first / step) + 1, totalCount };
        }

        const annotationsMap = {};

        rows.forEach(row => {
            if (!annotationsMap[row.annotation_id]) {
                annotationsMap[row.annotation_id] = {
                    id: row.annotation_id,
                    vizId: row.viz_id,
                    viz_name: row.chart_name,
                    viz_id: row.chart_id,
                    report_name: row.report_name,
                    domain_name: row.domain_name,
                    concept_id: row.concept_id,
                    createdBy: row.created_by,
                    createdAt: Number(row.created_at.micros) / 1000,
                    updatedAt: Number(row.updated_at.micros) / 1000,
                    coordinates: row.x1Axis !== null ? {
                        x1Axis: row.x1Axis,
                        x2Axis: row.x2Axis,
                        y1Axis: row.y1Axis,
                        y2Axis: row.y2Axis,
                        width: row.width,
                        height: row.height
                    } : null,
                    metadata: row.scopeType ? {
                        type: row.scopeType,
                        value: row.scopeValue ? JSON.parse(row.scopeValue) : null
                    } : null,
                    body: {
                        title: row.bodyTitle || '',
                        description: row.bodyDescription || '',
                        notes: []
                    }
                };
            }
            if (row.noteId) {
                annotationsMap[row.annotation_id].body.notes.push({
                    id: row.noteId,
                    title: row.noteTitle,
                    description: row.noteDescription,
                    createdAt: Number(row.noteCreatedAt.micros) / 1000,
                    updatedAt: Number(row.noteUpdatedAt.micros) / 1000,
                    createdBy: row.noteCreatedBy,
                    lastUpdated: Number(row.noteLastUpdated.micros) / 1000
                });
            }
        });

        const annotations = Object.values(annotationsMap);

        return {
            annotations,
            totalPages,
            currentPage: Math.floor(first / step) + 1,
            totalCount
        };
    } catch (error) {
        logger.error(error instanceof Error ? error.message : String(error));
        throw new Error('Unable to fetch paginated annotations');
    }
};


const getAnnotation = async (connection, annotationId) => {
    logger.debug(`Getting annotation ${annotationId}`)
    try {
        let annotation = await connection.runAndReadAll(
            `SELECT * FROM annotations WHERE id = ?`,
            [annotationId]
        );
        annotation = annotation.getRowObjects()?.[0];


        if (!annotation) {
            logger.error(`Annotation with id ${annotationId} not found`);
        }

        let coordinates = await connection.runAndReadAll(
            `SELECT x1_axis AS x1Axis, x2_axis AS x2Axis, y1_axis AS y1Axis, y2_axis AS y2Axis, width, height
         FROM annotations_coordinates WHERE annotation_id = ?`,
            [annotationId]
        );

        coordinates = coordinates.getRowObjects()?.[0];


        let metadata = await connection.runAndReadAll(
            `SELECT scope_type AS type, scope_value AS value
         FROM annotations_metadata WHERE annotation_id = ?`,
            [annotationId]
        );

        metadata = metadata.getRowObjects()?.[0];


        let body = await connection.runAndReadAll(
            `SELECT title, description
         FROM annotations_body WHERE annotation_id = ?`,
            [annotationId]
        );

        body = body.getRowObjects()?.[0];


        let notes = await connection.runAndReadAll(
            `SELECT note_id AS id, title, description, created_at AS createdAt, updated_at AS updatedAt,
                created_by AS createdBy, last_updated AS lastUpdated
         FROM annotations_notes WHERE annotation_id = ?`,
            [annotationId]
        );

        notes = notes.getRowObjects();

        notes = notes.map(note => ({...note, lastUpdated: Number(note.lastUpdated.micros) /1000, updatedAt: Number(note.updatedAt.micros) /1000,  createdAt: Number(note.createdAt.micros) / 1000}));

        return {
            id: annotation.id,
            coordinates,
            metadata: {
                createdBy: annotation.created_by,
                createdAt: Number(annotation.created_at.micros) / 1000,
                updatedAt: Number(annotation.updated_at.micros) / 1000,
                scope: {
                    type: metadata.type,
                    value: JSON.parse(metadata.value),
                },
            },
            body: {
                title: body.title,
                description: body.description,
                notes,
            },
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${message}`);
        throw new Error('Unable to fetch annotations');

    }
};


const updateAnnotation = async (connection, annotationId, updatedAnnotation) => {
    logger.debug(`Updating annotation ${annotationId}`)
    try {
        const { body, coordinates, metadata } = updatedAnnotation;
        const updatedAt = new Date().toISOString();

        let annotation = await connection.runAndReadAll(
            `SELECT * FROM annotations WHERE id = ?`,
            [annotationId]
        );

        annotation = annotation.getRowObjects()[0];

        if (!annotation) {
            logger.error(`Annotation with id ${annotationId} not found`);
        }

        await connection.run(
            `UPDATE annotations SET updated_at = ? WHERE id = ?`,
            [updatedAt, annotationId]
        );


        if (coordinates) {
            logger.debug(`Updating coordinates for annotation ${annotationId}`)
            const { x1Axis, x2Axis, y1Axis, y2Axis, width, height } = coordinates;
            await connection.run(
                `UPDATE annotations_coordinates
             SET x1_axis = ?, x2_axis = ?, y1_axis = ?, y2_axis = ?, width = ?, height = ?
             WHERE annotation_id = ?`,
                [x1Axis, x2Axis, y1Axis, y2Axis, width, height, annotationId]
            );
        }


        if (metadata) {
            logger.debug(`Updating metadata for annotation ${annotationId}`)
            const { scope } = metadata;
            await connection.run(
                `UPDATE annotations_metadata
             SET scope_type = ?, scope_value = ?
             WHERE annotation_id = ?`,
                [scope.type, JSON.stringify(scope.value), annotationId]
            );
        }


        if (body) {
            logger.debug(`Updating body for annotation ${annotationId}`)
            const { title, description, notes } = body;
            await connection.run(
                `UPDATE annotations_body SET title = ?, description = ? WHERE annotation_id = ?`,
                [title, description, annotationId]
            );

            if (notes) {
                const submittedNotes = notes.reduce((acc, obj) => {
                    acc.push(obj.id);
                    return acc;
                }, []);

                let existingNotes = await connection.runAndReadAll(`SELECT * FROM annotations_notes WHERE annotation_id = ?;`, [annotationId]);
                existingNotes = existingNotes.getRowObjects();
                existingNotes = existingNotes.reduce((acc, obj) => {
                    acc.push(obj.note_id);
                    return acc;
                }, []);

                const toUpdate = submittedNotes.filter(value => existingNotes.includes(value));
                const toCreate = notes.filter(value => !value.id);
                const toDelete = existingNotes.filter(value => !submittedNotes.includes(value));

                logger.debug(`Updating notes for annotation ${annotationId}: ${toUpdate}`);
                for (const note of notes.filter(n => toUpdate.includes(n.id))) {
                    await connection.run(
                        `UPDATE annotations_notes
             SET title = ?, description = ?, updated_at = ?, last_updated = ?
             WHERE note_id = ?`,
                        [note.title, note.description, new Date(note.updatedAt).toISOString(), new Date(note.lastUpdated).toISOString(), note.id]
                    );
                }
                logger.debug(`Deleting notes for annotation ${annotationId}: ${toDelete}`);
                for (const noteId of toDelete) {
                    await connection.run(
                        `DELETE FROM annotations_notes WHERE note_id = ?`,
                        [noteId]
                    );
                }
                logger.debug(`Creating notes for annotation ${annotationId}`)
                for (const note of toCreate) {
                    await connection.run(
                        `INSERT INTO annotations_notes (note_id, annotation_id, title, description, created_at, updated_at, created_by, last_updated)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [uuidv4(), annotationId, note.title, note.description, new Date().toISOString(), new Date().toISOString(), note.createdBy, new Date().toISOString()]
                    );
                }
            }
        }
        logger.debug(`Annotation ${annotationId} successfully updated`)

        // return await getAnnotation(connection, annotationId);


        return {
            id: annotationId,
            metadata: {...updatedAnnotation.metadata, updatedAt},
            coordinates: updatedAnnotation.coordinates,
            body: updatedAnnotation.body,
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`${message}`);
        throw new Error('Error occurred while updating annotation');

    }
};

const deleteAnnotation = async (connection, annotationId) => {
    logger.debug(`Deleting annotation ${annotationId}`);
    try {
        let annotation = await connection.runAndReadAll(
            `SELECT * FROM annotations WHERE id = ?`,
            [annotationId]
        );
        annotation = annotation.getRowObjects()[0];

        if (!annotation) {
            logger.debug(`No annotation with id ${annotationId} found`);
            return;
        }

        const deletedAt = new Date().toISOString();
        await connection.run(
            `UPDATE annotations SET deleted_at = ? WHERE id = ?`,
            [deletedAt, annotationId]
        );
        logger.debug(`Annotation ${annotationId} successfully marked as deleted at ${deletedAt}`);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(message);
        throw new Error('Error occurred while marking annotation as deleted');
    }
};


// const deleteAnnotation = async (connection, annotationId) => {
//     logger.debug(`Deleting annotation ${annotationId}`);
//     try {
//         let annotation = await connection.runAndReadAll(
//             `SELECT * FROM annotations WHERE id = ?`,
//             [annotationId]
//         );
//
//         annotation = annotation.getRowObjects()[0];
//         if(!annotation) {
//             logger.debug(`No annotation with id ${annotationId} found`);
//         }
//         await connection.run(
//             `DELETE FROM annotations_notes WHERE annotation_id = ?`,
//             [annotationId]
//         );
//         await connection.run(
//             `DELETE FROM annotations_body WHERE annotation_id = ?`,
//             [annotationId]
//         );
//         await connection.run(
//             `DELETE FROM annotations_metadata WHERE annotation_id = ?`,
//             [annotationId]
//         );
//         await connection.run(
//             `DELETE FROM annotations_coordinates WHERE annotation_id = ?`,
//             [annotationId]
//         );
//         await connection.run(
//             `DELETE FROM annotations WHERE id = ?`,
//             [annotationId]
//         );
//         logger.debug(`Annotation ${annotationId} successfully deleted`);
//
//     }
//     catch (error) {
//         const message = error instanceof Error ? error.message : String(error);
//         logger.error(`${message}`);
//         throw new Error('Error occurred while deleting annotation');
//     }
// };


export {createAnnotation, updateAnnotation, getAnnotationsByVizName, deleteAnnotation, getPaginatedAnnotations}