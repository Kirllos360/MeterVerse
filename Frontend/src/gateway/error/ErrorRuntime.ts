import { create } from "zustand"

export interface NormalizedError {
  message: string
  status: number
  code: string
  retryable: boolean
  timestamp: string
}

interface ErrorState {
  lastError: NormalizedError | null
  errorHistory: NormalizedError[]
  rateLimitReset: number | null
  normalize: (error: unknown) => NormalizedError
  clear: () => void
  getRecent: (count?: number) => NormalizedError[]
}

export const errorMessages: Record<number, string> = {
  400: "The request was invalid. Please check your input.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "A conflict occurred. The resource may have been modified.",
  422: "The submitted data could not be processed.",
  429: "Too many requests. Please wait before trying again.",
  500: "An internal server error occurred. Please try again later.",
  502: "The upstream service is unavailable.",
  503: "The service is temporarily unavailable.",
  504: "The request timed out waiting for the upstream service.",
}

export const useErrorRuntime = create<ErrorState>((set, get) => ({
  lastError: null,
  errorHistory: [],
  rateLimitReset: null,

  normalize: (error: unknown): NormalizedError => {
    const err = error as { message?: string; status?: number; code?: string; timestamp?: string }
    const status = err.status || 0
    const message = err.message || errorMessages[status] || "An unexpected error occurred."
    const code = err.code || `ERR_${status}`
    const retryable = status >= 500 || status === 429 || status === 0

    const normalized: NormalizedError = {
      message,
      status,
      code,
      retryable,
      timestamp: new Date().toISOString(),
    }

    set((s) => ({
      lastError: normalized,
      errorHistory: [normalized, ...s.errorHistory].slice(0, 50),
      rateLimitReset: status === 429 ? Date.now() + 60000 : s.rateLimitReset,
    }))

    return normalized
  },

  clear: () => set({ lastError: null, errorHistory: [] }),
  getRecent: (count = 5) => get().errorHistory.slice(0, count),
}))
