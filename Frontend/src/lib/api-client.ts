import { useAuthRuntime } from "@/identity/auth/AuthRuntime"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.PORTAL_MODE === "1" ? "http://localhost:3003" : "http://localhost:3131")
const BASE_URL = "/api"

interface ApiError {
  status: number
  message: string
  data?: unknown
}

export class ApiClientError extends Error {
  status: number
  data?: unknown
  constructor(err: ApiError) {
    super(err.message)
    this.name = "ApiClientError"
    this.status = err.status
    this.data = err.data
  }
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {}
  // 1) In-memory auth store (works whether or not "Remember" was checked).
  try {
    const t = useAuthRuntime.getState().tokens?.accessToken
    if (t) return { Authorization: `Bearer ${t}` }
  } catch {}
  // 2) Persisted identity (Remember this device).
  const stored = localStorage.getItem("mv-identity")
  if (stored) {
    try {
      const { state } = JSON.parse(stored)
      if (state?.tokens?.accessToken) {
        return { Authorization: `Bearer ${state.tokens.accessToken}` }
      }
    } catch {}
  }
  // 3) Dev bypass token (gated).
  const devToken = localStorage.getItem("mv-dev-token")
  if (devToken) return { Authorization: `Bearer ${devToken}` }
  return {}
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit & { useAuth?: boolean }
): Promise<T> {
  const { useAuth = true, ...fetchOptions } = options || {}
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Dev-Mode": "true",
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (useAuth) {
    Object.assign(headers, getAuthHeaders())
  }

  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`

  const res = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: "include",
  })

  if (!res.ok) {
    let data: unknown
    try { data = await res.json() } catch {}
    throw new ApiClientError({
      status: res.status,
      message: (data as { error?: string })?.error || `API error: ${res.status}`,
      data,
    })
  }

  return res.json() as Promise<T>
}

// Backend proxy: calls either the BFF route handler or direct backend URL
// Automatically includes location context (areaId/projectId) from admin store
function getLocationQuery(): string {
  if (typeof window === "undefined") return ""
  try {
    const stored = localStorage.getItem("admin-store")
    if (!stored) return ""
    const { state } = JSON.parse(stored)
    const area = state?.location?.selectedArea
    const project = state?.location?.selectedProject
    const params = new URLSearchParams()
    if (area) params.set("areaId", area)
    if (project?.id) params.set("projectId", project.id)
    return params.toString()
  } catch { return "" }
}

export async function apiBackend<T>(
  path: string,
  options?: RequestInit & { useAuth?: boolean }
): Promise<T> {
  const { useAuth = true, ...fetchOptions } = options || {}
  // Append location context to GET requests
  const isGet = !fetchOptions.method || fetchOptions.method === "GET"
  const locQuery = isGet ? getLocationQuery() : ""
  const separator = path.includes("?") ? "&" : "?"
  // P51: apiBackend targets the MeterVerse OS backend directly. Normalize so the
  // backend's /api surface is always hit (BFF handlers pass "/admin/users" etc.).
  const normalized = path.startsWith("/api/") ? path : path.startsWith("/") ? `/api${path}` : path
  const finalPath = locQuery ? `${normalized}${separator}${locQuery}` : normalized

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Dev-Mode": "true",
  }
  if (useAuth) {
    Object.assign(headers, getAuthHeaders())
  }
  const res = await fetch(`${BACKEND_URL}${finalPath}`, {
    ...fetchOptions,
    headers,
  })
  if (!res.ok) {
    throw new ApiClientError({
      status: res.status,
      message: `Backend error: ${res.status}`,
    })
  }
  return res.json() as Promise<T>
}
