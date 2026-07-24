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
import { securityRouter } from "./routes/security.js"
import { domainRouter } from "./routes/domain.js"
import { businessRouter } from "./routes/business.js"
import { crudRouter } from "./routes/crud.js"
import { monitorRouter } from "./routes/monitor.js"
import { aiRouter } from "./routes/ai.js"
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
import { createServer } from "http"
import { trackRequest } from "./middleware/monitor.js"
import { initWebSocket } from "./services/websocket-gateway.js"
import { errorHandler, correlationMiddleware, notFoundHandler } from "./middleware/errorHandler.js"

const app = express()
const PORT = process.env.PORT || 3001

export const prisma = new PrismaClient()

app.use(correlationMiddleware)

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
  windowMs: 15 * 60 * 1000, max: 200,
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

// ─── ROUTES ─────────────────────────────────────────────────────────────────

app.use(trackRequest)
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }))

app.use("/api/auth", authRouter)
app.use("/api/customers", customersRouter)
app.use("/api/meters", metersRouter)
app.use("/api/readings", readingsRouter)
app.use("/api/invoices", invoicesRouter)
app.use("/api/payments", paymentsRouter)
app.use("/api/admin", adminRouter)
app.use("/api/services", servicesRouter)
app.use("/api/reports", reportsRouter)
app.use("/api/domain", domainRouter)
app.use("/api/business", businessRouter)
app.use("/api/crud", crudRouter)
app.use("/api/monitor", monitorRouter)
app.use("/api/ai", aiRouter)
app.use("/api/security", securityRouter)
app.use("/api/meter-assignments", meterAssignmentRouter)
app.use("/api/notifications", notificationsRouter)
app.use("/api/preferences", preferencesRouter)
app.use("/api/search", searchRouter)
app.use("/api/tasks", tasksRouter)
app.use("/api/alerts", alertsRouter)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use("/api-docs.json", (req, res) => res.json(swaggerSpec))
app.use("/api/documents", documentsRouter)
app.use("/api/tariffs", tariffsRouter)
app.use("/api/sim", simRouter)
app.use("/api/projects", projectsRouter)
app.use("/api/billing", billingRouter)

// ─── ERROR HANDLING ──────────────────────────────────────────────────────────

app.use(notFoundHandler)
app.use(errorHandler)

const httpServer = createServer(app)
initWebSocket(httpServer)

httpServer.listen(PORT, () => {})

