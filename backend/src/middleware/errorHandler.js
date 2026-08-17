import { v4 as uuidv4 } from "uuid"
import { Prisma } from "@prisma/client"
import logger from "../services/logger.js"

const ERROR_CODES = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "VALIDATION_ERROR",
  429: "TOO_MANY_REQUESTS",
  500: "INTERNAL_ERROR",
}

function getErrorCode(status) {
  return ERROR_CODES[status] || "UNKNOWN_ERROR"
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// P12.2-B: server-authoritative correlation middleware (§ P12-02-05 §3).
// - requestId: server-generated full UUID per HTTP request.
// - correlationId: client X-Correlation-ID is accepted ONLY if it is a valid UUID,
//   otherwise a fresh full UUID is generated (a client cannot forge/truncate the
//   trace chain). Propagates: request -> service -> outbox -> consumer -> webhook -> audit.
// - causationId: client X-Causation-ID (validated UUID) pass-through for event
//   parent->child linkage; server-set by consumers when emitting child events.
export function correlationMiddleware(req, res, next) {
  req.requestId = uuidv4()
  const clientCorrelation = req.headers["x-correlation-id"]
  req.correlationId = (typeof clientCorrelation === "string" && UUID_RE.test(clientCorrelation.trim())) ? clientCorrelation.trim() : uuidv4()
  const clientCausation = req.headers["x-causation-id"]
  if (typeof clientCausation === "string" && UUID_RE.test(clientCausation.trim())) req.causationId = clientCausation.trim()
  res.setHeader("X-Correlation-ID", req.correlationId)
  res.setHeader("X-Request-ID", req.requestId)
  if (req.causationId) res.setHeader("X-Causation-ID", req.causationId)
  next()
}

export function errorHandler(err, req, res, next) {
  const correlationId = req?.correlationId || "unknown"

  // Zod validation errors → 400
  if (err?.name === "ZodError" || err?.issues) {
    const body = { error: "Validation failed", details: err.issues || err.errors, code: "VALIDATION_ERROR", correlationId }
    console.warn(`[WARN ${correlationId}] 400 Validation: ${err.message}`)
    return res.status(400).json(body)
  }

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let status = 500, message = "Database error", code = "DB_ERROR"
    if (err.code === "P2002") { status = 409; message = "Unique constraint violation"; code = "CONFLICT" }
    else if (err.code === "P2025") { status = 404; message = "Record not found"; code = "NOT_FOUND" }
    else if (err.code === "P2003") { status = 400; message = "Foreign key constraint failed"; code = "BAD_REQUEST" }
    else if (err.code === "P2014") { status = 400; message = "Relation violation"; code = "BAD_REQUEST" }
    const body = { error: message, code, correlationId, prismaCode: err.code }
    if (status >= 500) console.error(`[ERROR ${correlationId}] Prisma ${err.code}: ${err.message}`)
    else console.warn(`[WARN ${correlationId}] Prisma ${err.code}: ${message}`)
    return res.status(status).json(body)
  }

  // JWT errors → 401
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError" || err.name === "NotBeforeError") {
    const body = { error: "Authentication failed", code: "UNAUTHORIZED", correlationId }
    console.warn(`[WARN ${correlationId}] Auth: ${err.message}`)
    return res.status(401).json(body)
  }

  const status = err.status || err.statusCode || 500
  const code = getErrorCode(status)
  const message = err.message || "Internal server error"

  const body = { error: message, code, correlationId, requestId: req?.requestId }
  if (err.details) body.details = err.details
  if (err.errors) body.errors = err.errors
  if (status >= 500) body.retryable = true

  if (status >= 500) {
    logger.error({ err, correlationId, status }, `Error ${correlationId}: ${err.message}`)
  } else if (status >= 400) {
    logger.warn({ correlationId, status, message }, `Warn ${correlationId}: ${status} ${message}`)
  }

  res.status(status).json(body)
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    code: "NOT_FOUND",
    correlationId: req?.correlationId || "unknown",
  })
}
