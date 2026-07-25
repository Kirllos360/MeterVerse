// Structured Logger (Pino) — Production-grade logging (FIX 6)
import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  transport: isProduction
    ? { target: "pino/file", options: { destination: process.env.LOG_FILE || "./logs/app.log", mkdir: true } }
    : { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } },
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "body.password", "body.token", "body.secret"],
    censor: "[REDACTED]",
  },
  serializers: {
    req: (req) => ({ method: req.method, url: req.url, correlationId: req.correlationId }),
    err: (err) => ({ message: err.message, stack: isProduction ? undefined : err.stack }),
  },
});

export default logger;
