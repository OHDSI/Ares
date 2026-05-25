import { DuckDBInstance } from "@duckdb/node-api";
import { join } from "node:path";
import dotenv from "dotenv";

dotenv.config();

const dbPath =
  process.env["DATABASE_PATH"] ?? join(process.cwd(), "annotations.duckdb");

const dbInstance: DuckDBInstance = await DuckDBInstance.create(dbPath);

export default dbInstance;
