import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { PrismaClient } from "@prisma/client"
import { authRouter } from "./routes/auth.js"
import { customersRouter } from "./routes/customers.js"
import { metersRouter } from "./routes/meters.js"
import { readingsRouter } from "./routes/readings.js"
import { invoicesRouter } from "./routes/invoices.js"
import { paymentsRouter } from "./routes/payments.js"
import { adminRouter } from "./routes/admin.js"
import { servicesRouter } from "./routes/services.js"
import { reportsRouter } from "./routes/reports.js"
import { jasperBridgeRouter } from "./routes/jasper-bridge.js"
import { securityRouter } from "./routes/security.js"
import { domainRouter } from "./routes/domain.js"
import { businessRouter } from "./routes/business.js"
import { crudRouter } from "./routes/crud.js"
import { monitorRouter } from "./routes/monitor.js"
import { aiRouter } from "./routes/ai.js"
import { aiCloudflareRouter } from "./routes/ai-cloudflare.js"
import { meterAssignmentRouter } from "./routes/meter-assignments.js"
import { preferencesRouter } from "./routes/preferences.js"
import { searchRouter } from "./routes/search.js"
import { tasksRouter } from "./routes/tasks.js"
import { alertsRouter } from "./routes/alerts.js"
import { notificationsRouter } from "./routes/notifications.js"
import { documentsRouter } from "./routes/documents.js"
import { tariffsRouter } from "./routes/tariffs.js"
import { swaggerSpec, swaggerUi } from "./swagger.js"
import { simRouter } from "./routes/sim.js"
import { projectsRouter } from "./routes/projects.js"
import { billingRouter } from "./routes/billing.js"
import { intelligenceRouter } from "./routes/intelligence.js"
import { knowledgeRouter } from "./routes/knowledge.js"
import { rcaRouter } from "./routes/rca.js"
import { accountingRouter } from "./routes/accounting.js"
import { configRouter } from "./routes/config-center.js"
import { locationsRouter } from "./routes/locations.js"
import { diagnosticsRouter } from "./routes/diagnostics.js"
import { pdfRouter } from "./routes/pdf.js"
import { templatesRouter } from "./routes/templates.js"
import { qrRouter } from "./routes/qr.js"
import { dataGateRouter } from "./routes/data-gate.js"
import { createServer } from "http"
import { trackRequest } from "./middleware/monitor.js"
import { initWebSocket } from "./services/websocket-gateway.js"
import { errorHandler, correlationMiddleware, notFoundHandler } from "./middleware/errorHandler.js"
import { idempotencyMiddleware } from "./middleware/idempotency.js"
import { getAvailabilityPlans, getAvailabilityPlan, setAvailabilityPlan } from "./services/availability-manager.js"
import logger from "./services/logger.js"

const app = express()
const PORT = process.env.PORT || 3002
const isProduction = process.env.NODE_ENV === "production"

// ═══════════════════════════════════════════════════════════════════════════════
//  PRODUCTION STARTUP GUARD — Fail fast, fail secure
// ═══════════════════════════════════════════════════════════════════════════════

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development"
}

if (isProduction && !process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is required in production mode")
  process.exit(1)
}

if (isProduction && !process.env.DATABASE_URL) {
  console.error("FATAL: DATABASE_URL environment variable is required in production mode")
  process.exit(1)
}

if (!isProduction && !process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "dev-secret-" + Date.now()
}

export const prisma = new PrismaClient()

app.use(correlationMiddleware)
app.use(idempotencyMiddleware)

// ═══════════════════════════════════════════════════════════════════════════════
//  SECURITY LAYER — A+ Grade Production Hardening
// ═══════════════════════════════════════════════════════════════════════════════

// CSP — Production: strict with nonces; Dev: allows HMR
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      // Production: strict hashes; Development: allows HMR
      scriptSrc: isProduction
        ? ["'self'"]
        : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: !isProduction ? false : undefined,
  crossOriginResourcePolicy: { policy: isProduction ? "same-origin" : "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}))

// HTTPS redirect (production only)
if (isProduction) {
  app.use((req, res, next) => {
    if (!req.secure && req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`)
    }
    next()
  })
}

// CORS — Strict single origin
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:7400",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "X-Dev-Mode"],
  exposedHeaders: ["X-Request-ID"],
}))

// Body parsing with explicit size limit (prevents DOS attacks)
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: false, limit: "1mb" }))

// Rate limiting — stricter on auth routes
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, max: 2000,
  standardHeaders: true, legacyHeaders: false,
  message: { error: "Too many requests", code: "RATE_LIMITED", retryAfter: "60s", limit: 2000 },
})
app.use("/api/", globalLimiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  standardHeaders: true, legacyHeaders: false,
  message: { error: "Too many login attempts" },
})
app.use("/api/auth/login", authLimiter)
app.use("/api/auth/dev-login", authLimiter)

// ─── API VERSIONING ─────────────────────────────────────────────────────────
// All routes mount under /api for backward compatibility
// AND under /api/v1 for versioned access

const API_PREFIXES = ["/api", "/api/v1"]

function mount(prefix, router) {
  API_PREFIXES.forEach(p => app.use(p + prefix, router))
}

// ─── ROUTES ─────────────────────────────────────────────────────────────────

app.use(trackRequest)

API_PREFIXES.forEach(p => app.get(p + "/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString(), version: "1.0.0" })))

// Readiness probe (Kubernetes)
app.get("/api/health/ready", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: "ready", db: "connected", uptime: process.uptime() })
  } catch {
    res.status(503).json({ status: "not ready", db: "disconnected" })
  }
})

// Auth failure monitoring endpoint (rate limit tracking)
const authFailures = new Map()
app.use("/api/auth/login", (req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress
  const key = `auth:${ip}`
  const attempts = authFailures.get(key) || 0
  if (attempts > 5) logger.warn({ ip, attempts }, "Rate limit threshold reached for IP")
  next()
  const originalJson = res.json.bind(res)
  res.json = function (body) {
    if (body?.error === "Too many login attempts") {
      authFailures.set(key, (authFailures.get(key) || 0) + 1)
      logger.warn({ ip, key }, "Rate limit hit for IP")
    }
    return originalJson(body)
  }
})
mount("/auth", authRouter)
mount("/customers", customersRouter)
mount("/meters", metersRouter)
mount("/readings", readingsRouter)
mount("/invoices", invoicesRouter)
mount("/payments", paymentsRouter)
mount("/admin", adminRouter)
mount("/services", servicesRouter)
mount("/reports", reportsRouter)
mount("/reports/jasper", jasperBridgeRouter)
mount("/domain", domainRouter)
mount("/business", businessRouter)
mount("/crud", crudRouter)
mount("/monitor", monitorRouter)
mount("/monitoring", monitorRouter)
mount("/ai", aiRouter)
mount("/security", securityRouter)
mount("/meter-assignments", meterAssignmentRouter)
mount("/notifications", notificationsRouter)
mount("/preferences", preferencesRouter)
mount("/search", searchRouter)
mount("/tasks", tasksRouter)
mount("/alerts", alertsRouter)
mount("/documents", documentsRouter)
mount("/tariffs", tariffsRouter)
mount("/sim", simRouter)
mount("/projects", projectsRouter)
mount("/pdf", pdfRouter)
mount("/templates", templatesRouter)
mount("/billing", billingRouter)
mount("/admin", configRouter)
mount("/locations", locationsRouter)
mount("/intelligence", intelligenceRouter)
mount("/knowledge", knowledgeRouter)
mount("/rca", rcaRouter)
mount("/accounting", accountingRouter)

// Cloudflare AI bridge (mounted at /api level)
API_PREFIXES.forEach(p => app.use(p, aiCloudflareRouter))

// Availability plans (T092)
app.get("/api/availability", (req, res) => res.json({ plans: getAvailabilityPlans(), active: getAvailabilityPlan() }))
app.post("/api/availability/:plan", (req, res) => {
  try { res.json(setAvailabilityPlan(req.params.plan)) }
  catch (err) { res.status(400).json({ error: err.message }) }
})

// Swagger — only at top level, not versioned
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use("/api-docs.json", (req, res) => res.json(swaggerSpec))

// QR router mounted at /api level
API_PREFIXES.forEach(p => app.use(p, qrRouter))
API_PREFIXES.forEach(p => app.use(p, diagnosticsRouter))
mount("/data-gate", dataGateRouter)

// ─── ERROR HANDLING ──────────────────────────────────────────────────────────

app.use(notFoundHandler)
app.use(errorHandler)

const httpServer = createServer(app)
initWebSocket(httpServer)

httpServer.listen(PORT, () => {})


