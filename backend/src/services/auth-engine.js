import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { prisma } from "../db.js"

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) { console.error("FATAL: JWT_SECRET required"); process.exit(1) }

const SYSTEM_CONFIG = {
  admin: { expiresIn: "4h", redirect: "/admin", label: "Administrator Portal" },
  user:  { expiresIn: "24h", redirect: "/dashboard", label: "Customer Portal" },
  mobile: { expiresIn: "720h", redirect: null, label: "Mobile App" },
}

export async function authenticateUser(email, password, systemType = "admin") {
  const config = SYSTEM_CONFIG[systemType]
  if (!config) return { success: false, error: "Invalid system type", status: 400 }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { success: false, error: "Invalid credentials", status: 401 }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return { success: false, error: "Invalid credentials", status: 401 }

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    system: systemType,
    scope: systemType === "admin" ? "admin" : systemType === "user" ? "user" : "mobile",
  }

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: config.expiresIn })

  const userData = systemType === "admin"
    ? { id: user.id, email: user.email, name: user.name, role: user.role, area: user.area, project: user.project, tenant: user.tenant, language: user.language, theme: user.theme, mfaEnabled: user.mfaEnabled, permissions: user.role === "super_admin" ? ["read","write","delete","admin","export","approve","manage_users","manage_roles","manage_settings"] : user.role === "admin" ? ["read","write","delete","admin","export","approve"] : user.role === "operator" ? ["read","write","export"] : user.role === "billing" ? ["read","write","export","invoices.manage","payments.manage"] : ["read"] }
    : { id: user.id, email: user.email, name: user.name, role: user.role }

  return {
    success: true,
    accessToken,
    user: userData,
    expiresAt: Date.now() + parseExpiry(config.expiresIn),
    redirect: config.redirect,
    system: systemType,
    portal: config.label,
  }
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

function parseExpiry(ex) {
  const unit = ex.slice(-1)
  const val = parseInt(ex.slice(0, -1))
  if (unit === "h") return val * 3600000
  if (unit === "d") return val * 86400000
  if (unit === "m") return val * 60000
  return 86400000
}
