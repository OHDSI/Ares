import { DuckDBInstance } from '@duckdb/node-api';
import dotenv from 'dotenv';

dotenv.config();

const dbInstance = await DuckDBInstance.create(process.env.DATABASE_PATH);

export default dbInstance;