import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import speakeasy from "speakeasy"
import { prisma } from "../db.js"

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) { console.error("FATAL: JWT_SECRET required"); process.exit(1) }

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000

const SYSTEM_CONFIG = {
  admin: { expiresIn: "4h", redirect: "/admin", label: "Administrator Portal" },
  user:  { expiresIn: "24h", redirect: "/dashboard", label: "Customer Portal" },
  mobile: { expiresIn: "720h", redirect: null, label: "Mobile App" },
}

export async function authenticateUser(email, password, systemType = "admin", ip = null) {
  const config = SYSTEM_CONFIG[systemType]
  if (!config) return { success: false, error: "Invalid system type", status: 400 }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { success: false, error: "Invalid credentials", status: 401 }

  // Account lockout check
  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    const remaining = Math.ceil((new Date(user.lockedUntil) - new Date()) / 1000 / 60)
    return { success: false, error: `Account locked. Try again in ${remaining} minutes`, status: 429 }
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    // Increment failed attempts
    const attempts = (user.loginAttempts || 0) + 1
    const updateData = { loginAttempts: attempts, lastFailedAt: new Date() }
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS)
    }
    await prisma.user.update({ where: { id: user.id }, data: updateData })
    return { success: false, error: "Invalid credentials", status: 401 }
  }

  // Reset failed attempts on success
  await prisma.user.update({ where: { id: user.id }, data: { loginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() } })

  // MFA challenge
  if (user.mfaEnabled) {
    return { success: true, mfaRequired: true, userId: user.id, email: user.email }
  }

  return await createSession(user, systemType, config, ip)
}

async function createSession(user, systemType, config, ip) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    system: systemType,
    scope: systemType === "admin" ? "admin" : systemType === "user" ? "user" : "mobile",
  }

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: config.expiresIn })

  // Track session in DB
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: accessToken.slice(-40),
      ip: ip || "unknown",
      userAgent: "auth-engine",
      isActive: true,
      expiresAt: new Date(Date.now() + parseExpiry(config.expiresIn)),
    },
  }).catch(() => null)

  const userData = systemType === "admin"
    ? {
        id: user.id, email: user.email, name: user.name, role: user.role,
        area: user.area, project: user.project, tenant: user.tenant,
        language: user.language, theme: user.theme, mfaEnabled: user.mfaEnabled,
        permissions: getUserPermissions(user.role),
      }
    : { id: user.id, email: user.email, name: user.name, role: user.role }

  return {
    success: true,
    accessToken,
    user: userData,
    expiresAt: Date.now() + parseExpiry(config.expiresIn),
    redirect: config.redirect,
    system: systemType,
    portal: config.label,
    sessionId: session?.id,
  }
}

export async function setupMfa(userId) {
  const secret = speakeasy.generateSecret({ name: `MeterVerse:${userId}` })
  await prisma.user.update({ where: { id: userId }, data: { mfaSecret: secret.base32 } })
  return { secret: secret.base32, otpauth_url: secret.otpauth_url }
}

export async function verifyMfa(userId, code) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user?.mfaSecret) return { valid: false, error: "MFA not configured" }
  const valid = speakeasy.totp.verify({ secret: user.mfaSecret, encoding: "base32", token: code, window: 1 })
  if (valid) {
    await prisma.user.update({ where: { id: userId }, data: { mfaEnabled: true } })
    return { valid: true }
  }
  return { valid: false, error: "Invalid code" }
}

export function verifyToken(token, allowedSystems = ["admin", "user", "mobile"]) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!allowedSystems.includes(decoded.system)) {
      return { valid: false, error: "Token not valid for this system", status: 403 }
    }
    return { valid: true, user: decoded }
  } catch (err) {
    if (err.name === "TokenExpiredError") return { valid: false, error: "Token expired", status: 401 }
    return { valid: false, error: "Invalid token", status: 401 }
  }
}

function getUserPermissions(role) {
  const perms = {
    super_admin: ["read","write","delete","admin","export","approve","manage_users","manage_roles","manage_settings","audit.view","backup.manage","all"],
    admin: ["read","write","delete","admin","export","approve"],
    operator: ["read","write","export"],
    billing: ["read","write","export","invoices.manage","payments.manage"],
    viewer: ["read"],
  }
  return perms[role] || ["read"]
}

function parseExpiry(ex) {
  const unit = ex.slice(-1)
  const val = parseInt(ex.slice(0, -1))
  if (unit === "h") return val * 3600000
  if (unit === "d") return val * 86400000
  if (unit === "m") return val * 60000
  return 86400000
}
