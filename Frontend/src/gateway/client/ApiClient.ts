import { useAuthRuntime } from "@/identity/auth/AuthRuntime"

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface ApiRequest {
  method: HttpMethod
  path: string
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
  timeout?: number
  retries?: number
  cache?: boolean
  cacheTTL?: number
  idempotent?: boolean
  signal?: AbortSignal
  area?: string
  project?: string
}

export interface ApiResponse<T = unknown> {
  data: T
  status: number
  headers: Headers
  duration: number
  timestamp: string
}

export interface ApiError {
  message: string
  status: number
  code?: string
  details?: unknown
  timestamp: string
}

export class ApiClient {
  private baseUrl = "/api/v1"
  private inflightRequests = new Map<string, Promise<ApiResponse>>()
  private retryCount = 3
  private retryDelay = 1000
  private defaultTimeout = 30000

  setBaseUrl(url: string) { this.baseUrl = url }
  setRetryConfig(count: number, delay: number) { this.retryCount = count; this.retryDelay = delay }

  async request<T = unknown>(config: ApiRequest): Promise<ApiResponse<T>> {
    const cacheKey = `${config.method}:${config.path}:${JSON.stringify(config.params || {})}`

    // Deduplicate inflight GET requests
    if (config.method === "GET") {
      const inflight = this.inflightRequests.get(cacheKey)
      if (inflight) return inflight as Promise<ApiResponse<T>>
    }

    const request = this.execute<T>(config, cacheKey)
    if (config.method === "GET") {
      this.inflightRequests.set(cacheKey, request)
      request.finally(() => this.inflightRequests.delete(cacheKey))
    }

    return request
  }

  private async execute<T>(config: ApiRequest, cacheKey: string): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}${config.path}`, window.location.origin)
    if (config.params) {
      Object.entries(config.params).forEach(([k, v]) => {
        if (v !== undefined) url.searchParams.set(k, String(v))
      })
    }

    const auth = useAuthRuntime.getState()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Correlation-ID": crypto.randomUUID(),
      "X-Client-Version": "8.0.0",
      ...config.headers,
    }
    if (auth.tokens?.accessToken) headers["Authorization"] = `Bearer ${auth.tokens.accessToken}`
    if (config.area) headers["X-Area-ID"] = config.area
    if (config.project) headers["X-Project-ID"] = config.project
    if (config.idempotent) headers["Idempotency-Key"] = crypto.randomUUID()

    let lastError: ApiError | null = null
    const maxRetries = config.retries ?? this.retryCount
    const startTime = performance.now()

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), config.timeout || this.defaultTimeout)

        const response = await fetch(url.toString(), {
          method: config.method,
          headers,
          body: config.body ? JSON.stringify(config.body) : undefined,
          signal: config.signal || controller.signal,
          credentials: "include",
        })
        clearTimeout(timeoutId)

        const duration = Math.round(performance.now() - startTime)
        const data = await response.json()

        if (response.status === 401 && auth.tokens?.accessToken) {
          const refreshed = await this.refreshToken()
          if (refreshed) {
            headers["Authorization"] = `Bearer ${useAuthRuntime.getState().tokens?.accessToken}`
            continue
          }
          throw { message: "Session expired", status: 401, timestamp: new Date().toISOString() } as ApiError
        }

        if (!response.ok) {
          throw {
            message: data.message || data.error || `Request failed with status ${response.status}`,
            status: response.status,
            code: data.code,
            details: data.details,
            timestamp: new Date().toISOString(),
          } as ApiError
        }

        return { data, status: response.status, headers: response.headers, duration, timestamp: new Date().toISOString() }
      } catch (error) {
        const duration = Math.round(performance.now() - startTime)
        lastError = this.normalizeError(error, duration)

        if (attempt < maxRetries && this.isRetryable(lastError)) {
          await new Promise((r) => setTimeout(r, this.retryDelay * Math.pow(2, attempt)))
          continue
        }
        throw lastError
      }
    }
    throw lastError!
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const auth = useAuthRuntime.getState()
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: auth.tokens?.refreshToken }),
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        auth.updateTokens(data.tokens)
        return true
      }
    } catch {}
    return false
  }

  private isRetryable(error: ApiError): boolean {
    if (error.status >= 500) return true
    if (error.status === 429) return true
    if (error.status === 0) return true
    return false
  }

  private normalizeError(error: unknown, duration: number): ApiError {
    if ((error as ApiError).status) return error as ApiError
    if (error instanceof DOMException && error.name === "AbortError") {
      return { message: "Request timed out", status: 408, timestamp: new Date().toISOString() }
    }
    if (error instanceof TypeError) {
      return { message: "Network error — check your connection", status: 0, timestamp: new Date().toISOString() }
    }
    return {
      message: error instanceof Error ? error.message : "Unknown error",
      status: 0,
      timestamp: new Date().toISOString(),
    }
  }

  // Convenience methods
  get<T>(path: string, params?: ApiRequest["params"], config?: Partial<ApiRequest>) {
    return this.request<T>({ method: "GET", path, params, ...config })
  }
  post<T>(path: string, body?: unknown, config?: Partial<ApiRequest>) {
    return this.request<T>({ method: "POST", path, body, ...config })
  }
  put<T>(path: string, body?: unknown, config?: Partial<ApiRequest>) {
    return this.request<T>({ method: "PUT", path, body, ...config })
  }
  patch<T>(path: string, body?: unknown, config?: Partial<ApiRequest>) {
    return this.request<T>({ method: "PATCH", path, body, ...config })
  }
  delete<T>(path: string, config?: Partial<ApiRequest>) {
    return this.request<T>({ method: "DELETE", path, ...config })
  }
}

export const apiClient = new ApiClient()
