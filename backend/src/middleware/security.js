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
  admin: ["customers.*", "meters.*", "readings.*", "invoices.*", "payments.*", "notifications.*", "meter_assignments.*", "admin.*", "ai.*", "business.*", "monitor.*", "reports.*", "services.*", "preferences.*", "governance.*", "tenant.*", "workflow.*", "accounting.events.*", "accounting.mappings.*", "revenue.*", "tariffs.*"],
  area_manager: ["customers.*", "meters.*", "readings.*", "invoices.*", "payments.*", "notifications.*", "reports.*"],
  operator: ["customers.*", "meters.*", "readings.*", "invoices.*", "payments.*", "monitor.*"],
  billing: ["invoices.*", "payments.*", "customers.read", "customers.list", "meters.read", "meters.list", "reports.*"],
  team_leader: ["customers.*", "meters.read", "readings.*", "invoices.read", "payments.read", "reports.*"],
  viewer: ["*.read", "*.list"],
}

function matchPermission(required, allowed) {
  const regex = new RegExp("^" + allowed.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$")
  return regex.test(required)
}

const permissionCache = new Map()
const CACHE_TTL = 60000

// ─── OBJECT-LEVEL AUTHORIZATION (T01) ──────────────────────────────────────
// Checks if the authenticated user can access a specific resource
// by verifying the resource's areaId is within the user's permission scope.
// Usage: requireAccess("Meter", req.params.id)
export async function requireAccess(model, resourceId) {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Authentication required" })
      if (req.user.role === "super_admin") return next()

      const resource = await prisma[model.toLowerCase()].findUnique({ where: { id: resourceId } })
      if (!resource) return res.status(404).json({ error: "Resource not found" })

      // If resource has no areaId, check global permissions
      if (!resource.areaId) {
        const allowed = await checkPermission(req.user.role, `${model.toLowerCase()}.read`)
        return allowed ? next() : res.status(403).json({ error: "Access denied" })
      }

      // Check user's permissions scoped to this area
      const role = await prisma.role.findUnique({ where: { name: req.user.role } })
      if (!role) return res.status(403).json({ error: "Role not found" })

      const permOnRole = await prisma.permissionOnRole.findFirst({
        where: {
          roleId: role.id,
          scopeType: { in: ["area", null] },
          scopeId: { in: [resource.areaId, null] },
          grant: true,
          permission: { name: { contains: model.toLowerCase() } },
        },
      })

      if (permOnRole) return next()
      return res.status(403).json({ error: "Access denied to this resource" })
    } catch (err) { next(err) }
  }
}

// ─── API KEY AUTHENTICATION (T03) ───────────────────────────────────────────
// Authenticates service accounts via X-API-Key header
// Usage: router.use(authenticateApiKey)
export async function authenticateApiKey(req, res, next) {
  try {
    const apiKey = req.headers["x-api-key"]
    if (!apiKey) return req.headers.authorization ? next() : res.status(401).json({ error: "API key required" })

    // Look up the API key (stored as hash in DB)
    const keyRecord = await prisma.apiKey.findFirst({ where: { active: true, archivedAt: null } })
    if (!keyRecord) return res.status(401).json({ error: "Invalid API key" })

    // Simple comparison (in production, use bcrypt.compare)
    const isValid = keyRecord.key === apiKey
    if (!isValid) return res.status(401).json({ error: "Invalid API key" })

    req.user = { sub: keyRecord.id, email: `api-${keyRecord.name}@meterverse.com`, role: "service", apiKey: true }
    await prisma.apiKey.update({ where: { id: keyRecord.id }, data: { lastUsedAt: new Date() } })
    next()
  } catch (err) { next(err) }
}

export function requirePermission(...permissions) {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" })
    if (req.user.role === "super_admin") return next()
    if (permissions.length === 0) return next()

    // Fast path: check hardcoded role permissions
    const hardcodedPerms = ROLE_PERMISSIONS[req.user.role]
    if (hardcodedPerms) {
      const hasHardcoded = permissions.some(required =>
        hardcodedPerms.some(allowed => matchPermission(required, allowed))
      )
      if (hasHardcoded) return next()
    }

    // DB path: query PermissionOnRole table for custom roles
    try {
      const cacheKey = `${req.user.role}:${permissions.join(",")}`
      const cached = permissionCache.get(cacheKey)
      if (cached && cached.expiresAt > Date.now()) {
        if (cached.allowed) return next()
        return res.status(403).json({ error: "Permission denied", required: permissions, role: req.user.role })
      }

      const role = await prisma.role.findFirst({
        where: { name: req.user.role, isSystem: false },
        include: { permissions: { include: { permission: true } } },
      })

      if (role) {
        const dbPerms = role.permissions.map(p => p.permission.name)
        const hasDb = permissions.some(required =>
          dbPerms.some(allowed => matchPermission(required, allowed))
        )
        permissionCache.set(cacheKey, { allowed: hasDb, expiresAt: Date.now() + CACHE_TTL })
        if (hasDb) return next()
      }
    } catch {}

    auditLog(req, "authorization.permission_denied", { required: permissions, role: req.user.role })
    res.status(403).json({ error: "Permission denied", required: permissions, role: req.user.role })
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
    correlationId: req?.correlationId || null,
    beforeSnapshot: details.before ? JSON.stringify(details.before) : null,
    afterSnapshot: details.after ? JSON.stringify(details.after) : null,
  }
  prisma.auditEntry.create({ data }).catch(err => console.warn("[audit] auditLog create failed:", err?.message))
  processEvent(action, details, { actorId: req.user?.sub, ip: req.ip, correlationId: req?.correlationId }).catch(err => console.warn("[audit] processEvent failed:", err?.message))
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

// ─── AREA ACCESS SCOPE ─────────────────────────────────────────────────────────

const AREA_ROLES = ["area_manager", "team_leader", "operator", "billing", "viewer"]

export function requireAreaAccess(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Authentication required" })
  if (req.user.role === "super_admin" || req.user.role === "admin") return next()

  const requestedArea = req.query.area || req.body?.area || req.params?.area
  if (!requestedArea) return next() // no area filter, allow

  const userArea = req.user.area
  if (!userArea) return res.status(403).json({ error: "No area assigned", code: "AREA_RESTRICTED" })

  if (userArea !== requestedArea && userArea !== "all") {
    auditLog(req, "authorization.area_denied", { requested: requestedArea, userArea })
    return res.status(403).json({ error: "Area access denied", code: "AREA_RESTRICTED" })
  }

  next()
}

export function filterByArea(req, res, next) {
  if (!req.user || req.user.role === "super_admin" || req.user.role === "admin") return next()
  if (req.user.area && req.user.area !== "all") {
    // Inject area filter into query
    if (!req.query) req.query = {}
    req.query.area = req.user.area
  }
  next()
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
