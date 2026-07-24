const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

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
  // Dev mode: use mock token if no real auth
  const stored = localStorage.getItem("mv-identity")
  if (!stored) {
    // Check for dev bypass token
    const devToken = localStorage.getItem("mv-dev-token")
    if (devToken) return { Authorization: `Bearer ${devToken}` }
    return {}
  }
  try {
    const { state } = JSON.parse(stored)
    if (state?.tokens?.accessToken) {
      return { Authorization: `Bearer ${state.tokens.accessToken}` }
    }
  } catch {}
  return {}
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit & { useAuth?: boolean }
): Promise<T> {
  const { useAuth = true, ...fetchOptions } = options || {}
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
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
export async function apiBackend<T>(
  path: string,
  options?: RequestInit & { useAuth?: boolean }
): Promise<T> {
  const { useAuth = true, ...fetchOptions } = options || {}

  if (process.env.NEXT_PUBLIC_API_URL) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (useAuth) {
      Object.assign(headers, getAuthHeaders())
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
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

  // Fall back to local BFF route handler
  return apiClient<T>(path, { ...fetchOptions, useAuth })
}
