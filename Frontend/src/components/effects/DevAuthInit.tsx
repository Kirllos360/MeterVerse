"use client"

import { useAuthRuntime } from "@/identity/auth/AuthRuntime"
import { useEffect } from "react"

const USER = { id: "dev-user", email: "admin@meterverse.com", name: "Admin User", role: "super_admin", permissions: ["read", "write", "delete", "admin", "export", "approve", "all"], area: "main", project: "main", tenant: "main", language: "en", theme: "adaptive", mfaEnabled: false }
const TOKENS = { accessToken: "dev-token-" + Date.now(), refreshToken: "dev-refresh-" + Date.now(), expiresAt: Date.now() + 86400000 }

export function DevAuthInit() {
  const { isAuthenticated } = useAuthRuntime()
  useEffect(() => {
    if (!isAuthenticated && typeof window !== "undefined") {
      localStorage.setItem("mv-identity", JSON.stringify({ state: { user: USER, tokens: TOKENS } }))
      useAuthRuntime.setState({ user: USER, tokens: TOKENS, isAuthenticated: true, isLoading: false })
    }
  }, [isAuthenticated])
  return null
}
