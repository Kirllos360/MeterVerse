import { v4 as uuidv4 } from "uuid"

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

export function correlationMiddleware(req, res, next) {
  req.correlationId = req.headers["x-correlation-id"] || uuidv4().slice(0, 8)
  res.setHeader("X-Correlation-ID", req.correlationId)
  next()
}

export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500
  const correlationId = req?.correlationId || "unknown"
  const code = getErrorCode(status)
  const message = err.message || "Internal server error"

  const body = { error: message, code, correlationId }
  if (err.details) body.details = err.details
  if (err.errors) body.errors = err.errors
  if (status >= 500) body.retryable = true

  if (status >= 500) console.error(`[ERROR ${correlationId}] ${err.stack || err.message}`)
  else if (status >= 400) console.warn(`[WARN ${correlationId}] ${status} ${message}`)

  res.status(status).json(body)
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    code: "NOT_FOUND",
    correlationId: req?.correlationId || "unknown",
  })
}
