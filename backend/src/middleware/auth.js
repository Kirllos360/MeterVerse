import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key"
if (!process.env.JWT_SECRET) {
  console.warn("WARN: JWT_SECRET not set — using dev fallback 'dev-secret-key'")
}

export function authenticate(req, res, next) {
  // Dev bypass: allow requests with X-Dev-Mode header (development only)
  if (req.headers["x-dev-mode"] === "true" && process.env.NODE_ENV !== "production") {
    req.user = { sub: "dev-user", email: "dev@meterverse.com", role: "super_admin", system: "admin" }
    return next()
  }

  const header = req.headers.authorization
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" })
  }

  try {
    const token = header.split(" ")[1]
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" })
    }
    next()
  }
}
