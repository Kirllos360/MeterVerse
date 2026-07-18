export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface ApiRequestConfig {
  method: HttpMethod
  path: string
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
  timeout?: number
  signal?: AbortSignal
}

export interface ApiResponse<T = unknown> {
  data: T
  status: number
  timestamp: string
}

export interface ApiError {
  message: string
  status: number
  code?: string
  details?: unknown
}

export class ApiClient {
  private baseUrl = "/api/v1"
  private accessToken: string | null = null

  setBaseUrl(url: string) {
    this.baseUrl = url
  }

  setAccessToken(token: string | null) {
    this.accessToken = token
  }

  async request<T = unknown>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}${config.path}`, window.location.origin)
    if (config.params) {
      Object.entries(config.params).forEach(([k, v]) => {
        if (v !== undefined) url.searchParams.set(k, String(v))
      })
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...config.headers,
    }
    if (this.accessToken) headers["Authorization"] = `Bearer ${this.accessToken}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || 30000)

    try {
      const response = await fetch(url.toString(), {
        method: config.method,
        headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: config.signal || controller.signal,
        credentials: "include",
      })
      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        throw {
          message: data.message || data.error || "Unknown error",
          status: response.status,
          code: data.code,
          details: data.details,
        } as ApiError
      }

      return { data, status: response.status, timestamp: new Date().toISOString() }
    } catch (error) {
      clearTimeout(timeoutId)
      if (error && typeof error === "object" && "status" in error) throw error
      throw {
        message: error instanceof Error ? error.message : "Network error",
        status: 0,
      } as ApiError
    }
  }

  get<T>(path: string, params?: ApiRequestConfig["params"]) {
    return this.request<T>({ method: "GET", path, params })
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>({ method: "POST", path, body })
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>({ method: "PUT", path, body })
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>({ method: "PATCH", path, body })
  }

  delete<T>(path: string) {
    return this.request<T>({ method: "DELETE", path })
  }
}

export const apiClient = new ApiClient()
