import jwt from "jsonwebtoken"

export interface AuthTokenPayload {
  sub: string
  role: string
  profile: "admin" | "portal"
  [key: string]: unknown
}

/** Create a JWT for the given profile. */
export function signToken(payload: AuthTokenPayload, secret: string, expiresIn = "12h"): string {
  return jwt.sign(payload, secret, { expiresIn })
}

/** Verify + decode a JWT. Throws on invalid/expired. */
export function verifyToken(token: string, secret: string): AuthTokenPayload {
  return jwt.verify(token, secret) as AuthTokenPayload
}

/** Extract Bearer token from an Authorization header. */
export function extractBearer(authorization?: string): string | null {
  if (!authorization) return null
  const [scheme, token] = authorization.split(" ")
  return scheme?.toLowerCase() === "bearer" && token ? token : null
}
