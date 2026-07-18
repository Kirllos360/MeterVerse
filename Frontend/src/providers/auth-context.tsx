"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import { create } from "zustand"

interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const useAuthStore = create<AuthState>((set) => ({
  user: { id: "1", email: "admin@meterverse.com", name: "Admin User", role: "admin" },
  isAuthenticated: true,
  login: async (_email: string, _password: string) => {
    set({ user: { id: "1", email: _email, name: "Admin User", role: "admin" }, isAuthenticated: true })
    return true
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}))

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const store = useAuthStore()
  const value = useMemo(() => store, [store])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
