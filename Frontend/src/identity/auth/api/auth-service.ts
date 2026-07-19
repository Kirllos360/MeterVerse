import type { AuthUser } from "../AuthRuntime"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface LoginResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
  expiresAt: number
}

interface RegisterPayload {
  email: string
  password: string
  name: string
}

const MOCK_USERS: Record<string, { password: string; name: string }> = {
  "admin@meterverse.com": { password: "admin", name: "Admin User" },
  "operator@meterverse.com": { password: "operator", name: "Operator User" },
  "viewer@meterverse.com": { password: "viewer", name: "Viewer User" },
}

function createMockUser(email: string, name: string): AuthUser {
  const role = email.includes("admin") ? "admin" : email.includes("operator") ? "operator" : "viewer"
  const permissions = role === "admin"
    ? ["read", "write", "delete", "admin", "export", "approve"]
    : role === "operator"
      ? ["read", "write", "export"]
      : ["read"]
  return {
    id: crypto.randomUUID?.() || `${Date.now()}`,
    email,
    name,
    role,
    permissions,
    area: "October",
    project: "Phase 1",
    tenant: "Palm Hills",
    language: "en",
    theme: "adaptive",
    mfaEnabled: false,
  }
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  // Try real backend first, fall back to mock
  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) return res.json()
    } catch {}
  }

  // Mock fallback
  await new Promise((r) => setTimeout(r, 800))
  const found = MOCK_USERS[email.toLowerCase()]
  if (!found || found.password !== password) {
    throw new Error("Invalid credentials")
  }
  const user = createMockUser(email, found.name)
  return {
    user,
    accessToken: `mv_access_${btoa(JSON.stringify({ sub: user.id, email: user.email, role: user.role }))}`,
    refreshToken: `mv_refresh_${crypto.randomUUID?.() || Date.now()}`,
    expiresAt: Date.now() + 3600000,
  }
}

export async function registerUser(payload: RegisterPayload): Promise<AuthUser> {
  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const data = await res.json()
        return data.user || data
      }
    } catch {}
  }

  await new Promise((r) => setTimeout(r, 800))
  const email = payload.email.toLowerCase()
  if (MOCK_USERS[email]) throw new Error("Email already registered")
  MOCK_USERS[email] = { password: payload.password, name: payload.name }
  return createMockUser(email, payload.name)
}

export async function refreshAccessToken(refreshToken: string): Promise<LoginResponse> {
  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })
      if (res.ok) return res.json()
    } catch {}
  }

  await new Promise((r) => setTimeout(r, 300))
  return {
    user: createMockUser("admin@meterverse.com", "Admin User"),
    accessToken: `mv_access_${btoa(JSON.stringify({ sub: "1", email: "admin@meterverse.com", role: "admin" }))}`,
    refreshToken: `mv_refresh_${crypto.randomUUID?.() || Date.now()}`,
    expiresAt: Date.now() + 3600000,
  }
}

export async function logoutUser(): Promise<void> {
  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST" })
    } catch {}
  }
}
