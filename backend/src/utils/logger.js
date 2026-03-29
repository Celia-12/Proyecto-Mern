const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let log = `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
  if (Object.keys(meta).length) {
    log += ` | META: ${JSON.stringify(meta)}`;
  }
  return log;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "warn" : "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    // Console transport (with color in dev)
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        logFormat
      ),
    }),
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
    }),
    // Combined log file (all levels)
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
    }),
    // Critical transactions log
    new winston.transports.File({
      filename: path.join(logsDir, "transactions.log"),
      level: "info",
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "exceptions.log"),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "rejections.log"),
    }),
  ],
});

module.exports = logger;
