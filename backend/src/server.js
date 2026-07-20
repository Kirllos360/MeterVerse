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
import { errorHandler } from "./middleware/errorHandler.js"

const app = express()
const PORT = process.env.PORT || 3001

export const prisma = new PrismaClient()

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
app.use("/api/security", securityRouter)

// ─── ERROR HANDLING ──────────────────────────────────────────────────────────

app.use(errorHandler)

app.listen(PORT, () => console.log(`MeterVerse API running on port ${PORT}`))
