import fs from "node:fs";
import path from "node:path";
import winston from "winston";

const logDir = path.resolve("logs");
fs.mkdirSync(logDir, { recursive: true });

const loggers = new Map();

export function getLogger(name) {
  if (!name || typeof name !== "string") {
    throw new Error("Logger name must be a non-empty string");
  }

  if (loggers.has(name)) {
    return loggers.get(name);
  }

  const instance = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.printf(({ message }) => `${message}`),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),
      new winston.transports.File({
        filename: path.join(logDir, `${name}.log`),
        options: { flags: "w" },
      }),
    ],
  });

  loggers.set(name, instance);
  return instance;
}
