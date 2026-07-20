"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AmbientBackground } from "@/components/effects/AmbientBackground"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    if (email === "admin@meterverse.com" && password === "admin") {
      setSuccess(true)
      setTimeout(() => { window.location.href = "/admin/dashboard" }, 800)
    } else {
      setError("Invalid credentials. Use: admin@meterverse.com / admin")
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center relative" style={{ backgroundColor: "var(--admin-background)" }}>
        <AmbientBackground />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--admin-accent)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Access Granted</h2>
          <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>Redirecting to admin dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen relative" style={{ backgroundColor: "var(--admin-background)" }}>
      <AmbientBackground />
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-16 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: "var(--admin-accent)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">MeterVerse Admin</h1>
          <p className="text-sm mb-8" style={{ color: "var(--admin-text-muted)" }}>Enterprise Administration Platform</p>
          <div className="space-y-3 text-xs" style={{ color: "var(--admin-text-dim)" }}>
            <p>🔐 Authorized administrators only.</p>
            <p>📋 All access is monitored and logged.</p>
            <p className="pt-4" style={{ color: "rgba(var(--brand-rgb),0.5)" }}>
              Demo: admin@meterverse.com / admin
            </p>
          </div>
        </motion.div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--admin-accent)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span className="text-sm font-bold text-white">Admin Center</span>
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">Administrator Login</h2>
          <p className="text-xs mb-6" style={{ color: "var(--admin-text-muted)" }}>Sign in to the administration platform</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Administrator email" required autoFocus
              className="w-full px-3 py-3 rounded-lg border text-sm outline-none transition-all focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[rgba(var(--brand-rgb),0.2)]"
              style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)" }} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" required
              className="w-full px-3 py-3 rounded-lg border text-sm outline-none transition-all focus:border-[var(--admin-accent)]"
              style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-surface)", color: "var(--admin-text)" }} />
            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg text-xs" style={{ backgroundColor: "rgba(var(--brand-rgb),0.1)", color: "var(--admin-accent)" }}>
                {error}
              </motion.div>
            )}
            <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full py-3 rounded-lg text-sm font-medium text-white transition-all"
              style={{ backgroundColor: isLoading ? "rgba(var(--brand-rgb),0.5)" : "var(--admin-accent)" }}>
              {isLoading ? <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" opacity="0.25"/><path d="M12 2a10 10 0 019.95 9" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                Authenticating...
              </span> : "Sign In"}
            </motion.button>
          </form>
          <div className="mt-6 pt-4 text-center" style={{ borderTop: "1px solid var(--admin-border)" }}>
            <p className="text-[10px]" style={{ color: "var(--admin-text-dim)" }}>
              Unauthorized access is prohibited. All activities are monitored.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}


