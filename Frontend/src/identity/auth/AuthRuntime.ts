import { create } from "zustand"

export interface AuthUser {
  id: string
  email: string
  name: string
  nameAr?: string
  role: string
  permissions: string[]
  area: string
  project: string
  tenant: string
  language: string
  theme: string
  avatar?: string
  mfaEnabled: boolean
}

interface TokenSet {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

interface AuthState {
  user: AuthUser | null
  tokens: TokenSet | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  loginAttempts: number
  lockedUntil: number | null
  rememberDevice: boolean

  login: (email: string, password: string, remember?: boolean) => Promise<boolean>
  logout: () => void
  refreshSession: () => Promise<boolean>
  restoreSession: () => Promise<boolean>
  updateTokens: (tokens: TokenSet) => void
  setUser: (user: AuthUser) => void
  clearError: () => void
  isLocked: () => boolean
  remainingLockout: () => number
}

export const useAuthRuntime = create<AuthState>((set, get) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginAttempts: 0,
  lockedUntil: null,
  rememberDevice: false,

  login: async (email: string, password: string, remember = false) => {
    set({ isLoading: true, error: null })

    const { loginAttempts, lockedUntil } = get()
    if (lockedUntil && lockedUntil > Date.now()) {
      set({ isLoading: false, error: "Account locked. Try again later." })
      return false
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Authentication failed")
      }

      const data = await res.json()
      const tokens = { accessToken: data.accessToken, refreshToken: data.refreshToken, expiresAt: data.expiresAt }

      set({
        user: data.user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        loginAttempts: 0,
        lockedUntil: null,
        rememberDevice: remember,
      })

      if (remember) {
        try { localStorage.setItem("mv-identity", JSON.stringify({ state: { user: data.user, tokens } })) } catch {}
      }

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed"
      const newAttempts = get().loginAttempts + 1
      if (newAttempts >= 5) {
        set({ loginAttempts: newAttempts, lockedUntil: Date.now() + 300000, isLoading: false, error: "Account locked for 5 minutes." })
      } else {
        set({ loginAttempts: newAttempts, isLoading: false, error: `Invalid credentials. ${5 - newAttempts} attempts remaining.` })
      }
      return false
    }
  },

  logout: async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }) } catch {}
    set({ user: null, tokens: null, isAuthenticated: false, loginAttempts: 0, lockedUntil: null, error: null })
    try { localStorage.removeItem("mv-identity") } catch {}
  },

  refreshSession: async () => {
    const { tokens, user } = get()
    if (!tokens?.refreshToken || !user) return false
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          set({ user: data.user, isAuthenticated: true })
          return true
        }
      }
    } catch {}
    return false
  },

  restoreSession: async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          set({ user: data.user, isAuthenticated: true })
          return true
        }
      }
    } catch {}

    const stored = typeof window !== "undefined" ? localStorage.getItem("mv-identity") : null
    if (stored) {
      try {
        const data = JSON.parse(stored)
        if (data.state?.user && data.state?.tokens?.expiresAt > Date.now()) {
          set({ user: data.state.user, tokens: data.state.tokens, isAuthenticated: true })
          return true
        }
      } catch {}
    }
    return false
  },

  updateTokens: (tokens) => set({ tokens }),
  setUser: (user) => set({ user }),
  clearError: () => set({ error: null }),
  isLocked: () => {
    const { lockedUntil } = get()
    return lockedUntil !== null && lockedUntil > Date.now()
  },
  remainingLockout: () => {
    const { lockedUntil } = get()
    if (!lockedUntil) return 0
    return Math.max(0, Math.ceil((lockedUntil - Date.now()) / 60000))
  },
}))
