import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { prisma } from "./db.js"
import { authRouter } from "./routes/auth.js"
import { customersRouter } from "./routes/customers.js"
import { customerPortalRouter } from "./routes/customer-portal.js"
import { metersRouter } from "./routes/meters.js"
import { readingsRouter } from "./routes/readings.js"
import { consumptionsRouter } from "./routes/consumptions.js"
import { invoicesRouter } from "./routes/invoices.js"
import { paymentsRouter } from "./routes/payments.js"
import { chequeRouter } from "./routes/cheque.js"
import { adminRouter } from "./routes/admin.js"
import { servicesRouter } from "./routes/services.js"
import { reportsRouter } from "./routes/reports.js"
import { jasperBridgeRouter } from "./routes/jasper-bridge.js"
import { securityRouter } from "./routes/security.js"
import { sessionsRouter } from "./routes/sessions.js"
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
import { communicationRouter } from "./routes/communication.js"
import { documentsRouter } from "./routes/documents.js"
import { documentGovernanceRouter } from "./routes/documents-governance.js"
import { tariffsRouter } from "./routes/tariffs.js"
import { swaggerSpec, swaggerUi } from "./swagger.js"
import { simRouter } from "./routes/sim.js"
import { projectsRouter } from "./routes/projects.js"
import { billingRouter } from "./routes/billing.js"
import { settlementsRouter } from "./routes/settlements.js"
import { importsRouter } from "./routes/imports.js"
import { solarRouter } from "./routes/solar.js"
import { maintenanceRouter } from "./routes/maintenance.js"
import { intelligenceRouter } from "./routes/intelligence.js"
import { knowledgeRouter } from "./routes/knowledge.js"
import { rcaRouter } from "./routes/rca.js"
import { accountingRouter } from "./routes/accounting.js"
import { learnedPatternsRouter } from "./routes/learned-patterns.js"
import { incidentsRouter } from "./routes/incidents.js"
import { materializedViewsRouter } from "./routes/materialized-views.js"
import { gatewaysRouter } from "./routes/gateways.js"
import { ingestionRouter } from "./routes/ingestion.js"
import { knowledgeArticlesRouter } from "./routes/knowledge-articles.js"
import { aiFeedbackRouter } from "./routes/ai-feedback.js"
import { databaseConnectionsRouter } from "./routes/database-connections.js"
import { connectionProfilesRouter as connProfRouter } from "./routes/connection-profiles.js"
import { migrationRouter } from "./routes/migration.js"
import { governanceRouter } from "./routes/governance.js"
import { tenantRouter } from "./routes/tenants.js"
import { workflowRouter } from "./routes/workflows.js"
import { financialIntegrationRouter } from "./routes/financial-integration.js"
import { revenueAssuranceRouter } from "./routes/revenue-assurance.js"
import { tariffEngineRouter } from "./routes/tariff-engine.js"
import { collectionsRouter } from "./routes/collections.js"
import { financialReportsRouter } from "./routes/financial-reports.js"
import { financialAiRouter } from "./routes/financial-ai.js"
import { RuntimeManager } from "./services/runtime-manager.js"
import { startIngestion, getIngestionStatus } from "./services/ingestion-runtime.js"
import { startLedgerConsumer } from "./services/ledger-consumer.js"
import { runDispatchCycle } from "./services/outbox-dispatcher.js"
import { SchedulerEngine, HEARTBEAT_JOB, SYNC_METER_JOB, SYNC_READING_JOB, CLEANUP_JOB, RETRY_JOB } from "./services/scheduler-engine.js"
import { authenticate } from "./middleware/auth.js"
import { requirePermission } from "./middleware/security.js"
import { configRouter } from "./routes/config-center.js"
import { locationsRouter } from "./routes/locations.js"
import { diagnosticsRouter } from "./routes/diagnostics.js"
import { pdfRouter } from "./routes/pdf.js"
import { templatesRouter } from "./routes/templates.js"
import { qrRouter } from "./routes/qr.js"
import { dataGateRouter } from "./routes/data-gate.js"
import { adminSettingsRouter } from "./routes/admin-settings.js"
import { createServer } from "http"
import { trackRequest } from "./middleware/monitor.js"
import { trackResponseTime } from "./services/kpi-engine.js"
import { initWebSocket } from "./services/websocket-gateway.js"
import { errorHandler, correlationMiddleware, notFoundHandler } from "./middleware/errorHandler.js"
import { idempotencyMiddleware } from "./middleware/idempotency.js"
import { getAvailabilityPlans, getAvailabilityPlan, setAvailabilityPlan } from "./services/availability-manager.js"
import logger from "./services/logger.js"

const app = express()

// ─── METERVERSE OS PROFILE ───────────────────────────────────────────────────
// PORTAL_MODE=1 → Customer Portal API (port 3003): exposes ONLY customer-facing
// routes (invoices, payments, portal, meters list, notifications, consumptions,
// profile/preferences, requests/tickets). Admin/ops routes are NOT mounted.
// PORTAL_MODE unset → Admin API (port 3131): full enterprise API.
// NOTE: cmd launchers (`set PORTAL_MODE=1 && node`) append a trailing space to the
// value, so trim before comparing — otherwise portal mode silently disables and the
// portal backend mounts every admin route (security regression).
const PORTAL_MODE = String(process.env.PORTAL_MODE || "").trim() === "1"
const PORT = process.env.PORT || (PORTAL_MODE ? 3003 : 3131)
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

// Canonical Prisma singleton shared across all routes + services (see src/db.js).
// P45: single connection pool — previously server.js created a second PrismaClient.
export { prisma }

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
const CORS_ALLOWED = (process.env.CORS_ORIGIN || "http://localhost:3030,http://localhost:3535")
  .split(",").map(s => s.trim()).filter(Boolean)
app.use(cors({
  origin: (origin, cb) => {
    // No origin (same-origin/curl) or matched allowed origin -> allow.
    if (!origin || CORS_ALLOWED.includes(origin)) return cb(null, origin ? origin : true)
    return cb(null, false)
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
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

// Per-user rate limiting (T04) — tracks requests by user ID from JWT
const userRateStore = new Map()
app.use("/api/", (req, res, next) => {
  const userId = req.user?.sub || req.ip
  const now = Date.now()
  const windowMs = 60000
  if (!userRateStore.has(userId)) userRateStore.set(userId, [])
  const timestamps = userRateStore.get(userId).filter(t => now - t < windowMs)
  if (timestamps.length >= 500) {  // 500 req/min per user
    return res.status(429).json({ error: "Too many requests (user rate limit)", code: "USER_RATE_LIMITED" })
  }
  timestamps.push(now)
  userRateStore.set(userId, timestamps)
  next()
})

// ─── API VERSIONING ─────────────────────────────────────────────────────────
// All routes mount under /api for backward compatibility
// AND under /api/v1 for versioned access

const API_PREFIXES = ["/api", "/api/v1"]

function mount(prefix, router) {
  API_PREFIXES.forEach(p => app.use(p + prefix, router))
}

// ─── ROUTES ─────────────────────────────────────────────────────────────────

app.use(trackRequest)

// Response time tracking (W08-T01)
app.use((req, res, next) => {
  const start = Date.now()
  res.on("finish", () => trackResponseTime(Date.now() - start))
  next()
})

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
mount("/portal", customerPortalRouter)
mount("/meters", metersRouter)
mount("/readings", readingsRouter)
mount("/consumptions", consumptionsRouter)
mount("/invoices", invoicesRouter)
mount("/payments", paymentsRouter)
mount("/cheques", chequeRouter)

// ─── PROFILE-AWARE ROUTES ────────────────────────────────────────────────────
// PORTAL_MODE=1 (Customer Portal API, :3003) mounts ONLY customer-facing
// routes. All admin/ops routes below are excluded to guarantee the portal never
// exposes enterprise endpoints. Admin API (:3131) mounts everything.
if (!PORTAL_MODE) {
  mount("/admin", adminRouter)
  mount("/services", servicesRouter)
  mount("/reports", reportsRouter)
  mount("/reports/jasper", jasperBridgeRouter)
  mount("/domain", domainRouter)
  mount("/business", businessRouter)
  mount("/crud", crudRouter)
  mount("/monitor", monitorRouter)
  mount("/ai", aiRouter)
  mount("/security", securityRouter)
  mount("/sessions", sessionsRouter)
  mount("/search", searchRouter)
  mount("/tasks", tasksRouter)
  mount("/alerts", alertsRouter)
  mount("/documents", documentsRouter)
  mount("/documents-governance", documentGovernanceRouter)
  mount("/tariffs", tariffsRouter)
  mount("/sim", simRouter)
  mount("/projects", projectsRouter)
  mount("/pdf", pdfRouter)
  mount("/templates", templatesRouter)
  mount("/billing", billingRouter)
  mount("/settlements", settlementsRouter)
  mount("/imports", importsRouter)
  mount("/solar", solarRouter)
  mount("/maintenance", maintenanceRouter)
  mount("/admin", configRouter)
  mount("/locations", locationsRouter)
  mount("/intelligence", intelligenceRouter)
  mount("/knowledge", knowledgeRouter)
  mount("/rca", rcaRouter)
  mount("/accounting", accountingRouter)
  mount("/learned-patterns", learnedPatternsRouter)
  mount("/incidents", incidentsRouter)
  mount("/governance", governanceRouter)
  mount("/tenants", tenantRouter)
  mount("/workflows", workflowRouter)
  mount("/financial-integration", financialIntegrationRouter)
  mount("/revenue-assurance", revenueAssuranceRouter)
  mount("/tariff-engine", tariffEngineRouter)
  mount("/collections", collectionsRouter)
  mount("/financial-reports", financialReportsRouter)
  mount("/financial-ai", financialAiRouter)
  mount("/materialized-views", materializedViewsRouter)
  mount("/gateways", gatewaysRouter)
  mount("/ingestion", ingestionRouter)
  mount("/knowledge-articles", knowledgeArticlesRouter)
  mount("/ai-feedback", aiFeedbackRouter)
  mount("/database-connections", databaseConnectionsRouter)
  mount("/connection-profiles", connProfRouter)
  mount("/migration", migrationRouter)
  mount("/data-gate", dataGateRouter)
  mount("/admin-settings", adminSettingsRouter)
}

// Portal-exposed routes that are also safe on the customer portal
mount("/notifications", notificationsRouter)
mount("/meter-assignments", meterAssignmentRouter)
mount("/preferences", preferencesRouter)
mount("/communication", communicationRouter)
// P60: areas endpoint is portal-safe (area selector on portal home).
mount("/locations", locationsRouter)

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

const runtime = new RuntimeManager()
const scheduler = new SchedulerEngine(runtime)

// Register scheduler jobs
scheduler.register(HEARTBEAT_JOB)
scheduler.register(SYNC_METER_JOB)
scheduler.register(SYNC_READING_JOB)
scheduler.register(CLEANUP_JOB)
scheduler.register(RETRY_JOB)

// Runtime + Scheduler status endpoints
app.get("/api/runtime/status", (req, res) => { res.json({ ...runtime.getStatus(), scheduler: scheduler.getStats() }) })
app.post("/api/runtime/restart", async (req, res) => { await runtime.restart(); scheduler.start(); res.json({ status: "restarted" }) })
app.get("/api/scheduler/stats", (req, res) => { res.json(scheduler.getStats()) })
app.get("/api/ingestion/status", (req, res) => { res.json(getIngestionStatus()) })
app.get("/api/health/scores", async (req, res) => {
  const scores = await runtime.healthMonitor.getAllScores().catch(() => [])
  res.json({ scores, stats: runtime.healthMonitor.getStats() })
})
app.get("/api/health/scores/:profileId", async (req, res) => {
  const score = await runtime.healthMonitor.computeScore(req.params.profileId).catch(() => null)
  res.json({ score })
})
app.get("/api/health/scores/:profileId/heartbeats", async (req, res) => {
  const { prisma } = await import("./server.js")
  const checks = await prisma.healthCheck.findMany({
    where: { connectionProfileId: req.params.profileId },
    orderBy: { checkedAt: "desc" }, take: 50,
  }).catch(() => [])
  res.json({ heartbeats: checks })
})
app.get("/api/health/scores/:profileId/trend", async (req, res) => {
  const hm = runtime.healthMonitor
  const score = await hm.computeScore(req.params.profileId).catch(() => null)
  res.json({ score, trend: score ? [score.score] : [] })
})
app.post("/api/failover/:profileId", async (req, res) => {
  const result = await runtime.failover.executeFailover(req.params.profileId, "Manual trigger").catch(e => ({ error: e.message }))
  res.json(result)
})
app.post("/api/failover/:profileId/switchback", async (req, res) => {
  const result = await runtime.failover.switchbackToPrimary(req.params.profileId).catch(e => ({ error: e.message }))
  res.json(result)
})
app.get("/api/failover/stats", (req, res) => { res.json(runtime.failover.getStats()) })
app.get("/api/observability/metrics", (req, res) => { res.json(runtime.metrics.getMetrics()) })
app.get("/api/observability/metrics/prometheus", (req, res) => { res.type("text/plain").send(runtime.metrics.getPrometheus()) })
app.get("/api/observability/events", (req, res) => { res.json(runtime.eventBus.getHistory(req.query.event)) })
app.get("/api/observability/events/stats", (req, res) => { res.json(runtime.eventBus.getStats()) })
app.get("/api/diagnostics/:profileId/history", async (req, res) => {
  const { prisma } = await import("./server.js")
  const tests = await prisma.connectionTest.findMany({
    where: { connectionProfileId: req.params.profileId },
    orderBy: { testedAt: "desc" }, take: 20,
  }).catch(() => [])
  res.json({ tests })
})
app.post("/api/diagnostics/:profileId", async (req, res) => {
  const report = await runtime.diagnostics.runFullDiagnostic(req.params.profileId).catch(e => ({ error: e.message }))
  res.json(report)
})

const httpServer = createServer(app)
initWebSocket(httpServer)

httpServer.listen(PORT, () => {
  runtime.start().then(() => {
    scheduler.start()
    startIngestion()
    // P12.2-D: start the outbox ledger consumer + periodic dispatcher (guarded).
    const ledger = startLedgerConsumer()
    console.log(`[outbox] ledger consumer registered (active=${ledger.active()}, shadow=${ledger.shadow()})`)
    setInterval(() => {
      runDispatchCycle().catch(err => console.error("[outbox] dispatch cycle error:", err.message))
    }, Number(process.env.OUTBOX_DISPATCH_INTERVAL_MS) || 5000)
  }).catch(err => console.error("[runtime] Startup error:", err.message))
})

// ─── ERROR HANDLING (registered LAST so inline /api routes above are reachable) ─
app.use(notFoundHandler)
app.use(errorHandler)


