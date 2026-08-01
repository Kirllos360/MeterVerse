"use client"

import { useAuthRuntime } from "@/identity/auth/AuthRuntime"
import { useEffect } from "react"

// P45: dev auto-login must be explicit. Only auto-authenticate as the dev
// super_admin when NEXT_PUBLIC_ALLOW_DEV_AUTH=true (local development).
// Enterprise demo / production: real login only.
const DEV_AUTH_ENABLED = process.env.NEXT_PUBLIC_ALLOW_DEV_AUTH === "true"

const USER = { id: "dev-user", email: "admin@meterverse.com", name: "Admin User", role: "super_admin", permissions: ["read", "write", "delete", "admin", "export", "approve", "all"], area: "main", project: "main", tenant: "main", language: "en", theme: "adaptive", mfaEnabled: false }
const TOKENS = { accessToken: "dev-token-" + Date.now(), refreshToken: "dev-refresh-" + Date.now(), expiresAt: Date.now() + 86400000 }

export function DevAuthInit() {
  const { isAuthenticated } = useAuthRuntime()
  useEffect(() => {
    if (DEV_AUTH_ENABLED && !isAuthenticated && typeof window !== "undefined") {
      localStorage.setItem("mv-identity", JSON.stringify({ state: { user: USER, tokens: TOKENS } }))
      useAuthRuntime.setState({ user: USER, tokens: TOKENS, isAuthenticated: true, isLoading: false })
    }
  }, [isAuthenticated])
  return null
}
