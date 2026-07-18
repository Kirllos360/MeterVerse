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
  restoreSession: () => boolean
  setUser: (user: AuthUser) => void
  updateTokens: (tokens: TokenSet) => void
  clearError: () => void
  isLocked: () => boolean
  remainingLockout: () => number
}

const DEFAULT_USER: AuthUser = {
  id: "1",
  email: "admin@meterverse.com",
  name: "Admin User",
  role: "admin",
  permissions: ["read", "write", "delete", "admin", "export", "approve"],
  area: "October",
  project: "Phase 1",
  tenant: "Palm Hills",
  language: "en",
  theme: "adaptive",
  mfaEnabled: false,
}

export const useAuthRuntime = create<AuthState>((set, get) => ({
  user: DEFAULT_USER,
  tokens: null,
  isAuthenticated: true,
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

    await new Promise((r) => setTimeout(r, 800))

    if (email === "admin@meterverse.com" && password === "admin") {
      set({
        user: { ...DEFAULT_USER, email },
        isAuthenticated: true,
        isLoading: false,
        loginAttempts: 0,
        lockedUntil: null,
        rememberDevice: remember,
        tokens: { accessToken: "mock-token", refreshToken: "mock-refresh", expiresAt: Date.now() + 3600000 },
      })
      return true
    }

    const newAttempts = loginAttempts + 1
    if (newAttempts >= 5) {
      set({ loginAttempts: newAttempts, lockedUntil: Date.now() + 300000, isLoading: false, error: "Account locked for 5 minutes." })
    } else {
      set({ loginAttempts: newAttempts, isLoading: false, error: `Invalid credentials. ${5 - newAttempts} attempts remaining.` })
    }
    return false
  },

  logout: () => {
    set({ user: null, tokens: null, isAuthenticated: false, loginAttempts: 0, lockedUntil: null })
  },

  refreshSession: async () => {
    await new Promise((r) => setTimeout(r, 300))
    const { tokens, user } = get()
    if (!tokens || !user) return false
    set({ tokens: { ...tokens, expiresAt: Date.now() + 3600000 } })
    return true
  },

  restoreSession: () => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("mv-identity") : null
    if (stored) {
      try {
        const data = JSON.parse(stored)
        if (data.state?.user && data.state?.tokens) {
          const { tokens } = data.state
          if (tokens.expiresAt > Date.now()) {
            set({ user: data.state.user, tokens, isAuthenticated: true })
            return true
          }
        }
      } catch {}
    }
    return false
  },

  setUser: (user) => set({ user }),
  updateTokens: (tokens) => set({ tokens }),
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
