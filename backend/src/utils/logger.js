import winston from "winston";
import * as fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const logDirectory = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const getDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  return `${day}-${month}-${year}`;
};

const logLevel = process.env.NODE_ENV === "production" ? "info" : "debug";

// In-memory log buffer
const MAX_BUFFER = 500;
const logBuffer = [];
let bufferOffset = 0;

class MemoryTransport extends winston.Transport {
  log(info, callback) {
    if (info.skipBuffer) {
      callback();
      return;
    }
    logBuffer.push({
      timestamp: info.timestamp ?? new Date().toISOString(),
      level: info.level,
      message: String(info.message),
    });
    if (logBuffer.length > MAX_BUFFER) {
      logBuffer.shift();
      bufferOffset++;
    }
    callback();
  }
}

export function getLogBuffer() {
  return logBuffer;
}
export function getBufferOffset() {
  return bufferOffset;
}
export function clearLogBuffer() {
  logBuffer.splice(0);
  bufferOffset = 0;
}

const loggerOptions = {
  level: logLevel,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, `app-${getDateString()}.log`),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`;
        }),
      ),
    }),
    new MemoryTransport({
      format: winston.format.timestamp(),
    }),
  ],
};

const logger = winston.createLogger(loggerOptions);

export default logger;
