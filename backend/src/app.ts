import createError from "http-errors";
import express, { Request, Response, NextFunction } from "express";
import { err } from "#shared/response.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import dbInstance from "./config/duckdbConnection.js";
import { initDb as initPostgres } from "./config/postgresDbConnection.js";
import { initDb as initDatabricks } from "./config/databricksConnection.js";
import logger from "./utils/logger.js";
import annotationsRoutes from "#routes/annotationRoutes.js";
import chartRoutes from "#routes/chartRoutes.js";
import characterizationRoutes from "#routes/characterization.js";
import cohortRoutes from "#routes/cohorts.js";
import dataSourceRoutes from "#routes/dataSources.js";
import debugRoutes from "#routes/debug.js";
import initAnnotationTables from "./config/initAnnotationTables.js";
import { validateEnv } from "./utils/validateEnv.js";

validateEnv();

const app = express();

app.use((req: Request, _res: Response, next: NextFunction) => {
  const isDebugRoute = req.url.startsWith("/api/debug/");
  logger.http(`Request: ${req.method} ${req.url}`, {
    skipBuffer: isDebugRoute,
  });
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
const corsOrigin =
  process.env["ALLOWED_ORIGINS"]?.split(",") ??
  (process.env["NODE_ENV"] === "dev" ||
  process.env["NODE_ENV"] === "development"
    ? true
    : false);
app.use(cors({ origin: corsOrigin }));

try {
  await initAnnotationTables(dbInstance);
} catch (err) {
  logger.error(
    `Failed to initialize annotation tables: ${err instanceof Error ? err.message : String(err)}`,
  );
  process.exit(1);
}

try {
  if (process.env["DB_PROVIDER"] === "databricks") {
    initDatabricks({
      host: process.env["DATABRICKS_HOST"]!,
      httpPath: process.env["DATABRICKS_HTTP_PATH"]!,
      token: process.env["DATABRICKS_TOKEN"]!,
      ...(process.env["DATABRICKS_CATALOG"]
        ? { catalog: process.env["DATABRICKS_CATALOG"] }
        : {}),
    });
  } else {
    initPostgres({
      host: process.env["POSTGRES_HOST"] ?? "127.0.0.1",
      port: parseInt(process.env["PGPORT"] ?? "5432", 10),
      database: process.env["DATABASE_NAME"] ?? "postgres",
      user: process.env["DATABASE_USERNAME"] ?? "postgres",
      ...(process.env["DATABASE_PASSWORD"]
        ? { password: process.env["DATABASE_PASSWORD"] }
        : {}),
    });
  }
} catch (err) {
  logger.error(
    `Failed to initialize database: ${err instanceof Error ? err.message : String(err)}`,
  );
  process.exit(1);
}

app.use(annotationsRoutes);
app.use(chartRoutes);
app.use(characterizationRoutes);
app.use(cohortRoutes);
app.use(dataSourceRoutes);
app.use(debugRoutes);

app.use(function (_req: Request, _res: Response, next: NextFunction) {
  next(createError(404));
});

app.use(function (
  e: { status?: number; message?: string },
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = e.status ?? 500;
  res.status(status).json(err(e.message ?? "Internal Server Error"));
});

export default app;
