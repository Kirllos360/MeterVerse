import type { AuthUser } from "../AuthRuntime"

// P51: default to the MeterVerse OS backend. Admin API = :3131; Portal API = :3003.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.PORTAL_MODE === "1" ? "http://localhost:3003" : "http://localhost:3131")
const MOCK_AUTH_ENABLED = process.env.NEXT_PUBLIC_ALLOW_MOCK_AUTH === "true"

interface LoginResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
  expiresAt: number
  redirect?: string
  system?: string
  portal?: string
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

export async function loginUser(email: string, password: string, systemType: string = "admin"): Promise<LoginResponse> {
  // Real backend first (always attempted)
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, system_type: systemType }),
    })
    if (res.ok) return res.json()
  } catch {}

  // Mock fallback — only when explicitly enabled (never for demo/production)
  if (!MOCK_AUTH_ENABLED) throw new Error("Invalid credentials")

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
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const data = await res.json()
      return data.user || data
    }
  } catch {}

  if (!MOCK_AUTH_ENABLED) throw new Error("Registration unavailable")
  await new Promise((r) => setTimeout(r, 800))
  const email = payload.email.toLowerCase()
  if (MOCK_USERS[email]) throw new Error("Email already registered")
  MOCK_USERS[email] = { password: payload.password, name: payload.name }
  return createMockUser(email, payload.name)
}

export async function refreshAccessToken(refreshToken: string): Promise<LoginResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
    if (res.ok) return res.json()
  } catch {}

  if (!MOCK_AUTH_ENABLED) throw new Error("Session expired")
  await new Promise((r) => setTimeout(r, 300))
  return {
    user: createMockUser("admin@meterverse.com", "Admin User"),
    accessToken: `mv_access_${btoa(JSON.stringify({ sub: "1", email: "admin@meterverse.com", role: "admin" }))}`,
    refreshToken: `mv_refresh_${crypto.randomUUID?.() || Date.now()}`,
    expiresAt: Date.now() + 3600000,
  }
}

export async function logoutUser(refreshToken?: string, accessToken?: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ refreshToken }),
    })
  } catch {}
}
