import createError from "http-errors";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

import dbInstance from "./config/duckdbConnection.js";
import { initDb } from "./config/postgresDbConnection.js";
import logger from "./utils/logger.js";
import annotationsRoutes from "./routes/annotationRoutes.js";
import strategusRoutes from "./routes/strategusRoutes.js";
import initAnnotationTables from "./config/initAnnotationTables.js";
import "./config/duckdbConnection.js";
import "./controllers/annotationsController.js";

dotenv.config();

const app = express();

app.use((req, res, next) => {
  const isDebugRoute = req.url.startsWith("/api/debug/");
  logger.http(`Request: ${req.method} ${req.url}`, {
    skipBuffer: isDebugRoute,
  });
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors());

// app.use(express.static(path.join(__dirname, 'public')));

await initAnnotationTables(dbInstance);

initDb({
  host: process.env.POSTGRES_HOST || "127.0.0.1",
  port: parseInt(process.env.PGPORT ?? "5432", 10),
  database: process.env.DATABASE_NAME || "postgres",
  user: process.env.DATABASE_USERNAME || "postgres",
  password: process.env.DATABASE_PASSWORD || null,
});

app.use(annotationsRoutes);
app.use(strategusRoutes);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
});

export default app;
