import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is not set")
  process.exit(1)
}

export function authenticate(req, res, next) {
  // Dev bypass: allow requests with X-Dev-Mode header (development only)
  // Requires NODE_ENV != production AND JWT_SECRET must be explicitly set for dev
  if (req.headers["x-dev-mode"] === "true" && process.env.NODE_ENV !== "production" && process.env.JWT_SECRET) {
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
