import createError from "http-errors"
import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

import dbInstance from "./config/dbConnection.js";
import logger from "./utils/logger.js"
import indexRouter from "./routes/annotationRoutes.js"
import initAnnotationTables from "./config/initAnnotationTables.js";
import "./config/dbConnection.js"
import "./controllers/annotationsController.js"

const app = express();

app.use((req, res, next) => {
  logger.http(`Request: ${req.method} ${req.url}`);
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors())

// app.use(express.static(path.join(__dirname, 'public')));

await initAnnotationTables(dbInstance)

app.use('/', indexRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

export default app;
