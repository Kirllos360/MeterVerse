/* ── MeterVerse API Client ──
   The ONLY place fetch() may appear in the codebase.
   Everything goes through this client.                  */

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestConfig {
  method: HttpMethod;
  path: string;
  body?: unknown;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  timeoutMs?: number;
  retries?: number;
  signal?: AbortSignal;
}

interface ApiClientOptions {
  baseUrl: string;
  getToken?: () => string | null;
  onTokenRefresh?: () => Promise<string | null>;
  defaultTimeoutMs?: number;
  defaultRetries?: number;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiClient {
  private baseUrl: string;
  private getToken: () => string | null;
  private onTokenRefresh?: () => Promise<string | null>;
  private defaultTimeoutMs: number;
  private defaultRetries: number;

  constructor(opts: ApiClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, "");
    this.getToken = opts.getToken || (() => null);
    this.onTokenRefresh = opts.onTokenRefresh;
    this.defaultTimeoutMs = opts.defaultTimeoutMs ?? 15000;
    this.defaultRetries = opts.defaultRetries ?? 1;
  }

  async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const { method, path, body, params, headers: extraHeaders, timeoutMs, retries, signal: externalSignal } = config;
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs ?? this.defaultTimeoutMs);
    const signal = externalSignal ? anySignal(externalSignal, controller.signal) : controller.signal;

    const attempts = (retries ?? this.defaultRetries) + 1;
    let lastError: unknown;

    for (let i = 0; i < attempts; i++) {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json", ...extraHeaders };
        const token = this.getToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(url.toString(), {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal,
        });

        clearTimeout(timeout);

        if (res.status === 401 && this.onTokenRefresh) {
          const newToken = await this.onTokenRefresh();
          if (newToken) {
            headers["Authorization"] = `Bearer ${newToken}`;
            const retryRes = await fetch(url.toString(), { method, headers, body: body ? JSON.stringify(body) : undefined, signal });
            return this.parseResponse<T>(retryRes);
          }
        }

        return this.parseResponse<T>(res);
      } catch (err) {
        clearTimeout(timeout);
        lastError = err;
        if (err instanceof DOMException && err.name === "AbortError") throw new ApiError(0, "TIMEOUT", "Request timed out");
        if (i < attempts - 1) await sleep(Math.min(1000 * Math.pow(2, i), 8000));
      }
    }

    throw lastError instanceof ApiError ? lastError : new ApiError(0, "NETWORK", "Network request failed", lastError);
  }

  private async parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
    if (res.status === 204) return { data: undefined as T, status: res.status, headers: res.headers };
    const body = await res.json();
    if (!res.ok) throw new ApiError(res.status, body.code || "ERROR", body.message || res.statusText, body.details);
    return { data: body as T, status: res.status, headers: res.headers };
  }

  get<T>(path: string, opts?: Partial<RequestConfig>) { return this.request<T>({ ...opts, method: "GET", path }); }
  post<T>(path: string, body?: unknown, opts?: Partial<RequestConfig>) { return this.request<T>({ ...opts, method: "POST", path, body }); }
  put<T>(path: string, body?: unknown, opts?: Partial<RequestConfig>) { return this.request<T>({ ...opts, method: "PUT", path, body }); }
  patch<T>(path: string, body?: unknown, opts?: Partial<RequestConfig>) { return this.request<T>({ ...opts, method: "PATCH", path, body }); }
  delete<T>(path: string, opts?: Partial<RequestConfig>) { return this.request<T>({ ...opts, method: "DELETE", path }); }
}

function anySignal(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const s of signals) { if (s.aborted) { controller.abort(s.reason); return controller.signal; } s.addEventListener("abort", () => controller.abort(s.reason), { once: true }); }
  return controller.signal;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ── Singleton instance ── */
export const api = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  defaultTimeoutMs: 15000,
  defaultRetries: 1,
});
