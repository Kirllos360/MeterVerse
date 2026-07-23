import jwt from "jsonwebtoken"
import { prisma } from "../server.js"
import { processEvent } from "../services/notification-engine.js"

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) { console.error("FATAL: JWT_SECRET required"); process.exit(1) }

const JWT_ISSUER = "meterverse"
const JWT_AUDIENCE = "meterverse-admin"

// ─── JWT AUTHENTICATION ───────────────────────────────────────────────────────

export function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" })
  }

  try {
    const token = header.split(" ")[1]
    req.user = jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER, audience: JWT_AUDIENCE })
    next()
  } catch (err) {
    if (err.name === "TokenExpiredError") return res.status(401).json({ error: "Token expired", code: "TOKEN_EXPIRED" })
    return res.status(401).json({ error: "Invalid token", code: "INVALID_TOKEN" })
  }
}

// ─── RBAC ─────────────────────────────────────────────────────────────────────

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      auditLog(req, "authorization.failed", { required: roles, userRole: req.user?.role })
      return res.status(403).json({ error: "Insufficient permissions", code: "FORBIDDEN" })
    }
    next()
  }
}

const ROUTE_PERMISSION_MAP = {
  "GET /api/customers": "customers.list", "GET /api/customers/export": "customers.export",
  "GET /api/customers/:id": "customers.read", "POST /api/customers": "customers.create",
  "PUT /api/customers/:id": "customers.update", "DELETE /api/customers/:id": "customers.delete",
  "GET /api/meters": "meters.list", "GET /api/meters/export": "meters.export",
  "GET /api/meters/:id": "meters.read", "POST /api/meters": "meters.create",
  "PUT /api/meters/:id": "meters.update", "DELETE /api/meters/:id": "meters.delete",
  "GET /api/readings": "readings.list", "GET /api/readings/:id": "readings.read",
  "POST /api/readings": "readings.create", "PUT /api/readings/:id": "readings.update",
  "DELETE /api/readings/:id": "readings.delete",
  "GET /api/invoices": "invoices.list", "GET /api/invoices/:id": "invoices.read",
  "POST /api/invoices": "invoices.create", "PUT /api/invoices/:id": "invoices.update",
  "DELETE /api/invoices/:id": "invoices.delete",
  "GET /api/payments": "payments.list", "GET /api/payments/:id": "payments.read",
  "POST /api/payments": "payments.create", "DELETE /api/payments/:id": "payments.delete",
}

const ROLE_PERMISSIONS = {
  super_admin: null,
  admin: ["customers.*", "meters.*", "readings.*", "invoices.*", "payments.*", "notifications.*", "meter_assignments.*"],
  operator: ["customers.*", "meters.*", "readings.*", "invoices.*", "payments.*"],
  billing: ["invoices.*", "payments.*", "customers.read", "customers.list", "meters.read", "meters.list"],
  viewer: ["*.read", "*.list"],
}

export function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" })
    if (req.user.role === "super_admin") return next()
    if (permissions.length === 0) return next()

    const userPerms = ROLE_PERMISSIONS[req.user.role]
    if (!userPerms) return res.status(403).json({ error: "Insufficient permissions" })

    const hasAny = permissions.some(required => {
      return userPerms.some(allowed => {
        const regex = new RegExp("^" + allowed.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$")
        return regex.test(required)
      })
    })

    if (!hasAny) {
      auditLog(req, "authorization.permission_denied", { required: permissions, role: req.user.role })
      return res.status(403).json({ error: "Permission denied", required: permissions, role: req.user.role })
    }
    next()
  }
}

// ─── AUDIT LOGGING ────────────────────────────────────────────────────────────

export function auditLog(req, action, details = {}) {
  if (!prisma) return
  const data = {
    action,
    actor: req.user?.email || "anonymous",
    actorId: req.user?.sub,
    resource: req.originalUrl,
    details: JSON.stringify(details),
    ip: req.ip,
    userAgent: req.headers["user-agent"] || "",
    status: details.error ? "failure" : "success",
  }
  prisma.auditEntry.create({ data }).catch(() => {})
  processEvent(action, details, { actorId: req.user?.sub, ip: req.ip }).catch(() => {})
}

export function auditMiddleware(action) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res)
    res.json = function (body) {
      auditLog(req, action, { statusCode: res.statusCode, method: req.method })
      return originalJson(body)
    }
    next()
  }
}

// ─── SESSION VALIDATION ───────────────────────────────────────────────────────

export async function validateSession(req, res, next) {
  if (!req.user) return next()
  try {
    await prisma.session.updateMany({
      where: { userId: req.user.sub, isActive: true, expiresAt: { lt: new Date() } },
      data: { isActive: false },
    })
    next()
  } catch { next() }
}

// ─── PASSWORD POLICY ──────────────────────────────────────────────────────────

export function validatePassword(password) {
  const errors = []
  if (password.length < 8) errors.push("Minimum 8 characters required")
  if (!/[A-Z]/.test(password)) errors.push("At least one uppercase letter required")
  if (!/[a-z]/.test(password)) errors.push("At least one lowercase letter required")
  if (!/[0-9]/.test(password)) errors.push("At least one number required")
  if (!/[^A-Za-z0-9]/.test(password)) errors.push("At least one special character required")
  return { valid: errors.length === 0, errors }
}
