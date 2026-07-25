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
import { configRouter } from "./routes/config-center.js"
import { locationsRouter } from "./routes/locations.js"
import { diagnosticsRouter } from "./routes/diagnostics.js"
import { pdfRouter } from "./routes/pdf.js"
import { templatesRouter } from "./routes/templates.js"
import { qrRouter } from "./routes/qr.js"
import { createServer } from "http"
import { trackRequest } from "./middleware/monitor.js"
import { initWebSocket } from "./services/websocket-gateway.js"
import { errorHandler, correlationMiddleware, notFoundHandler } from "./middleware/errorHandler.js"
import { idempotencyMiddleware } from "./middleware/idempotency.js"

const app = express()
const PORT = process.env.PORT || 3001

export const prisma = new PrismaClient()

app.use(correlationMiddleware)
app.use(idempotencyMiddleware)

// ═══════════════════════════════════════════════════════════════════════════════
//  SECURITY LAYER
// ═══════════════════════════════════════════════════════════════════════════════

// CSP — Content Security Policy (XSS protection, inline script blocking)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],  // 'unsafe-inline' for Next.js HMR in dev
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:3001", "http://localhost:7400"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,  // Needed for Next.js
  crossOriginResourcePolicy: { policy: "cross-origin" },
}))

// CORS — Strict origin
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:7400",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  exposedHeaders: ["X-Request-ID"],
}))

// Body parsing with size limit (prevents DOS)
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: false, limit: "1mb" }))

// Rate limiting — stricter on auth routes
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, max: 2000,
  standardHeaders: true, legacyHeaders: false,
  message: { error: "Too many requests" },
})
app.use("/api/", globalLimiter)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  standardHeaders: true, legacyHeaders: false,
  message: { error: "Too many login attempts" },
})
app.use("/api/auth/login", authLimiter)

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

// Cloudflare AI bridge (mounted at /api level)
API_PREFIXES.forEach(p => app.use(p, aiCloudflareRouter))

// Swagger — only at top level, not versioned
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use("/api-docs.json", (req, res) => res.json(swaggerSpec))

// QR router mounted at /api level
API_PREFIXES.forEach(p => app.use(p, qrRouter))
API_PREFIXES.forEach(p => app.use(p, diagnosticsRouter))

// ─── ERROR HANDLING ──────────────────────────────────────────────────────────

app.use(notFoundHandler)
app.use(errorHandler)

const httpServer = createServer(app)
initWebSocket(httpServer)

httpServer.listen(PORT, () => {})

