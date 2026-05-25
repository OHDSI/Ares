#!/usr/bin/env node
import dotenv from "dotenv";
import app from "./src/app.js";
import logger from "./src/utils/logger.js";
import debug from "debug";
import http from "http";

dotenv.config();

const port = normalizePort(process.env.PORT || "3000");
const hostName = process.env.HOSTNAME || "localhost";

app.set("port", port);

const server = http.createServer(app);

server.listen(port as number, hostName, () => {
  logger.info(
    `Server running on ${hostName}:${port}, mode: ${process.env.NODE_ENV}`,
  );
});
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val: string): number | string | false {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening(): void {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr?.port;
  debug("Listening on " + bind);
}

const shutdownHandler = (reason: string): void => {
  logger.info(
    `${reason === "SIGINT" ? "Manual shutdown" : "Forced shutdown"} initiated`,
  );
  logger.info(`Server is shutting down...`);
  server.close(() => {
    logger.info("Server stopped.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdownHandler);
process.on("SIGTERM", shutdownHandler);
