import logger from "../utils/logger.js";

const initAnnotationTables = async (instance) => {
    const connection = await instance.connect();
    const checkTableExists = async (tableName) => {
        const result = await connection.runAndReadAll(`
            SELECT COUNT(*) AS count
            FROM information_schema.tables
            WHERE table_name = '${tableName}';
        `);
        const rows = result.getRowObjects();

        return rows[0].count;
    };


    const tablesExist = await checkTableExists('charts');

    if (!tablesExist) {
        logger.info('Running for the first time. Initiating db.')
        await connection.run(`
            CREATE TABLE IF NOT EXISTS charts (
                id TEXT PRIMARY KEY,
                viz_name TEXT
            );
        `);

        await connection.run(`
            CREATE TABLE IF NOT EXISTS annotations (
                id TEXT PRIMARY KEY,
                viz_id TEXT REFERENCES charts(id),
                created_by TEXT,
                created_at TIMESTAMP,
                updated_at TIMESTAMP
            );
        `);

        await connection.run(`
            CREATE TABLE IF NOT EXISTS annotations_coordinates (
                annotation_id TEXT REFERENCES annotations(id),
                x1_axis DOUBLE PRECISION,
                x2_axis DOUBLE PRECISION,
                y1_axis DOUBLE PRECISION,
                y2_axis DOUBLE PRECISION,
                width DOUBLE PRECISION,
                height DOUBLE PRECISION
            );
        `);

        await connection.run(`
            CREATE TABLE IF NOT EXISTS annotations_metadata (
                annotation_id TEXT REFERENCES annotations(id),
                scope_type TEXT,
                scope_value JSON
            );
        `);

        await connection.run(`
            CREATE TABLE IF NOT EXISTS annotations_body (
                annotation_id TEXT REFERENCES annotations(id),
                title TEXT,
                description TEXT
            );
        `);

        await connection.run(`
            CREATE TABLE IF NOT EXISTS annotations_notes (
                note_id TEXT PRIMARY KEY,
                annotation_id TEXT REFERENCES annotations(id),
                title TEXT,
                description TEXT,
                created_at TIMESTAMP,
                updated_at TIMESTAMP,
                created_by TEXT,
                last_updated TIMESTAMP
            );
        `);
    }

    connection.close();
};

export default initAnnotationTables;